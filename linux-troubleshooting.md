# Networking & Linux Deep Dive Notes
*Amazon L4 Sys Dev — know the why, not just the what.*

---

## NETWORKING

### N-01 DNS — Domain Name System

#### DNS Resolution Flow

```
[Browser] → check local cache → [OS Cache] → miss → [Recursive Resolver] (ISP/Google 8.8.8.8)
    ↓
[Root Server] → "ask .com TLD" → [TLD Server] → "ask amazon.com NS" → [Authoritative NS]
    ↓
IP returned → cached with TTL → browser connects
```

---

**"User reports the website is unreachable. You suspect DNS. How do you verify and fix it?"**

1. `nslookup amazon.com` or `dig amazon.com` — does it resolve to an IP? If it returns `NXDOMAIN` or times out, DNS is broken.
2. `dig amazon.com @8.8.8.8` — query Google's DNS directly. If this works but the default doesn't, the issue is in the local or ISP resolver, not the authoritative DNS.
3. Check `/etc/resolv.conf` — is the right nameserver configured? A misconfigured server after a deployment is a very common cause of sudden DNS failures.
4. Check TTL — if a DNS record was recently changed, old entries may still be cached. `dig amazon.com | grep TTL` shows how long the cache will persist.
5. On Linux, flush the DNS cache: `systemd-resolve --flush-caches` to force fresh lookups.

> **Amazon tip:** Say "I always test with `dig @8.8.8.8` to separate local resolver issues from authoritative DNS issues." That one sentence shows real debugging instinct.

---

**"What's the difference between A record, CNAME, and MX record?"**

| Record | Description |
|--------|-------------|
| **A RECORD** | Maps a domain directly to an IPv4 address. `api.amazon.com → 54.23.1.5`. The fundamental record — everything ends here eventually. |
| **CNAME** | Maps a domain to another domain name, not an IP. `www → api.amazon.com`. Used for aliases. The browser then resolves the target domain to an IP separately. |
| **MX RECORD** | Mail exchange — tells email servers where to deliver email for this domain. Points to a hostname, not an IP. Priority value determines which server is tried first. |
| **TTL** | Time To Live — how long DNS resolvers cache this record. Low TTL (60s) = changes propagate fast but more DNS queries. High TTL (86400s) = less load but slow propagation. Before a change, lower TTL first. |

---

**"You updated a DNS record but users still see the old IP 2 hours later. Why?"**

TTL caching. The old record had a long TTL — resolvers across the internet cached it and won't re-query until the TTL expires. The fix going forward: before any DNS change, lower the TTL to 60 seconds at least 24 hours in advance. After the change propagates, raise TTL back. Two hours later isn't unusual — some ISP resolvers ignore TTL and cache longer than they should. You can verify with `dig +trace domain.com` to see the full resolution path.

> **Never say:** "I'll just change the DNS record." Without lowering TTL first, propagation can take hours. Always lower TTL before making DNS changes.

**Commands:**
```bash
dig amazon.com
dig @8.8.8.8 amazon.com
dig +trace amazon.com
nslookup amazon.com
cat /etc/resolv.conf
systemd-resolve --flush-caches
dig amazon.com MX
```

---

### N-02 TCP Handshake & Connection Lifecycle

#### TCP 3-Way Handshake

```
Client ──── SYN ──────────────────────────► Server   "I want to connect"
Client ◄─── SYN-ACK ────────────────────── Server   "OK, I'm ready, confirm"
Client ──── ACK ──────────────────────────► Server   "Confirmed. Send data."

Connection established. Data flows. Then:

Client ──── FIN ──────────────────────────► Server   "I'm done"
Client ◄─── FIN-ACK ────────────────────── Server   "Got it, I'm done too"

TIME_WAIT state: client waits ~60s before port fully freed
```

---

**"Explain the TCP handshake. Why does it need 3 steps and not 2?"**

Two steps only confirm the server received the client's request — but the client doesn't know if the server can actually send data back. The third step (ACK) confirms bidirectional communication works. Both sides now know they can send and receive. This is critical for reliability — TCP guarantees ordered, lossless delivery, so both sides must confirm readiness before data flows.

---

**"You see thousands of connections in SYN_WAIT state. What's happening?"**

SYN flood — either a DDoS attack or a misconfigured client sending SYNs without completing the handshake. The server allocates resources for each half-open connection and holds them until timeout. Enough of these exhausts the connection table and the server can't accept new legitimate connections. Mitigation: SYN cookies — server doesn't allocate state until the third ACK arrives, proving the client is real. Also: firewall rate-limiting on incoming SYNs per IP.

> **Amazon tip:** Mentioning SYN cookies shows you understand the attack surface, not just the happy path. That's exactly the depth L4 expects.

---

**"What's the difference between TCP and UDP? When would you use each?"**

| | TCP — RELIABLE | UDP — FAST |
|---|---|---|
| **Delivery** | Ordered delivery, retransmission on loss, congestion control | Fire and forget. No handshake, no retransmission. |
| **Overhead** | Higher | Lower latency |
| **Use for** | HTTP/S, databases, file transfer — anything where data integrity matters more than speed | Video streaming, gaming, DNS, VoIP — where a dropped packet is better than a delayed one |

At Amazon scale: internal service-to-service calls use TCP (correctness critical). Metrics and logs can tolerate UDP (losing a data point is fine, low overhead matters).

---

**"What is TIME_WAIT and why does it cause problems at scale?"**

After a connection closes, the client's side stays in `TIME_WAIT` for ~60 seconds (2×MSL) before the port is freed. This prevents delayed packets from a dead connection confusing a new one on the same port. The problem at scale: if a service makes millions of short-lived connections, it exhausts ephemeral ports (range 32768–60999). New connections fail with "Cannot assign requested address." Fix: enable `SO_REUSEADDR`, tune `net.ipv4.tcp_tw_reuse`, or use connection pooling to reuse persistent connections instead of opening new ones constantly.

**Commands:**
```bash
netstat -an | grep TIME_WAIT
ss -s
netstat -an | grep SYN_RECV
sysctl net.ipv4.tcp_tw_reuse
tcpdump -i eth0 port 80
ss -tuln
```

---

### N-03 HTTP Flow & Status Codes

#### Full HTTP Request Lifecycle

```
[Browser] → DNS lookup → TCP handshake → TLS handshake (HTTPS)
    → HTTP GET /api/resource → [Load Balancer] → [App Server] → [DB]
    ← 200 OK + JSON body ←─────────────────────────────────────

HTTP/1.1: one request per connection (keep-alive reuses)
HTTP/2:   multiplexed, many requests one connection
```

---

**"Walk me through exactly what happens when you type amazon.com and hit enter."**

1. Browser checks local DNS cache. Miss → queries OS resolver → queries recursive DNS → resolves to an IP via Root → TLD → Authoritative nameserver chain.
2. TCP 3-way handshake with the resolved IP on port 443 (HTTPS).
3. TLS handshake — server sends certificate, client verifies it, they agree on an encryption key (session key via asymmetric crypto). Now the connection is encrypted.
4. Browser sends HTTP GET request with headers (Host, User-Agent, Accept, Cookies).
5. Request hits load balancer → routed to an app server → app server queries DB or cache → builds response.
6. Server responds `200 OK` with HTML. Browser parses HTML, makes additional requests for CSS/JS/images (in parallel in HTTP/2). Page renders.

> **Amazon tip:** This is the most common interview question in networking. Practice saying this out loud in under 90 seconds. At L4 you need to know every step — especially the TLS handshake and load balancer layer.

---

**"What's the difference between HTTP/1.1 and HTTP/2?"**

HTTP/1.1 opens one connection per request (or reuses with keep-alive but still serializes). If you have 30 assets on a page, you queue them. HTTP/2 multiplexes — multiple requests and responses flow concurrently over a single connection. This eliminates the "head-of-line blocking" problem. HTTP/2 also compresses headers (HPACK) — headers are repetitive across requests, compression significantly reduces overhead. At Amazon scale, HTTP/2 is standard for browser-to-LB communication.

---

**"What do these status codes mean and when do you see them in production?"**

| Code | Meaning | Notes |
|------|---------|-------|
| `200 OK` / `201 Created` / `204 No Content` | Normal success | 204 means success but no response body — common for DELETE operations |
| `301 Moved Permanently` / `302 Found` | Redirects | 301 = permanent (client caches it forever). 302 = temporary (client re-checks each time). Wrong choice causes hard-to-debug caching issues |
| `400 Bad Request` | Client sent malformed data | — |
| `401 Unauthorized` | Not authenticated (no token) | Classic L4 distinction: 401 vs 403 |
| `403 Forbidden` | Authenticated but not permitted (wrong role) | Classic L4 distinction: 401 vs 403 |
| `404 Not Found` | Resource doesn't exist | — |
| `429 Too Many Requests` | Rate limited | Client should back off and retry with exponential delay |
| `500 Internal Server Error` | App crashed or threw unhandled exception | Issue is in your service itself |
| `502 Bad Gateway` | LB got bad response from backend | Issue is between LB and service |
| `503 Service Unavailable` | Backend is down or overloaded | Issue is between LB and service |
| `504 Gateway Timeout` | Backend took too long, LB timed out waiting | Issue is between LB and service |

> **Amazon tip:** In incident debugging: 502/503/504 means the issue is between the load balancer and your service. 500 means your service itself is broken. This distinction tells you where to look first.

**Commands:**
```bash
curl -I https://amazon.com
curl -v https://amazon.com
curl -w "%{http_code}" url
curl -w "%{time_total}" url
openssl s_client -connect host:443
wget --spider url
```

---

### N-04 Ports & Services — Know These Cold

| Port | Service | Notes |
|------|---------|-------|
| **22** | SSH | Secure shell. TCP. Always encrypted. |
| **25** | SMTP | Email sending. TCP. Often blocked. |
| **53** | DNS | UDP (queries) + TCP (zone transfers) |
| **80** | HTTP | Unencrypted web. TCP. |
| **443** | HTTPS | Encrypted web. TCP. TLS on top. |
| **3306** | MySQL | Should never be open to public. |
| **5432** | PostgreSQL | Internal only. |
| **6379** | Redis | Cache. Never expose publicly. |
| **8080** | HTTP Alt | Dev/proxy. Common app server port. |
| **9092** | Kafka | Message broker port. |
| **2181** | ZooKeeper | Kafka coordination layer. |
| **27017** | MongoDB | Internal only. Never public. |

---

**"You see port 3306 open on a production server facing the internet. What do you do?"**

That's a critical security finding — MySQL should never be internet-facing. Immediate action: block it at the firewall/security group level right now. Then investigate how it got exposed — was it a misconfigured deployment, a security group rule someone added manually, or a Terraform change? Check logs for any unauthorized connection attempts. File a security incident. Long-term: all DB ports should only be reachable from within the VPC, never from `0.0.0.0/0`.

> **Amazon tip:** At Amazon, exposing a DB port to the internet is a Sev-2 security incident. Knowing this immediately and saying "close the firewall rule first, investigate second" is the right instinct.

**Commands:**
```bash
netstat -tuln
ss -tuln
lsof -i :3306
nmap -p 22,80,443 host
nc -zv host 443
telnet host 22
```

---

### N-05 Load Balancers & VPC — Amazon Essentials

**"What's the difference between Layer 4 and Layer 7 load balancing?"**

**Layer 4 (transport)** — routes based on IP and port. Fast, no inspection of the content. Doesn't understand HTTP — just forwards TCP/UDP packets. Good for raw throughput.

**Layer 7 (application)** — understands HTTP. Can route based on URL path, headers, cookies. Can do SSL termination, sticky sessions, A/B routing. AWS ALB is Layer 7. NLB is Layer 4. At Amazon, ALB is the default for microservices because you need path-based routing (`/api` → service A, `/web` → service B).

---

**"A service is healthy but the load balancer keeps marking it unhealthy. What do you check?"**

1. Check what the health check is configured to hit — usually `/health`. Does that endpoint actually exist and return 200?
2. Check the health check timeout — if the app takes 800ms to respond and timeout is 500ms, it'll always fail even though the service is "up."
3. Check security group rules — the load balancer's health check IPs must be allowed to reach the service port. A security group blocking the LB is a very common misconfiguration.
4. Check if the health check is checking the right port — if the service moved to 8081 but the health check still checks 8080, it'll fail.

> **Amazon tip:** Security group blocking the LB health check is the #1 cause of "service is fine but LB says unhealthy." This comes up constantly at Amazon.

---

**"What is a VPC and why does it matter for security?"**

Virtual Private Cloud — a logically isolated network within AWS. Your resources (EC2, RDS, Lambda) run inside it, invisible to the public internet unless you explicitly expose them. Security groups act as per-instance firewalls (stateful — if you allow inbound, return traffic is automatic). NACLs act as subnet-level firewalls (stateless — you must explicitly allow both directions). Best practice: public subnet for load balancers, private subnet for app servers, isolated subnet for databases. DB never touches the public internet.

**Commands:**
```bash
aws elbv2 describe-target-health
curl -I http://service/health
aws ec2 describe-security-groups
traceroute host
mtr host
```

---

## LINUX DEEP DIVE

### L-01 Disk Full Scenarios

**"Disk is at 100%. A service just crashed. Walk me through exactly what you do, step by step."**

1. `df -h` — identify which partition is full. It might not be root (`/`) — could be `/var`, `/tmp`, or a separate data mount. Don't assume.
2. `du -sh /* 2>/dev/null | sort -rh | head -10` — find the top space consumers at root level. Sort by size descending.
3. Drill down: `du -sh /var/log/* | sort -rh | head -10`. Usually it's logs. Delete or compress old ones: `gzip old.log` or `truncate -s 0 huge.log` (safer than deleting an active file).
4. Check `/tmp` for core dumps: `find /tmp -name "core.*" -delete`. Core dumps are often gigabytes and go unnoticed.
5. `df -h` again to confirm space freed. Restart the crashed service. Verify it's healthy.
6. Long-term: set up `logrotate`, add a disk usage alert at 75%, schedule cleanup of core dumps.

> **Amazon tip:** Say "I truncate active log files instead of deleting them." Deleting a file that a process has open doesn't free space — the inode is held by the process. Truncating empties it while keeping the file handle valid.

---

**"df shows 45% used but writes are still failing with 'No space left'. Why?"**

Inode exhaustion. Disk space and inodes are two separate limits. Inodes are metadata slots — one per file. A partition can run out of inodes while still having disk space if it has millions of tiny files (temp files, queue files, cache entries). Check: `df -i` — if inode usage is at 100%, that's it. Fix: find and clean up tiny files: `find /var/spool -type f | wc -l` to count, then bulk delete.

> **Never say:** "The disk shows space so it must be something else." Always check inodes. `df -i` is your second command after `df -h`.

---

**"How do you find what's writing to disk so aggressively right now?"**

`iotop` — real-time disk I/O per process, like `top` for disk. Shows exactly which process is writing the most. If `iotop` isn't available: `iostat -x 2` shows device-level I/O every 2 seconds. `lsof | grep "REG" | sort -k7 -rn | head -20` shows the largest open files being written. Together these pinpoint the culprit process within 30 seconds.

**Commands:**
```bash
df -h
df -i
du -sh /* | sort -rh
truncate -s 0 file.log
find /tmp -name "core.*"
iotop
iostat -x 2
lsof +D /var/log
```

---

### L-02 Service Down Debugging

**"A critical service is down. Users are affected. Walk me through your full debug process."**

1. `systemctl status <service>` — is it running? If stopped, what was the last exit code? Did it crash or was it stopped manually?
2. `journalctl -u <service> -n 100 --no-pager` — last 100 log lines from systemd. Look for the error that caused the crash — scroll up from the crash point.
3. `tail -f /var/log/app/error.log` — application-level logs. Find the **first** error, not the last — first error is root cause, everything after is cascading failure.
4. Check resources: `free -h` (OOM?), `df -h` (disk full?), `top` (CPU spike?). Any of these can kill a service silently.
5. `dmesg | tail -50` — kernel messages. OOM killer, segfaults, hardware errors show up here even when the app has no logs.
6. Restart to restore service: `systemctl restart <service>`. Watch logs immediately after. If it crashes again within seconds, the fix isn't a restart — it's a config or dependency issue.

> **Amazon tip:** Always check `dmesg` when a service has no logs around its crash. The OOM killer leaves a fingerprint there even when the app never got a chance to log anything.

---

**"Service restarts but crashes again within 10 seconds every time. What does that tell you?"**

The problem is in startup — either a config file is wrong, a required dependency (DB, another service) isn't reachable, or the binary itself is broken. Check the logs in those first 10 seconds specifically. Common causes: missing environment variable, wrong DB connection string after a config change, port already in use (`lsof -i :8080`), or a failed dependency health check during boot. Fix the root cause — restarting in a loop just delays the inevitable.

---

**"How do you check if a service's dependency (e.g. the database) is reachable from that server?"**

- `ping <db-host>` — network reachable?
- `nc -zv db-host 5432` — is the PostgreSQL port open?
- `curl http://dep-service/health` — is the HTTP dependency responding?

If ping works but `nc` fails, the port is closed or firewall is blocking it. If `nc` works but the app can't connect, check credentials or SSL config. Test with the exact connection string the app uses if possible — not just "can I reach the host" but "can I connect as this user."

---

**"The service log shows 'Connection refused' to the database. It was working 5 minutes ago. What happened?"**

Three most likely causes: the DB process crashed or was restarted, the DB hit its max connection limit and is refusing new ones, or a network/security group rule changed. Check: `nc -zv db-host 5432` — if connection refused, DB is down or port is blocked. If it connects but app can't auth, credentials or SSL changed. For max connections: `SHOW max_connections` and `SELECT count(*) FROM pg_stat_activity` in PostgreSQL — if count equals max, the DB is out of slots and needs connection pooling (PgBouncer).

> **Never say:** "I'll restart the service." Restarting the app doesn't fix a DB that's out of connections — it just adds more failed connection attempts. Diagnose first.

**Commands:**
```bash
systemctl status svc
journalctl -u svc -n 100
systemctl restart svc
dmesg | tail -50
lsof -i :8080
nc -zv host port
free -h
strace -p <PID>
```

---

### L-03 High CPU Debugging

**"CPU is at 100% but traffic is completely normal. What do you do?"**

100% CPU with no traffic change is almost always a code or config bug — not load.

1. `top` → press `P` (sort by CPU) — find the PID at 100%. Is it your service or something else (a cron job, a monitoring agent)?
2. `ps aux | grep <PID>` — what is this process? How long has it been running?
3. `strace -p <PID> -c` — attach to the process and count system calls. If it's looping on a single syscall, you'll see it immediately. This tells you what the process is doing without reading source code.
4. Check if it correlates with a recent deployment — code change is the most likely cause. If yes, rollback immediately and investigate.
5. If it's a single thread pegged at 100% and others are fine: infinite loop or spin-lock. If all CPUs are high: parallel computation or a distributed deadlock causing retries.

> **Amazon tip:** `strace -p <PID> -c` is the power move. It shows you exactly what syscalls the process is spending time on without needing access to the source code. L4 engineers use this — L3 engineers don't know it exists.

---

**"CPU is high but top shows no single process above 10%. What's going on?"**

Aggregate load — many processes each using a small amount that adds up. Check the load average (`uptime` or `top` header) — if load average is 32 on a 4-core machine, you have 8x more work than the CPU can handle. Common cause: too many short-lived processes spawning rapidly (runaway fork, a script in a tight loop spawning subprocesses). Check with `ps aux | wc -l` — if process count is abnormally high, something is forking out of control.

---

**"CPU was high, you killed the process, it comes back and pegs CPU again. What now?"**

It's being restarted by a supervisor. Killing it is just resetting the symptom. Stop it at the source: `systemctl stop <service>`. Now CPU drops and stays down. Before restarting: check recent deployments (when did this start?), check for an infinite loop in the code triggered by a specific input, check if a dependent service is returning bad data that triggers retry storms. Fix the code or config, then restart properly.

---

**"What's the difference between CPU user%, sys%, and iowait% in top?"**

| Metric | Meaning | What to do |
|--------|---------|------------|
| `user% (us)` | Time CPU spends running your application code | High user% = your code is compute-heavy. Look for inefficient algorithms, tight loops, heavy computation. |
| `sys% (sy)` | Time CPU spends in kernel code on behalf of your app | High sys% = too many system calls — excessive file I/O, socket operations, context switching from too many threads. |
| `iowait% (wa)` | Time CPU is idle waiting for disk or network I/O to complete | High iowait = storage bottleneck or slow DB. CPU isn't busy but it can't do work because it's waiting for data. |
| `steal% (st)` | In VMs — time a hypervisor stole from your VM to give to another tenant | High steal% means the physical host is overloaded. You can't fix this — escalate to the cloud provider or move to a different host. |

> **Amazon tip:** This is a deep L4 question. Most candidates know `user%` and stop there. Knowing `iowait%` vs `sys%` vs `steal%` shows you've actually diagnosed real production systems.

**Commands:**
```bash
top   # press P
ps aux --sort=-%cpu
strace -p <PID> -c
uptime
mpstat 1
vmstat 1
perf top
ps aux | wc -l
```

---

### L-04 Memory Management & OOM Killer

**"A process was killed but there are no logs from the app. How do you find out what happened?"**

The OOM (Out of Memory) killer. When RAM is critically low, the Linux kernel picks a process and kills it instantly — no warning, no chance for the app to log. Check:

```bash
dmesg | grep -i "oom\|killed"
grep -i "oom" /var/log/syslog
```

The OOM killer entry shows exactly which process was killed and how much memory it was using. This is always the first place to check for mystery crashes with no app logs.

> **Amazon tip:** `dmesg | grep oom` is a command that immediately shows you understand Linux internals. If you say this in an interview, the interviewer knows you've debugged real production incidents.

---

**"What is swap and when is high swap usage a problem?"**

Swap is disk space used as overflow RAM — when physical RAM is full, the kernel moves inactive pages to swap (disk). Reading from swap is 100–1000x slower than RAM. High swap usage means the system is memory-constrained — everything slows down because the kernel is constantly swapping pages in and out. Check: `free -h` — if swap usage is climbing, you're heading toward OOM. Fix: add RAM, reduce memory per process, or find and fix the memory leak.

> **Never treat** "swap has headroom" as "memory is fine."

---

**"How do you check memory usage per process and find the leak?"**

- `ps aux --sort=-%mem | head -10` — top 10 memory consumers right now.
- `top` with `M` key — sort by memory live.
- For detailed breakdown of one process: `cat /proc/<PID>/status | grep -i vm` — shows `VmRSS` (physical RAM used), `VmSwap`, `VmPeak` (peak usage). A leak shows `VmRSS` growing over time without going down.
- To track it over time: `watch -n 5 "ps aux --sort=-%mem | head -5"` — refresh every 5 seconds and watch the trend.

**Commands:**
```bash
dmesg | grep -i oom
free -h
ps aux --sort=-%mem
cat /proc/<PID>/status
vmstat 1
watch -n5 free -h
swapon --show
```

---

### L-05 Permissions, Users & Security

**"A service that runs as user 'appuser' suddenly can't write to /var/log/app. It was working yesterday. What do you check?"**

1. `ls -ld /var/log/app` — who owns this directory? What are the permissions?
2. `id appuser` — what groups is appuser in? Does it match the directory's group?
3. Check if a recent deployment changed file ownership: `chown -R appuser:appuser /var/log/app` to fix. `chmod 755 /var/log/app` to ensure the directory is accessible.
4. Check disk space — a full disk also prevents writes with "Permission denied" in some cases. `df -h`.
5. Check SELinux/AppArmor if enabled: `ausearch -m avc -ts recent` — SELinux denials look exactly like permission errors but `chmod` won't fix them.

> **Never say:** `chmod`/`chown` and call it done. SELinux or AppArmor denials produce identical-looking errors but require different fixes. Always check audit logs if `chmod` doesn't solve it.

---

**"Explain setuid, setgid and when they're dangerous."**

Setuid on an executable means it runs as the file's owner (often root), regardless of who executes it. Example: `passwd` needs to write to `/etc/shadow` (root-owned), so it has setuid root. Dangerous because: if a setuid binary has a vulnerability, any user who runs it can exploit it to get root access. At Amazon, auditing setuid binaries is a security baseline:

```bash
find / -perm -4000 -type f 2>/dev/null
```

Any unexpected ones are a red flag.

**Commands:**
```bash
ls -la
id username
chown -R user:group dir
chmod 755 dir
find / -perm -4000
ausearch -m avc
getfacl file
```

---
