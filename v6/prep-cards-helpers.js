// ───── Per-problem prep-card helpers ─────
// Shared lookup layer for the per-problem interview-prep cards.
// Loaded by BOTH:
//   - tracker/index.html         (production renderer)
//   - tracker/prep-cards-tests.html (test harness)
// Classic script: top-level `const` bindings are visible to subsequent classic
// scripts in the same realm via the global declarative record. We additionally
// expose key symbols on `window` so the test harness's load-detection check
// (typeof window.normalizePrepKey === "function") and any console-callable
// diagnostics can find them.

// PROBLEM_PREP — keyed by canonical Grind 169 problem names; values are the
// six-field prep entry { pattern, insight, complexity, followup, clarify, edges }.
// Multi-item fields use ";" as a separator (rendered as <ul> in HTML and
// "- " lines in plain text). `complexity` follows the form
// "T: O(...) S: O(...)". Populated by content tasks (8.x).
const PROBLEM_PREP = {
  // ───── Arrays group (task 8.1) ─────
  "Two Sum": {
    pattern:    "Hash Map One-Pass — store complement → index while scanning.",
    insight:    "You only need to remember what you've seen, the answer is a single seen-before lookup.",
    complexity: "T: O(n) S: O(n)",
    followup:   "What if the array is sorted? (two-pointer, O(1) extra space); what if you need all pairs?",
    clarify:    "Exactly one solution guaranteed?; can the same index be used twice?; integer overflow on sum?",
    edges:      "Negative numbers; duplicates where target = 2*x; minimum-size array (n=2)"
  },
  "Best Time to Buy and Sell Stock": {
    pattern:    "Single-Pass Min-Tracking — track running min, profit = price minus min so far.",
    insight:    "The optimal sell day's best buy is the lowest price strictly before it, so one scan suffices.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Unlimited buy/sell?; with a transaction fee?; at most k transactions?",
    clarify:    "Can sell same day as buy?; are prices guaranteed non-negative?; return profit or the day pair?",
    edges:      "Strictly decreasing prices (profit 0); single-day input; all equal prices"
  },
  "Contains Duplicate": {
    pattern:    "Hash Set Membership — insert each value, return true on first re-insert.",
    insight:    "A set's membership check is O(1), so duplicate detection collapses to one linear scan.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Memory-tight variant (sort then adjacent compare)?; duplicates within k indices?",
    clarify:    "Are values bounded?; case-sensitive equality for strings?; treat NaN as duplicate of NaN?",
    edges:      "Empty array; all identical values; large negative or float values"
  },
  "Majority Element": {
    pattern:    "Boyer-Moore Voting — maintain candidate and count, reset candidate when count hits zero.",
    insight:    "A majority element survives any pairwise cancellation because it appears more than n/2 times.",
    complexity: "T: O(n) S: O(1)",
    followup:   "What if no majority exists?; find all elements appearing more than n/3 times?",
    clarify:    "Is a majority guaranteed?; can the array be empty?; immutable input or in-place ok?",
    edges:      "Single-element array; majority concentrated at the end; all elements equal"
  },
  "Move Zeroes": {
    pattern:    "Two-Pointer Write Index — slow pointer marks next non-zero slot, fast pointer scans.",
    insight:    "Stable partitioning around a value can be done in-place with one write index, no extra buffer.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Move all negatives to the end while preserving order?; minimise total writes?",
    clarify:    "Preserve relative order of non-zeros?; is in-place required?; mutate input or return a new array?",
    edges:      "All zeros; no zeros; zeros only at the front or end"
  },
  "Squares of a Sorted Array": {
    pattern:    "Two-Pointer Reverse Fill — compare |left| vs |right|, write the larger square at the back.",
    insight:    "The largest square always sits at one of the two ends, so a single descending fill suffices.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Cubes of a sorted array in O(n)?; absolute-value sort with arbitrary offsets?",
    clarify:    "Allocate a new array or sort in place?; can input contain duplicates or zeros?; integer overflow on squaring?",
    edges:      "All negatives; mix straddling zero; single-element input"
  },
  "Maximum Subarray": {
    pattern:    "Kadane — at each index keep best subarray ending here vs starting fresh.",
    insight:    "Carrying a negative running sum is never worth it, so the local choice is max(x, run + x).",
    complexity: "T: O(n) S: O(1)",
    followup:   "Return the indices, not only the sum?; circular subarray variant?; divide-and-conquer O(n log n)?",
    clarify:    "Allow empty subarray?; all-negative input handling?; values bounded for overflow?",
    edges:      "All negative numbers; single-element array; alternating large positives and negatives"
  },
  "Insert Interval": {
    pattern:    "Three-Phase Sweep — copy intervals before, merge overlapping, copy intervals after.",
    insight:    "Because the input is already sorted and non-overlapping, no global sort is needed.",
    complexity: "T: O(n) S: O(n)",
    followup:   "What if intervals arrive as a stream?; weighted intervals to merge?",
    clarify:    "Are endpoints inclusive?; do touching intervals (end == start) merge?; mutate input list?",
    edges:      "New interval before all existing; new interval after all existing; new interval swallows several"
  },
  "3Sum": {
    pattern:    "Sort + Two-Pointer — fix one index, then converge on the remaining target with two pointers.",
    insight:    "Sorting turns the n-squared inner search into linear with a duplicate-skipping rule on each pointer.",
    complexity: "T: O(n^2) S: O(1)",
    followup:   "kSum generalisation?; count triplets summing to a target rather than enumerate?",
    clarify:    "Are duplicate triplets allowed in the output?; can input contain repeats?; in-place sort acceptable?",
    edges:      "Fewer than three elements; all zeros (one triplet [0,0,0]); duplicates that produce the same triplet"
  },
  "Product of Array Except Self": {
    pattern:    "Prefix-Suffix Products — left pass writes prefix products, right pass multiplies by running suffix.",
    insight:    "Division is forbidden, but the answer at i equals prefix[i] times suffix[i] computed in two sweeps.",
    complexity: "T: O(n) S: O(1)",
    followup:   "What if division were allowed?; handle zeros specifically?; modular-arithmetic version?",
    clarify:    "Is the output buffer counted as extra space?; can input contain zeros?; integer overflow concerns?",
    edges:      "Single zero (only that index nonzero); two or more zeros (all output zero); n=1 boundary"
  },
  "Combination Sum": {
    pattern:    "Backtracking DFS — recurse with a start index to avoid permutation duplicates.",
    insight:    "Reusing each candidate is encoded by recursing with the same start index, not start+1.",
    complexity: "T: O(2^t) S: O(t)",
    followup:   "Each candidate usable once (Combination Sum II)?; count combinations rather than list them (DP)?",
    clarify:    "Are candidates distinct?; can target be zero or negative?; is order within a combination significant?",
    edges:      "Target smaller than smallest candidate (empty result); single candidate dividing target evenly; large target with small candidates"
  },
  "Merge Intervals": {
    pattern:    "Sort by Start + Sweep — extend the last merged interval whenever it overlaps the next.",
    insight:    "After sorting by start, overlap with the previous merged interval is the only check needed.",
    complexity: "T: O(n log n) S: O(n)",
    followup:   "Streaming intervals with no global sort allowed?; merge with weights or counts?",
    clarify:    "Do touching intervals (end == start) merge?; are intervals already sorted?; mutate input?",
    edges:      "Empty input; one interval contains all others; intervals that only touch at endpoints"
  },
  "Sort Colors": {
    pattern:    "Dutch National Flag — three pointers partition into <pivot, =pivot, >pivot in one pass.",
    insight:    "Two passes (counting) work, but a single linear pass with three indices is cleaner and in-place.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Generalise to k colours (radix-style)?; arbitrary integers around a pivot?",
    clarify:    "Are inputs guaranteed in {0,1,2}?; in-place required?; stability needed?",
    edges:      "All same colour; already sorted; reverse-sorted (2,1,0 repeating)"
  },
  "Container With Most Water": {
    pattern:    "Two-Pointer Inward — area = min(h[l], h[r]) * (r-l), always move the shorter side.",
    insight:    "Moving the taller side can never increase area because width shrinks and height is capped by the shorter wall.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Trapping rain water variant?; container with three walls?; return the index pair, not only area?",
    clarify:    "Are heights non-negative?; can width or height be zero?; is the container open-top?",
    edges:      "Two elements (single area); all equal heights; strictly increasing then decreasing heights"
  },
  "Gas Station": {
    pattern:    "Greedy + Tank Invariant — if total gas ≥ total cost, the unique start sits after every empty tank.",
    insight:    "Whenever the running tank goes negative, no station up to this point can be the answer, reset start past it.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Multiple cars with different tank caps?; return all valid starting stations?; prove uniqueness formally?",
    clarify:    "Are gas and cost guaranteed non-negative?; is direction fixed (clockwise)?; is the answer unique?",
    edges:      "Total gas less than total cost (return -1); single station; tank exactly zero at the loop start"
  },
  "Longest Consecutive Sequence": {
    pattern:    "Hash Set Sequence-Start Scan — for each x with no x-1 in the set, count forward.",
    insight:    "Only run-starts trigger expansion, so each element is visited at most twice across the whole scan.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Return the actual run, not only its length?; streaming version with deletions?; bounded ranges via bitset?",
    clarify:    "Are duplicates ignored or counted?; integer range bounded?; is mutation of input allowed?",
    edges:      "Empty array; all duplicates of one value (length 1); two disjoint long runs"
  },
  "Rotate Array": {
    pattern:    "Three Reversals — reverse whole array, reverse first k, reverse rest.",
    insight:    "Composition of three in-place reversals achieves a cyclic shift without extra storage.",
    complexity: "T: O(n) S: O(1)",
    followup:   "What if k can be negative or larger than n?; rotate a linked list instead?; rotate a 2D matrix?",
    clarify:    "Direction (left or right)?; is k bounded by n?; is in-place mandatory?",
    edges:      "k = 0 (no rotation); k = n (no-op after mod); k > n requiring k %= n"
  },
  "Contiguous Array": {
    pattern:    "Prefix Sum + First-Seen Map — treat 0 as -1, equal counts means a balanced subarray.",
    insight:    "When the running sum repeats, the slice between the two indices has zero net sum (equal 0s and 1s).",
    complexity: "T: O(n) S: O(n)",
    followup:   "Generalise to arbitrary {a, b} values?; longest subarray with at most k 1s?",
    clarify:    "Are values strictly 0/1?; return length or indices?; can the array be empty?",
    edges:      "All same value (length 0); alternating pattern (length n if n even); single element"
  },
  "Subarray Sum Equals K": {
    pattern:    "Prefix Sum + Count Map — count how often (running_sum minus k) has been seen.",
    insight:    "Subarrays summing to k correspond to two prefix sums differing by k, so a frequency map gives O(1) per step.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Return the longest such subarray?; non-negative inputs only (sliding window applies)?; 2D version?",
    clarify:    "Can values be negative or zero?; is k guaranteed non-zero?; integer overflow risk?",
    edges:      "k = 0 with zeros in array; entire array sums to k; no qualifying subarray"
  },
  "Meeting Rooms II": {
    pattern:    "Min-Heap of End Times — sort by start, pop a room when its end ≤ current start, else allocate.",
    insight:    "Only the earliest-ending active meeting matters when deciding whether a new room is needed.",
    complexity: "T: O(n log n) S: O(n)",
    followup:   "Return the actual schedule per room?; sweep-line difference-array alternative?; weighted intervals?",
    clarify:    "Do touching intervals (end == start) share a room?; are inputs sorted?; can intervals be zero-length?",
    edges:      "All meetings disjoint (1 room); all meetings identical (n rooms); intervals that touch but do not overlap"
  },
  "3Sum Closest": {
    pattern:    "Sort + Two-Pointer with Best-Diff — fix one index, converge inner pointers, track minimum |sum minus target|.",
    insight:    "After sorting, moving the pointer that reduces the signed gap monotonically narrows toward the target.",
    complexity: "T: O(n^2) S: O(1)",
    followup:   "Closest k-sum?; closest pair instead?; report all triplets within delta of the closest sum?",
    clarify:    "Is the answer unique?; can input contain duplicates?; integer overflow on triplet sum?",
    edges:      "Exactly three elements; all values equal; target outside any reachable range"
  },
  "Non-overlapping Intervals": {
    pattern:    "Greedy by End Time — sort by end, keep an interval iff it starts at or after the last kept end.",
    insight:    "Always keeping the earliest-ending compatible interval leaves the most room for future picks.",
    complexity: "T: O(n log n) S: O(1)",
    followup:   "Maximum number of non-overlapping intervals (same problem reframed)?; weighted variant via DP?",
    clarify:    "Do touching intervals count as overlapping?; is sorting input acceptable?; return count or removed list?",
    edges:      "All intervals overlap pairwise; no intervals overlap (remove 0); intervals touching only at endpoints"
  },
  "Insert Delete GetRandom O(1)": {
    pattern:    "Array + Value→Index Map — swap-remove with the last element to keep the array dense.",
    insight:    "Random access needs a contiguous array, and O(1) deletion needs swap-with-last plus an index map.",
    complexity: "T: O(1) S: O(n)",
    followup:   "Allow duplicates (multiset variant)?; weighted random pick?; thread-safe version?",
    clarify:    "Are values guaranteed unique?; is uniform randomness required?; what to return on missing key?",
    edges:      "Removing the only element; removing the current last element (no swap needed); randomness on a single-element set"
  },
  "Pow(x, n)": {
    pattern:    "Fast Power (Binary Exponentiation) — square the base, halve the exponent.",
    insight:    "n's binary digits decide which intermediate squares contribute, collapsing n multiplications to log n.",
    complexity: "T: O(log n) S: O(1)",
    followup:   "Modular pow for crypto?; matrix exponentiation for Fibonacci?; iterative vs recursive tradeoffs?",
    clarify:    "Negative exponent handling?; INT_MIN exponent overflow on negation?; precision of floating-point output?",
    edges:      "n = 0 (return 1); n = INT_MIN (cannot negate directly); base 0 with negative exponent"
  },
  "Reverse Integer": {
    pattern:    "Digit-by-Digit Pop/Push with Overflow Guard — peel last digit, append to reversed result.",
    insight:    "The 32-bit overflow check must happen before the multiplication, comparing against INT_MAX/10.",
    complexity: "T: O(log n) S: O(1)",
    followup:   "atoi-style trimming and validation?; reverse a 64-bit integer?; reverse base-k digits?",
    clarify:    "Return 0 on overflow or throw?; preserve sign?; treat trailing zeros specially?",
    edges:      "Negative numbers (sign preserved); inputs that overflow on reverse (e.g., 1534236469); trailing zeros (100 → 1)"
  },
  "Random Pick with Weight": {
    pattern:    "Prefix Sum + Binary Search — sample r in [1, total], find first prefix ≥ r.",
    insight:    "Cumulative weights map a uniform draw onto the weighted distribution via lower-bound search.",
    complexity: "T: O(log n) S: O(n)",
    followup:   "Streaming weights via Walker's alias method?; resampling without replacement?; mutable weights?",
    clarify:    "Are weights positive integers?; can weights sum exceed 32-bit?; reseed deterministically for tests?",
    edges:      "Single weight (always index 0); zero-weight entries (must be skipped or rejected); skewed distribution where one weight dominates"
  },
  "Find the Duplicate Number": {
    pattern:    "Floyd Cycle Detection — treat nums as f(i)=nums[i], the duplicate is the cycle entry.",
    insight:    "Indexing into nums creates a linked list whose cycle entrance is exactly the repeated value.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Find all duplicates without modifying the array?; what if multiple values repeat?; bit-count alternative?",
    clarify:    "Is exactly one duplicate guaranteed?; is the array read-only?; values strictly in [1, n]?",
    edges:      "Duplicate is 1 (head of list); duplicate appears many times; minimum-size array (n=2 with both equal)"
  },
  "Sliding Window Maximum": {
    pattern:    "Monotonic Deque of Indices — maintain decreasing values, the front is the window max.",
    insight:    "Smaller values to the left of a larger newcomer can never become the max again, so they are popped.",
    complexity: "T: O(n) S: O(k)",
    followup:   "Sliding window minimum?; sliding median (two-heap)?; arbitrary aggregation via sparse table?",
    clarify:    "Is k ≤ n guaranteed?; can the array be empty?; ties broken by which index?",
    edges:      "k = 1 (output equals input); k = n (single max); strictly decreasing then increasing input"
  },
  "Employee Free Time": {
    pattern:    "Min-Heap Merge of Sorted Intervals — output gaps between the running max-end and the next start.",
    insight:    "Per-employee schedules are already sorted, so a k-way merge by start time exposes free gaps directly.",
    complexity: "T: O(n log k) S: O(k)",
    followup:   "Common free time across only a subset of employees?; streaming employees?; weighted availability?",
    clarify:    "Are inputs sorted within each employee?; do touching intervals (end == start) count as free?; return inclusive or exclusive bounds?",
    edges:      "Single employee (no shared gaps); fully overlapping schedules (no free time); empty schedules"
  },
  "First Missing Positive": {
    pattern:    "Cyclic Placement (In-Place Hash) — swap nums[i] to index nums[i]-1 until each slot holds its rank.",
    insight:    "Only values in [1, n] matter, using the array itself as a hash table reaches O(1) extra space.",
    complexity: "T: O(n) S: O(1)",
    followup:   "First missing in a stream?; smallest missing in [1, k] for arbitrary k?; multiple missing values?",
    clarify:    "Is mutation allowed?; can the array contain duplicates or non-positives?; is n bounded?",
    edges:      "Empty array (answer 1); all values ≤ 0 (answer 1); array already a permutation of 1..n (answer n+1)"
  },
  // ───── Strings & Misc group (task 8.2) ─────
  "Valid Palindrome": {
    pattern:    "Two-Pointer Converge — skip non-alphanumeric on both ends, compare lower-cased characters.",
    insight:    "Filtering and comparison happen in one pass, so the cleaned string never needs to be materialised.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Allow at most one deletion (Valid Palindrome II)?; Unicode case-folding rules?; what counts as a word character?",
    clarify:    "Are uppercase and lowercase considered equal?; do digits count as alphanumeric?; treat empty string as palindrome?",
    edges:      "Empty or all-non-alphanumeric input (palindrome by vacuous truth); single character; punctuation interleaved between matching letters"
  },
  "Valid Anagram": {
    pattern:    "Hash Map — Frequency Count — increment for s, decrement for t, result requires every counter at zero.",
    insight:    "Length equality plus a single zeroed counter table replaces sorting in linear time.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Unicode inputs (need a hash map, not a 26-slot array)?; streaming with deletions?; k-anagrams (at most k differing positions)?",
    clarify:    "Are inputs lowercase ASCII only?; can either string be empty?; case-sensitive comparison?",
    edges:      "Different lengths (immediate false); identical strings (true); one string empty"
  },
  "Longest Palindrome": {
    pattern:    "Frequency Parity Count — sum each character's largest even portion, add one if any odd-count character exists.",
    insight:    "At most one odd-count character can sit at the centre, so all others contribute their largest even prefix.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Return the palindrome itself, not only its length?; case-insensitive variant?; multiset of arbitrary tokens?",
    clarify:    "Is the alphabet bounded ASCII?; case-sensitive counting?; does an empty string count as length 0?",
    edges:      "All distinct characters (length 1); all identical characters (full length); every count even (no centre bonus)"
  },
  "Longest Common Prefix": {
    pattern:    "Vertical Scan — fix the column index, read each string at that index, stop on first mismatch or shortest end.",
    insight:    "The answer is bounded by the shortest string, so column-by-column scanning terminates as soon as any string runs out.",
    complexity: "T: O(n*m) S: O(1)",
    followup:   "Strings arriving as a stream?; longest common suffix?; trie-based approach when queries are repeated?",
    clarify:    "Case-sensitive comparison?; can the array be empty?; Unicode handling for multi-byte characters?",
    edges:      "Empty array (return empty string); single string (return itself); one empty string in the array (return empty)"
  },
  "Longest Substring Without Repeating Characters": {
    pattern:    "Sliding Window — Variable Size — track each character's last-seen index, jump left edge past the duplicate.",
    insight:    "The window's left edge only moves forward, so each character is visited at most twice across the whole scan.",
    complexity: "T: O(n) S: O(k)",
    followup:   "At most k distinct characters?; longest substring with at most one repeat?; streaming version with eviction?",
    clarify:    "Is the alphabet bounded?; case-sensitive duplication?; return length or the substring itself?",
    edges:      "Empty string; all identical characters (length 1); fully unique string (length n)"
  },
  "String to Integer (atoi)": {
    pattern:    "Finite State Machine — phases: skip whitespace, optional sign, digit run, clamp to int32 range.",
    insight:    "Overflow must be checked against INT_MAX/10 before the multiply-add, not after, to avoid the very overflow you're testing for.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Locale-aware parsing (commas, currency symbols)?; arbitrary-base variant?; signed 64-bit version?",
    clarify:    "Trim leading whitespace only or all whitespace?; reject embedded spaces or stop at first?; how to clamp on overflow?",
    edges:      "Pure whitespace or empty input (return 0); leading + or - alone with no digits (return 0); value past INT_MAX (clamp to INT_MAX)"
  },
  "Longest Palindromic Substring": {
    pattern:    "Expand Around Center — try each of the 2n-1 centres, expand while left and right characters match.",
    insight:    "Every palindrome has a clear centre, so enumerating centres (not start-end pairs) avoids the n-cubed brute force.",
    complexity: "T: O(n^2) S: O(1)",
    followup:   "Manacher in O(n)?; count all palindromic substrings?; longest palindromic subsequence (DP)?",
    clarify:    "Return any longest palindrome on ties or a specific one?; case-sensitive comparison?; can input be empty?",
    edges:      "Empty or single-character input; entirely identical characters (whole string is the answer); two equal characters at the start"
  },
  "Find All Anagrams in a String": {
    pattern:    "Sliding Window — Fixed Size with Frequency Diff — slide a window of length |p|, track matched-character count vs target table.",
    insight:    "Maintaining a single 'matched buckets' counter avoids per-step full-table comparison, keeping the scan linear.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Return only the count, not indices?; case-insensitive matching?; arbitrary alphabet (large Unicode)?",
    clarify:    "Is the alphabet bounded ASCII lowercase?; can p be longer than s?; are overlapping matches counted separately?",
    edges:      "p longer than s (no matches); s and p identical (single match at index 0); p with repeated characters"
  },
  "Group Anagrams": {
    pattern:    "Hash Map by Canonical Signature — bucket each string by its 26-slot count tuple (or sorted form).",
    insight:    "Anagrams share a signature, so reducing each string to its canonical form turns grouping into a single map insert.",
    complexity: "T: O(n*k) S: O(n*k)",
    followup:   "Memory-tight when strings are long?; case-insensitive grouping?; streaming inputs?",
    clarify:    "Case-sensitive grouping?; preserve original order within a group?; can the input list be empty?",
    edges:      "All identical strings (one group); all unique with no anagrams (n groups); empty strings (group together)"
  },
  "Longest Repeating Character Replacement": {
    pattern:    "Sliding Window with Max-Freq — window valid while (length minus most-frequent count) ≤ k.",
    insight:    "The historical max frequency is enough, you never need to recompute it when the window shrinks because the answer is monotonic.",
    complexity: "T: O(n) S: O(1)",
    followup:   "k-distinct variant?; replace with at most k inserts (not swaps)?; multi-character replacement budget?",
    clarify:    "Is the alphabet bounded uppercase ASCII?; can k exceed the string length?; case-sensitive comparison?",
    edges:      "k = 0 (longest run of one character); k ≥ n (whole string); all identical characters (length n)"
  },
  "Largest Number": {
    pattern:    "Custom Sort Comparator — sort strings by which concatenation (a+b vs b+a) is lexicographically larger.",
    insight:    "A total order over digit strings is established by concatenation comparison, not numeric or lexicographic order alone.",
    complexity: "T: O(n log n) S: O(n)",
    followup:   "Smallest concatenated number?; arbitrary base?; prove the comparator is transitive?",
    clarify:    "Are inputs non-negative integers?; treat leading zeros specially?; return string or number?",
    edges:      "All zeros (return '0', not '0000'); single-digit input; mix of single- and multi-digit numbers (e.g., 3 vs 30)"
  },
  "Encode and Decode Strings": {
    pattern:    "Length-Prefix Framing — emit each string as 'len#payload', decoder reads length, then exactly that many bytes.",
    insight:    "Delimiter-free framing requires a length prefix because any chosen delimiter could legally appear inside a payload.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Binary-safe encoding?; streaming decoder for arbitrary chunks?; varint length prefix to save bytes?",
    clarify:    "Can payloads contain digits, '#', or NUL?; ASCII or Unicode?; is the length count in bytes or code points?",
    edges:      "Empty list (round-trips to empty list); list with empty strings (zero-length frames); strings containing the delimiter character"
  },
  "Minimum Window Substring": {
    pattern:    "Sliding Window — Variable Size with Need/Have — expand right to cover need, shrink left while still covering.",
    insight:    "A single 'matched character classes' counter tells you when the window is valid without re-scanning the table each step.",
    complexity: "T: O(n) S: O(k)",
    followup:   "All windows containing t, not only the smallest?; multiset t with required duplicates?; case-insensitive variant?",
    clarify:    "Are duplicates in t required to all be matched?; case-sensitive comparison?; return window or its length?",
    edges:      "t longer than s (no window); s equals t (whole string); t with repeated characters requiring multiplicity"
  },
  "Palindrome Pairs": {
    pattern:    "Hash Map of Reversed Words — for each word, split at every index and probe for a complement that completes a palindrome.",
    insight:    "A palindromic pair forces one word to contain a palindromic remainder while the other matches its reverse, reducing the search to per-word splits.",
    complexity: "T: O(n*k^2) S: O(n*k)",
    followup:   "Return only the count, not the pairs?; allow self-pairs (i = j)?; case-insensitive matching?",
    clarify:    "Are duplicate words possible?; is empty string allowed (pairs with any palindrome)?; case-sensitive comparison?",
    edges:      "Empty string in the list (pairs with every palindrome word); duplicate words; single-character words that are themselves palindromes"
  },
  "Ransom Note": {
    pattern:    "Hash Map — Frequency Count — count letters in the magazine, decrement for each letter in the note.",
    insight:    "Coverage is multiset containment, so a single counter table answers the question without sorting.",
    complexity: "T: O(n+m) S: O(1)",
    followup:   "Streaming magazine?; weighted letter cost?; case-insensitive variant?",
    clarify:    "Is the alphabet lowercase ASCII?; can the note be empty (always true)?; is comparison case-sensitive?",
    edges:      "Empty note (always true); empty magazine with non-empty note (false); note exactly equal to the magazine"
  },
  "Roman to Integer": {
    pattern:    "Greedy Lookahead — sum each numeral's value, subtract twice when a smaller numeral precedes a larger one.",
    insight:    "The subtractive rule applies to exactly six legal pairs, so a single look-ahead per index is enough.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Integer to Roman (greedy with value-symbol pairs)?; validate that a Roman numeral is canonical?; arbitrary base systems?",
    clarify:    "Is the input guaranteed valid Roman?; uppercase only?; max value bounded by 3999?",
    edges:      "Single numeral (e.g., 'V'); subtractive forms ('IV', 'IX', 'XL', etc.); long repeated runs like 'MMMCMXCIX'"
  },
  "Palindrome Number": {
    pattern:    "Reverse Half Digits — pop digits off the right, stop when the reversed half meets or exceeds the remaining left.",
    insight:    "Reversing only half the number avoids overflow and ends the loop without needing the digit count.",
    complexity: "T: O(log n) S: O(1)",
    followup:   "Treat negative numbers as palindromes by ignoring the sign?; arbitrary base?; allow leading-zero forms?",
    clarify:    "Are negatives palindromes?; treat 0 specially?; integer or 64-bit input?",
    edges:      "Negative input (return false); numbers ending in 0 (only 0 itself qualifies); single-digit input (always true)"
  },
  "Add Binary": {
    pattern:    "Digit-by-Digit with Carry — walk both strings from the right, sum + carry per column.",
    insight:    "Letting the loop run while either string or the carry is non-empty handles different lengths and trailing carry uniformly.",
    complexity: "T: O(n+m) S: O(n+m)",
    followup:   "Add two arbitrary-base numbers?; subtract two binary strings?; bitwise XOR/AND-shift implementation?",
    clarify:    "Are inputs guaranteed non-negative and free of leading zeros?; are leading zeros in the output allowed?; bounded by 64 bits?",
    edges:      "Different lengths; carry that grows the result by one digit; both inputs '0'"
  },
  "Single Number": {
    pattern:    "Bit Manipulation — XOR Cancellation — fold all elements with XOR, pairs cancel to zero.",
    insight:    "XOR is associative, commutative, and self-inverse, so pairs vanish regardless of order, leaving only the unique value.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Every other element appears three times instead of two (bitwise mod-3 counters)?; two unique elements (XOR partition)?; arbitrary k-fold repetition?",
    clarify:    "Is exactly one element unique?; can the array be empty?; integer range bounded?",
    edges:      "Single-element array (return it); negatives mixed with positives; large absolute values (XOR remains safe)"
  },
  "Missing Number": {
    pattern:    "Bit Manipulation — XOR Cancellation — XOR all values together with all indices 0..n, the lone survivor is the missing one.",
    insight:    "Pairing each index with its presence-or-absence collapses the search to a single XOR, sidestepping overflow risk in sum-formula variants.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Multiple missing numbers?; numbers in [1, n] instead of [0, n] (Gauss-sum variant)?; streaming version?",
    clarify:    "Is exactly one number missing?; range [0, n] inclusive?; can the array be empty (missing 0)?",
    edges:      "Empty array (missing is 0); missing first (0); missing last (n)"
  },
  "Number of 1 Bits": {
    pattern:    "Brian-Kernighan Bit Trick — repeatedly clear the lowest set bit via n & (n-1).",
    insight:    "Each iteration removes exactly one set bit, so the loop runs popcount(n) times rather than 32.",
    complexity: "T: O(k) S: O(1)",
    followup:   "Hardware popcount intrinsic vs portable code?; popcount of a streamed bit-array?; SWAR (SIMD-within-a-register) version?",
    clarify:    "Treat input as signed or unsigned 32-bit?; arbitrary-width integers (BigInt)?; sign extension on right shift?",
    edges:      "n = 0 (zero set bits); n = 0xFFFFFFFF (32 set bits); negative interpretation if signed (sign-bit handling)"
  },
  "Counting Bits": {
    pattern:    "DP on Bit Counts — bits[i] = bits[i >> 1] + (i & 1).",
    insight:    "Dropping the low bit gives a strictly smaller index whose answer is already known, so each entry fills in O(1).",
    complexity: "T: O(n) S: O(n)",
    followup:   "Output as a stream without the full array?; popcount over arbitrary 64-bit ranges?; alternative recurrence bits[i] = bits[i & (i-1)] + 1?",
    clarify:    "Is n inclusive (size n+1) or exclusive?; n = 0 returns [0]?; signed or unsigned input?",
    edges:      "n = 0 (single-element output [0]); n = 1 (two-element [0, 1]); large n (no overflow since each value ≤ 32)"
  },
  "Reverse Bits": {
    pattern:    "Bitwise Shift Accumulate — pull each low bit off the input and shift it into the accumulator.",
    insight:    "Reversal is a left-right mirror, achievable in 32 fixed iterations or via a divide-and-conquer mask sequence.",
    complexity: "T: O(1) S: O(1)",
    followup:   "Reverse a 64-bit integer?; reverse only the low k bits?; cache-lookup table over 8-bit chunks?",
    clarify:    "Is the integer signed or unsigned 32-bit?; preserve leading zeros in the output?; called repeatedly (memoise byte chunks)?",
    edges:      "All zeros (output zero); all ones (output all ones); palindromic bit pattern (input equals output)"
  },
  // ───── Stack group (task 8.3) ─────
  "Valid Parentheses": {
    pattern:    "Stack — Matching Pairs — push openers, on a closer, the top must be the matching opener.",
    insight:    "Bracket validity is a last-in-first-out problem: only the most recent opener can be closed next.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Add a wildcard '*' that can be any bracket?; balance arbitrary delimiter pairs?; report the offending index on failure?",
    clarify:    "Are characters limited to () [] {}?; does the empty string count as valid?; is whitespace allowed inside the input?",
    edges:      "Empty string (valid); single closer like ')' (invalid); correctly nested vs interleaved like '([)]'"
  },
  "Implement Queue using Stacks": {
    pattern:    "Two Stacks — Lazy Transfer — push onto an in-stack, pop/peek from an out-stack, refilling it only when empty.",
    insight:    "Each element moves between stacks at most twice, so the amortised per-op cost stays O(1) despite the O(n) refill.",
    complexity: "T: O(1) S: O(n)",
    followup:   "Implement a stack using queues?; thread-safe variant?; bounded-capacity queue?",
    clarify:    "Are pop and peek defined on an empty queue?; is the underlying stack API push/pop/top only?; is amortised O(1) acceptable or strict O(1) required?",
    edges:      "Pop/peek when both stacks are empty; alternating push and pop (worst-case transfers); single-element queue"
  },
  "Backspace String Compare": {
    pattern:    "Two-Pointer From End — walk both strings backward, skipping characters cancelled by upcoming '#'s.",
    insight:    "A right-to-left scan with a skip counter avoids materialising the cleaned strings, achieving O(1) extra space.",
    complexity: "T: O(n+m) S: O(1)",
    followup:   "Stack-based O(n)-space variant?; multi-character backspace tokens?; streaming inputs?",
    clarify:    "Does '#' on an empty buffer no-op or error?; are inputs ASCII only?; case-sensitive comparison?",
    edges:      "All-backspace strings (both empty after processing); no '#' present (direct compare); leading '#'s with nothing to delete"
  },
  "Min Stack": {
    pattern:    "Auxiliary Min Stack — push the running minimum alongside every value (or in a parallel stack).",
    insight:    "Storing the per-frame minimum turns getMin into a top read instead of an O(n) scan, with no extra time on push or pop.",
    complexity: "T: O(1) S: O(n)",
    followup:   "Single-stack variant storing encoded deltas?; expose getMax alongside getMin?; thread-safety?",
    clarify:    "Are pop/top/getMin on an empty stack defined?; can values be negative or repeat?; overflow risk on encoded deltas?",
    edges:      "Sequence of equal values (ties on the min); strictly decreasing pushes (every push is the new min); pop that removes the current minimum"
  },
  "Evaluate Reverse Polish Notation": {
    pattern:    "Stack — Postfix Evaluation — push numbers, on an operator, pop two and push the result.",
    insight:    "Postfix needs no precedence rules because operand order is fixed by the stack at the moment the operator appears.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Convert infix to postfix (shunting-yard)?; support unary minus or float division?; report invalid expressions?",
    clarify:    "Is integer division truncated toward zero?; can the input contain unary operators?; how to handle division by zero?",
    edges:      "Single-token expression (a literal); negative intermediate results; division producing non-integer truncation"
  },
  "Daily Temperatures": {
    pattern:    "Monotonic Decreasing Stack of Indices — pop while today's temp exceeds the stack top, recording the day-gap as it pops.",
    insight:    "Each index is pushed and popped at most once, so the stack pays for the per-day work in linear total time.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Days until a temperature drop instead?; circular-array variant?; range queries via a sparse table?",
    clarify:    "Are temperatures bounded integers?; what to write when no warmer day exists (0 vs -1)?; can the array be empty?",
    edges:      "Strictly increasing temps (every gap is 1); strictly decreasing temps (all zeros); all-equal temps (all zeros)"
  },
  "Decode String": {
    pattern:    "Stack of (count, prefix) Frames — push state on '[', pop and concatenate count*current on ']'.",
    insight:    "Nested repetition needs one frame per bracket, and the answer is built bottom-up by multiplying as each frame closes.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Recursive descent variant?; multi-digit counts and Unicode payloads?; lazy generator that streams the decoded output?",
    clarify:    "Are digits multi-digit?; is the alphabet lowercase ASCII only?; can counts be zero?",
    edges:      "No brackets (passthrough); deeply nested repetitions like '2[3[a]]'; multi-digit count like '10[a]'"
  },
  "Asteroid Collision": {
    pattern:    "Stack — Collision Resolution — push moving-right, on a moving-left arrival, resolve against any rightward asteroid on top.",
    insight:    "Only the rightmost stack element can collide with an incoming leftward asteroid, so a single pass with a stack suffices.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Variable-speed but same-mass variant?; report which asteroids were destroyed?; 2D-grid version?",
    clarify:    "Sign convention (positive means right)?; are zero-magnitude asteroids possible?; equal-magnitude head-on outcome?",
    edges:      "Equal-magnitude head-on (both destroyed); all moving the same direction (no collisions); single asteroid"
  },
  "Basic Calculator II": {
    pattern:    "Stack with Pending Operator — apply * and / immediately against the stack top, defer + and - by sign-pushing.",
    insight:    "Tracking the previous operator collapses precedence handling without parsing into a tree, the final sum of the stack is the answer.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Add parentheses (Basic Calculator I)?; support floats and unary minus?; validate malformed input?",
    clarify:    "Is integer division truncated toward zero?; can the expression contain spaces?; are operands non-negative integers?",
    edges:      "Single-number expression; expression with only * and / (no additive terms); division producing truncation"
  },
  "Trapping Rain Water": {
    pattern:    "Monotonic Decreasing Stack — on a taller bar, pop and accumulate trapped water using the bounded width and height delta.",
    insight:    "Water at index i equals min(maxLeft, maxRight) − height[i], and a stack computes each horizontal layer exactly once when its right wall arrives.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Two-pointer O(1)-space alternative?; trapping rain water II (2D heightmap, min-heap)?; volume above a sloped baseline?",
    clarify:    "Are heights non-negative integers?; can the input be empty?; is overflow a concern on accumulated volume?",
    edges:      "Strictly monotonic heights (no water); flat plateau (no water); single deep valley between two tall walls"
  },
  "Largest Rectangle in Histogram": {
    pattern:    "Monotonic Increasing Stack — pop on a shorter bar, the popped bar's max rectangle uses the new neighbours as left and right bounds.",
    insight:    "Each bar is the height of exactly one maximal rectangle, bounded by the nearest strictly shorter bars on each side.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Maximal rectangle in a 0/1 matrix (apply per row)?; largest square instead?; allow heights to update online?",
    clarify:    "Are heights non-negative integers?; can the array be empty?; is appending a sentinel zero allowed?",
    edges:      "Strictly increasing heights (the final flush computes the answer); all-equal heights (single rectangle of full width); single bar"
  },
  "Basic Calculator": {
    pattern:    "Stack of (Result, Sign) at Parens — fold + and - inline, push state on '(' and combine on ')'.",
    insight:    "Parentheses only need a saved snapshot of the result-and-sign pair, not a full expression tree.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Add * and / with precedence (Basic Calculator II/III)?; support unary minus inside parens?; validate malformed expressions?",
    clarify:    "Are operands non-negative integers?; can the expression contain spaces?; is parenthesis depth bounded?",
    edges:      "Expression starting with '-' (leading unary minus); deeply nested parens; expression that is a single number"
  },
  "Maximum Frequency Stack": {
    pattern:    "Stack of Stacks Indexed by Frequency — push each value onto the stack at its post-increment count, pop from the highest-count stack.",
    insight:    "A separate stack per frequency level preserves both 'most frequent' and 'most recent within a tie' in O(1) per operation.",
    complexity: "T: O(1) S: O(n)",
    followup:   "Min-frequency variant?; bounded-memory version evicting old entries?; persistent (snapshot) version?",
    clarify:    "Can the same value be pushed many times?; is pop on an empty structure defined?; integer values only?",
    edges:      "All distinct values (pop is most-recent); ties broken by most-recent push; pop until empty then push again"
  },
  "Longest Valid Parentheses": {
    pattern:    "Stack of Indices with Sentinel — seed with -1, on '(' push index, on ')' pop and measure i minus the new top.",
    insight:    "The sentinel index encodes the boundary right before the current valid run, so the length is always a single subtraction.",
    complexity: "T: O(n) S: O(n)",
    followup:   "DP O(n)-time O(n)-space alternative?; two-pass counter with O(1) space?; longest valid run for mixed bracket types?",
    clarify:    "Are characters strictly '(' and ')'?; can the input be empty?; return the length or the substring itself?",
    edges:      "All openers (length 0); all closers (length 0); valid run interrupted by a stray ')'"
  },
  // ───── Linked List group (task 8.4) ─────
  "Merge Two Sorted Lists": {
    pattern:    "Dummy Head — Merge — splice the smaller-head node onto the tail until one list runs out, then attach the remainder.",
    insight:    "A dummy node removes the special case of choosing the result's first node, so the loop appends uniformly.",
    complexity: "T: O(n+m) S: O(1)",
    followup:   "Merge k sorted lists (min-heap)?; merge in place without a dummy?; merge sorted arrays into one list?",
    clarify:    "Are both inputs guaranteed sorted ascending?; can either list be null?; is node reuse allowed or must new nodes be allocated?",
    edges:      "Both lists empty (return null); one list empty (return the other); lists of equal length with all-equal values"
  },
  "Linked List Cycle": {
    pattern:    "Two-Pointer Tortoise-Hare — slow advances by one, fast by two, they meet inside any cycle.",
    insight:    "Relative speed of one node per step forces the fast pointer to lap the slow whenever a cycle exists.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Return the cycle's entry node (Linked List Cycle II)?; report the cycle length?; detect cycles in an arbitrary directed graph?",
    clarify:    "Can the list be empty?; is a self-loop (length-one cycle) possible?; is mutating the list (mark-visited) acceptable?",
    edges:      "Empty list (no cycle); single node with no self-loop; cycle that includes the head"
  },
  "Reverse Linked List": {
    pattern:    "Iterative Reversal — prev/curr/next — flip each next pointer toward prev while walking forward.",
    insight:    "Three pointers suffice because the only state needed is the previous node and the saved successor.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Recursive variant (O(n) stack)?; reverse a sublist between indices m and n?; reverse in groups of k?",
    clarify:    "Is the list singly linked?; mutate input or return a new list?; can the list be empty or a single node?",
    edges:      "Empty list; single node (returns itself); two-node list (smallest non-trivial reversal)"
  },
  "Middle of the Linked List": {
    pattern:    "Two-Pointer Tortoise-Hare — slow steps once, fast steps twice, slow lands on the middle when fast hits the end.",
    insight:    "A 2:1 speed ratio places slow at the halfway point in one pass without first measuring the length.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Return the first or the second middle on even length?; return the kth-from-end node?; middle of a doubly-linked list?",
    clarify:    "Which middle to return for even length (left or right)?; can the list be empty?; locate only or also mutate?",
    edges:      "Empty list (return null); single node (returns itself); even-length list (two valid middles)"
  },
  "Palindrome Linked List": {
    pattern:    "Find Mid + Reverse Tail + Two-Pointer Compare — bisect with slow/fast, reverse the second half, walk both halves inward.",
    insight:    "A linked list cannot index backward, so reversing the back half locally turns palindrome check into a forward scan.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Restore the list to its original order after the check?; recursive O(n)-stack variant?; O(1) variant on a doubly-linked list?",
    clarify:    "Mutate the list in place or work read-only?; even-length tie-breaking on the midpoint?; case-sensitive comparison if values are characters?",
    edges:      "Empty list (palindrome by vacuous truth); single node (always palindrome); even-length list with mirrored values"
  },
  "LRU Cache": {
    pattern:    "Hash Map + Doubly-Linked List (LRU) — map keys to nodes, move an accessed node to the head, evict from the tail on overflow.",
    insight:    "A hash map alone gives O(1) lookup but not O(1) recency tracking, pairing it with a doubly-linked list keeps both ops O(1).",
    complexity: "T: O(1) S: O(capacity)",
    followup:   "LFU cache?; thread-safe LRU?; reuse a language-provided ordered map (LinkedHashMap, OrderedDict) instead?",
    clarify:    "Is capacity guaranteed positive?; does a put on an existing key refresh recency?; what to return on a missing get?",
    edges:      "Capacity 1 (every put evicts); get on a missing key (return -1); put updating an existing key (no eviction)"
  },
  "Remove Nth Node From End of List": {
    pattern:    "Two-Pointer Gap — advance the lead pointer n steps first, then walk both until lead hits the end, trail's next is the target.",
    insight:    "Maintaining a fixed n-node gap turns 'kth from end' into a single forward pass without first measuring the list.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Remove the kth-from-start in the same pass?; remove every kth node?; do it on a doubly-linked list?",
    clarify:    "Is n guaranteed valid (1 ≤ n ≤ length)?; can the head itself be removed?; is the list singly linked?",
    edges:      "Removing the head (n equals length); single-node list with n=1 (returns null); n=1 (removes the tail)"
  },
  "Swap Nodes in Pairs": {
    pattern:    "Dummy-Pair Swap — keep a prev pointer, rewire prev → second → first → rest in groups of two.",
    insight:    "A dummy head lets the first pair use the same rewiring template as every later pair, removing the head special case.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Generalise to k-group reversal?; recursive O(n)-stack variant?; swap only pairs whose values match a predicate?",
    clarify:    "Rewire pointers or swap values only?; how to handle a trailing odd node?; is the list singly linked?",
    edges:      "Empty or single-node list (return as-is); odd-length list (last node stays in place); two-node list (one swap)"
  },
  "Odd Even Linked List": {
    pattern:    "Two-List Partition — maintain odd-index and even-index sublists, weave them, then attach the even head after the odd tail.",
    insight:    "Partitioning by index parity in place needs two pointers and a final splice because each node is touched exactly once.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Partition by an arbitrary predicate while preserving order?; group by value parity instead of index parity?; do it on a doubly-linked list?",
    clarify:    "Is indexing 1-based or 0-based?; preserve relative order within each parity?; mutate input or return a new list?",
    edges:      "Empty or single-node list (return as-is); two-node list (no rearrangement); length-3 list (one odd-even-odd shuffle)"
  },
  "Add Two Numbers": {
    pattern:    "Carry-Aware Digit-by-Digit Add — walk both lists in lock-step, sum digits plus carry, emit one node per column.",
    insight:    "Digits arrive least-significant-first, so a single forward pass mirrors elementary-school addition without any reversal.",
    complexity: "T: O(n+m) S: O(n+m)",
    followup:   "Digits stored most-significant-first (reverse first or use a stack)?; subtract two linked-list numbers?; arbitrary radix?",
    clarify:    "Are inputs guaranteed non-negative with no leading zeros?; can either list be null?; mutate inputs or build a new list?",
    edges:      "Different lengths; final carry that grows the result by one digit; one input is a single zero node"
  },
  "Sort List": {
    pattern:    "Bottom-up Merge Sort — split via slow/fast, sort each half recursively, merge with a dummy head.",
    insight:    "Merging linked lists costs O(1) extra space per merge, so merge sort beats quicksort on lists by avoiding random access.",
    complexity: "T: O(n log n) S: O(log n)",
    followup:   "Iterative bottom-up pass with O(1) auxiliary space?; sort a doubly-linked list?; stable sort by a custom key?",
    clarify:    "Sort ascending or descending?; is stability required?; mutate the input list or return a new sorted list?",
    edges:      "Empty or single-node list (already sorted); already-sorted input; reverse-sorted input"
  },
  "Reorder List": {
    pattern:    "Mid-Reverse-Interleave — bisect with slow/fast, reverse the second half, then weave nodes from the two halves alternately.",
    insight:    "The target ordering is the interleave of the front half with the reversed back half, so three linear sub-passes suffice.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Restore the original ordering after the reorder?; reorder by an arbitrary permutation?; do it on a doubly-linked list?",
    clarify:    "Mutate in place with no allocation, or build a new list?; midpoint convention for even length?; can the list be empty?",
    edges:      "Empty or single-node list (no work); two-node list (no reordering needed); odd-length list (middle node anchors the result)"
  },
  "Rotate List": {
    pattern:    "Close-the-Ring + New Tail — measure length, take k mod length, close into a cycle, walk to the new tail and break it.",
    insight:    "Joining the list into a temporary ring removes the wrap-around special case and exposes the new head as one offset away.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Rotate left instead of right?; rotate a doubly-linked list?; rotate by a value rather than a count?",
    clarify:    "Direction of rotation (left or right)?; is k bounded by length, or must it be reduced modulo n?; can the list be empty?",
    edges:      "Empty or single-node list (no rotation); k mod length equals 0 (no-op); k larger than length (must reduce mod n)"
  },
  "Reverse Nodes in k-Group": {
    pattern:    "Iterative Reversal per Group — find the k-th node ahead, if absent, leave, otherwise reverse the block and reconnect via a per-group prev anchor.",
    insight:    "A dummy head plus a per-group prev anchor lets every reversed block splice cleanly into the surrounding list without disturbing later groups.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Recursive variant (O(n/k) stack)?; reverse the trailing partial group too instead of leaving it?; do it on a doubly-linked list?",
    clarify:    "If the tail has fewer than k nodes, leave them or also reverse?; is k guaranteed in [1, length]?; mutate pointers or values?",
    edges:      "k = 1 (no reversal needed); k equal to length (single full reversal); length not divisible by k (trailing partial group stays in place)"
  },
  // ───── Binary Search group (task 8.5) ─────
  "Binary Search": {
    pattern:    "Binary Search — Lower Bound — maintain a half-open or closed range invariant on a sorted array, halve the range each step until target is found or the range collapses.",
    insight:    "The loop invariant (which side of mid the target can still live in) dictates whether you write `mid+1` vs `mid` and `<` vs `<=`, mixing the two halves is the source of every off-by-one.",
    complexity: "T: O(log n) S: O(1)",
    followup:   "Find first or last occurrence of a duplicated target?; lower-bound vs upper-bound semantics?; binary search on the answer (parametric search)?",
    clarify:    "Is the array strictly sorted or non-decreasing?; return the index or only a boolean hit?; can the array be empty?",
    edges:      "Empty array (no result); target smaller than all elements or larger than all elements; target at the very first or last index"
  },
  "First Bad Version": {
    pattern:    "Predicate-Based Binary Search (find first true) — search [1, n] for the smallest version where isBadVersion returns true.",
    insight:    "A monotone predicate (false…false then true…true) lets you binary-search on the predicate itself rather than on a comparable value.",
    complexity: "T: O(log n) S: O(1)",
    followup:   "Reduce isBadVersion calls below log n given prior knowledge?; what if the predicate is non-monotone (must scan)?; report a confidence interval if the API can lie?",
    clarify:    "Is `isBadVersion` guaranteed monotone (once true, always true)?; is the API call the dominant cost?; are versions 1-indexed and contiguous?",
    edges:      "Version 1 is the first bad (no left half to discard); only version n is bad; n = 1 (single version, predicate decides directly)"
  },
  "Search in Rotated Sorted Array": {
    pattern:    "Pivoted Binary Search — at each midpoint decide which half is the sorted one, then check whether the target lies inside that sorted half.",
    insight:    "After a single rotation, at least one of [lo..mid] or [mid..hi] is still sorted, so one comparison per step narrows the search without finding the pivot first.",
    complexity: "T: O(log n) S: O(1)",
    followup:   "Allow duplicates (Search in Rotated Sorted Array II) where worst case degrades to O(n)?; first locate the pivot then run plain binary search on the correct half?; rotated 2D matrix variant?",
    clarify:    "Are values distinct?; is the array guaranteed to have been rotated at least once?; return the index or only a boolean?",
    edges:      "Array not actually rotated (behaves like plain binary search); rotation by exactly one position; target equals the rotation pivot or one of the endpoints"
  },
  "Find Minimum in Rotated Sorted Array": {
    pattern:    "Find Minimum via Right-Half Compare — compare nums[mid] with nums[hi], the minimum lives in whichever half breaks the sorted invariant.",
    insight:    "Comparing against nums[hi] rather than nums[lo] removes the special case for an array that was not rotated, because no rotation leaves the right half sorted by definition.",
    complexity: "T: O(log n) S: O(1)",
    followup:   "Allow duplicates (Find Minimum II) — when can you no longer narrow?; report the rotation count instead of the value?; minimum across two stacked rotated arrays?",
    clarify:    "Are values distinct?; can the array be unrotated (already sorted)?; is the array guaranteed non-empty?",
    edges:      "Already-sorted input (rotation 0, answer is nums[0]); rotation by exactly one position; single-element array (return that element)"
  },
  "Search a 2D Matrix": {
    pattern:    "Flatten 2D as Virtual 1D — binary search the index range [0, m*n) and decode each midpoint as (mid / n, mid % n) to read the matrix cell.",
    insight:    "Row-major sorted plus 'first of next row > last of previous row' makes the matrix one logical sorted sequence, so no decoding is needed beyond integer division and modulo.",
    complexity: "T: O(log m*n) S: O(1)",
    followup:   "Search a 2D Matrix II where rows and columns are independently sorted (staircase walk in O(m+n))?; insert into the matrix while preserving the sorted property?; range queries over a sorted 2D grid?",
    clarify:    "Are rows strictly increasing across the boundary (last of row i < first of row i+1)?; can the matrix be empty or have empty rows?; is m*n within int range to avoid overflow on the midpoint?",
    edges:      "Empty matrix or empty first row (return false immediately); target smaller than the top-left or larger than the bottom-right; single-row or single-column matrix"
  },
  "Time Based Key-Value Store": {
    pattern:    "Per-Key Sorted Timestamps + Floor Lookup — append (timestamp, value) on set, on get, binary search the largest timestamp ≤ query.",
    insight:    "Because set timestamps are strictly increasing per key, the per-key list is sorted by construction, so floor lookup collapses to a lower-bound search minus one.",
    complexity: "T: O(log n) S: O(n)",
    followup:   "Strictly-less-than variant (exclude exact matches)?; out-of-order set timestamps requiring a true ordered map?; range scan returning all values within a time window?",
    clarify:    "Are set timestamps guaranteed strictly increasing per key?; what to return when no timestamp ≤ query exists for the key?; can two keys collide on the same timestamp?",
    edges:      "Get on a key that was never set (return empty string); query timestamp before the earliest set (return empty string); query exactly on a set timestamp (return that value)"
  },
  "Maximum Profit in Job Scheduling": {
    pattern:    "DP + Binary Search by End Time — sort jobs by end time, dp[i] = max(dp[i-1], profit[i] + dp[p(i)]) where p(i) is the latest non-conflicting predecessor found by binary search.",
    insight:    "Sorting by end time turns the 'latest non-conflicting prior job' lookup into a log-n search on the sorted end-time prefix, replacing the O(n) inner scan of the naive DP.",
    complexity: "T: O(n log n) S: O(n)",
    followup:   "Reconstruct the chosen subset of jobs, not only the profit?; allow up to k overlapping jobs (multiple machines)?; weighted intervals with deadlines via a different DP shape?",
    clarify:    "Do touching intervals (end == start) count as conflicting?; are profits guaranteed non-negative?; can two jobs share identical start and end times?",
    edges:      "Single job (answer is its own profit); all jobs mutually overlapping (pick the single highest profit); jobs that chain end-to-end with no overlap (answer is the full sum)"
  },
  "Median of Two Sorted Arrays": {
    pattern:    "Median Partitioning of Two Sorted Arrays — binary search the partition point in the smaller array so the two left halves total (m+n+1)/2 elements with maxLeft ≤ minRight across both arrays.",
    insight:    "The median is fixed by a balanced partition where the four boundary values interleave correctly, so it can be found without merging or even reading both arrays in full.",
    complexity: "T: O(log min m,n) S: O(1)",
    followup:   "Median of k sorted arrays?; kth-smallest across two sorted arrays?; running median over a stream (two-heap)?",
    clarify:    "Combined length parity (odd vs even) — average the two middles?; can either array be empty?; are values distinct or can duplicates straddle the partition?",
    edges:      "One array empty (median sits inside the other); arrays of very different sizes (search the smaller to keep log min m,n); combined length is odd vs even (single middle vs average)"
  },
  // ───── Trees group (task 8.6) ─────
  "Invert Binary Tree": {
    pattern:    "DFS — Recursive Mirror — at each node swap left and right child, then recurse on both subtrees.",
    insight:    "Inversion is a structural symmetry, so swapping children at every node is sufficient and order-independent.",
    complexity: "T: O(n) S: O(h)",
    followup:   "Iterative version using a queue or explicit stack?; invert in place vs. return a freshly allocated tree?; inversion on an n-ary tree?",
    clarify:    "Are duplicate values permitted?; is the tree guaranteed balanced (affects recursion depth)?; mutate input or return a new tree?",
    edges:      "Empty tree (return null); single node (no swap needed); fully skewed tree where recursion depth equals n"
  },
  "Maximum Depth of Binary Tree": {
    pattern:    "DFS — Post-Order Aggregate — depth at a node equals 1 + max(depth(left), depth(right)).",
    insight:    "Depth is a bottom-up scalar, so each node needs only its two children's depths to answer for itself.",
    complexity: "T: O(n) S: O(h)",
    followup:   "Minimum depth (must reach a leaf)?; iterative BFS by levels?; maximum depth of an n-ary tree?",
    clarify:    "Is depth measured in nodes or edges?; can the root be null (depth 0)?; do node values matter or only structure?",
    edges:      "Empty tree (depth 0); single node (depth 1); fully skewed tree (depth equal to node count)"
  },
  "Same Tree": {
    pattern:    "DFS — Parallel Recursion — both roots null is true, otherwise both non-null with equal value and matching subtrees.",
    insight:    "Tree equality decomposes into a per-node parallel walk where any structural or value mismatch terminates early.",
    complexity: "T: O(n) S: O(h)",
    followup:   "Iterative variant with paired stacks?; structural equality only, ignoring values?; check whether one tree is a subtree of another?",
    clarify:    "Are node values guaranteed comparable with strict equality?; treat NaN as equal to NaN?; is empty-vs-empty considered equal?",
    edges:      "Both empty (true); one empty and the other non-empty (false); identical structure with one differing leaf value"
  },
  "Symmetric Tree": {
    pattern:    "DFS — Recursive Mirror Compare — recurse on (left.left, right.right) and (left.right, right.left), both pairs must match.",
    insight:    "Symmetry is equality of a tree with its own mirror image, so the recursion compares opposite-side children rather than same-side ones.",
    complexity: "T: O(n) S: O(h)",
    followup:   "Iterative version using a deque that pairs opposite nodes?; turn an asymmetric tree into a symmetric one?; n-ary symmetric variant?",
    clarify:    "Must values match in addition to structure?; is an empty tree symmetric?; can node values be null or NaN?",
    edges:      "Empty tree (symmetric); single node (symmetric); structurally identical halves with one mismatched leaf value"
  },
  "Subtree of Another Tree": {
    pattern:    "DFS + Same-Tree Probe — at every node of the main tree, run the Same Tree check against subRoot.",
    insight:    "Subtree containment is a local property, so once the right anchor is found, structural and value equality decide it.",
    complexity: "T: O(n*m) S: O(h)",
    followup:   "Linear-time solution via tree serialization with null sentinels and substring search (KMP)?; structural-only subtree match?; many subRoot queries against the same main tree?",
    clarify:    "Must the subtree match values and structure?; is subRoot guaranteed non-null?; how should duplicate values be handled when probing?",
    edges:      "subRoot equal to root (full-tree match); subRoot matches a leaf; subRoot deeper than any anchor in root (no match)"
  },
  "Balanced Binary Tree": {
    pattern:    "DFS — Post-Order Height with Early Exit — return a sentinel (-1) up the stack the moment any subtree's heights differ by more than 1.",
    insight:    "Returning the sentinel short-circuits all ancestors, so the balance check stays O(n) instead of recomputing heights per node.",
    complexity: "T: O(n) S: O(h)",
    followup:   "AVL self-balancing rotations on insert and delete?; weight-balanced (size-based) trees?; report the deepest unbalanced node, not only a boolean?",
    clarify:    "Definition of balanced (AVL: |hL - hR| ≤ 1 at every node)?; is the empty tree balanced?; height measured in nodes or edges?",
    edges:      "Empty tree (balanced); single node (balanced); fully skewed tree (unbalanced at every internal node)"
  },
  "Diameter of Binary Tree": {
    pattern:    "DFS — Diameter via Post-Order Heights — at each node, candidate diameter = leftHeight + rightHeight, return height to the parent.",
    insight:    "Every path has a highest ancestor, so summing left and right heights at every node covers every possible path exactly once.",
    complexity: "T: O(n) S: O(h)",
    followup:   "Diameter measured in nodes vs. edges?; weighted edges?; maximum-sum path instead of longest path (Binary Tree Maximum Path Sum)?",
    clarify:    "Is diameter measured in edges or nodes?; can the tree be empty (return 0)?; do node values factor into the metric?",
    edges:      "Empty tree (diameter 0); single node (diameter 0); long skewed branch where the diameter is one straight chain"
  },
  "Binary Tree Level Order Traversal": {
    pattern:    "BFS — Level Order — drain the queue one level at a time using its current size as the level boundary.",
    insight:    "Capturing the queue's size before draining a level slices BFS into per-level lists without inserting null markers.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Bottom-up level order (reverse the output)?; zigzag level order alternating direction?; level order on an n-ary tree?",
    clarify:    "Return list of lists or a single flattened list?; is empty tree returned as an empty list?; is left-to-right order required within each level?",
    edges:      "Empty tree (empty list); single node (one level); fully skewed tree (n levels of one node each)"
  },
  "Binary Tree Right Side View": {
    pattern:    "Right-Most Per Level (BFS or DFS Right-First) — emit the last node dequeued at each BFS level, or DFS visiting right before left and recording the first node seen at each depth.",
    insight:    "The visible node at each level is the rightmost in left-to-right order, which can also be a left child if no right sibling exists.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Left side view?; both sides emitted together?; bottom view (lowest node per column index)?",
    clarify:    "Does 'right side' mean rightmost at each level rather than only right children?; empty tree returns an empty list?; is the root always part of the view?",
    edges:      "Empty tree (empty list); fully left-skewed tree (every node visible from the right); levels where the rightmost node is actually a left child"
  },
  "Lowest Common Ancestor of a Binary Tree": {
    pattern:    "DFS — LCA via Subtree Returns — recurse on left and right, return non-null when the subtree contains p, q, or both.",
    insight:    "The first node whose left and right recursive returns are both non-null is the split point, hence the LCA.",
    complexity: "T: O(n) S: O(h)",
    followup:   "LCA with parent pointers (intersection-of-two-lists technique)?; LCA of more than two nodes?; offline LCA via Tarjan or binary lifting for many queries?",
    clarify:    "Are p and q guaranteed present in the tree?; can p be an ancestor of q?; are node values unique?",
    edges:      "p equals q (LCA is that node); p is an ancestor of q (LCA is p); p and q in different subtrees of the root (LCA is root)"
  },
  "Construct Binary Tree from Preorder and Inorder Traversal": {
    pattern:    "DFS — Preorder/Inorder Reconstruction with Index Map — first preorder element is the current root, its inorder index splits the inorder range into left and right subtree spans.",
    insight:    "Preorder identifies the root and inorder bounds the subtrees, so a value→inorder-index map turns each split into O(1).",
    complexity: "T: O(n) S: O(n)",
    followup:   "Inorder + Postorder reconstruction?; preorder + postorder (ambiguous without leaf information)?; reconstruct from level order + inorder?",
    clarify:    "Are values guaranteed unique?; can the input arrays be empty?; are the two arrays guaranteed to be valid traversals of the same tree?",
    edges:      "Empty arrays (return null); single node; fully skewed tree where preorder is one long left or right chain"
  },
  "Path Sum II": {
    pattern:    "Backtracking — DFS with Path Stack — push the node value on entry, on a leaf with running sum equal to target snapshot the path, pop on return.",
    insight:    "Mutating one shared path list and copying only on success keeps allocations proportional to the number of valid paths, not nodes.",
    complexity: "T: O(n^2) S: O(h)",
    followup:   "Count qualifying paths only without enumerating them?; paths between any two nodes (Path Sum III)?; paths whose sum lies in a range [lo, hi]?",
    clarify:    "Must each path end at a leaf (root-to-leaf only)?; can node values be negative?; return all paths or only the count?",
    edges:      "Empty tree (no paths); single node equal to target (one path); negative values that allow non-monotone running sum"
  },
  "Path Sum III": {
    pattern:    "Prefix-Sum Hash Map on Path — DFS while maintaining a count of running sums on the current root-to-node path, at each node add count[runSum - target] to the answer.",
    insight:    "Subarray-sum-equals-k generalises to root-to-node paths, so a per-path prefix-sum frequency map turns the inner search into O(1).",
    complexity: "T: O(n) S: O(n)",
    followup:   "Paths in any direction, not only top-down?; longest qualifying path?; count paths with sum in a range [lo, hi]?",
    clarify:    "Must paths go strictly downward (parent to child)?; can node values be negative or zero?; is the running sum within int range?",
    edges:      "Empty tree (zero paths); target = 0 with zero-valued nodes (multiple zero-sum paths); paths whose negatives cancel positives mid-walk"
  },
  "Binary Tree Zigzag Level Order Traversal": {
    pattern:    "BFS — Level Order with Direction Flip — drain by level size, reverse each level's output on alternate levels.",
    insight:    "Direction is a per-level concern, not a per-node one, so a single boolean flipped each level keeps the BFS pure.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Implement using a deque with insert-front vs. insert-back instead of post-reversal?; zigzag on an n-ary tree?; vertical-order traversal?",
    clarify:    "Does the first level go left-to-right or right-to-left?; return list of lists?; treat empty tree as empty list?",
    edges:      "Empty tree (empty list); single node (one level); two-level tree where the second level appears reversed"
  },
  "Maximum Width of Binary Tree": {
    pattern:    "Position-Indexed BFS for Width — assign each node a heap-style index (left child = 2i, right child = 2i+1), per-level width = lastIndex - firstIndex + 1.",
    insight:    "Width counts the span between extant nodes including null gaps, so explicit positional indices replace any null-padding scheme.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Avoid index overflow on very deep trees by re-basing indices each level?; vertical width (column count) instead of horizontal?; width in an n-ary tree?",
    clarify:    "Is width inclusive of null gaps between real nodes?; does a single-node tree count as width 1?; is bigint or re-basing required for very deep trees?",
    edges:      "Empty tree (width 0); single node (width 1); a level where only the leftmost and rightmost positions are filled with all interior gaps null"
  },
  "All Nodes Distance K in Binary Tree": {
    pattern:    "Convert to Graph + BFS — one DFS to attach parent pointers, then BFS from target with a visited set up to depth k.",
    insight:    "Distance is undirected, so adding parent edges turns the tree into a graph where ordinary BFS yields the answer in one sweep.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Solution without converting to a graph (downward DFS plus an upward DFS with offset)?; nodes within distance ≤ k?; multi-source distance K?",
    clarify:    "Is target guaranteed present in the tree?; are node values unique?; include target itself when k = 0?",
    edges:      "k = 0 (return [target.val]); k larger than tree diameter (empty result); target equals the root (only downward BFS needed)"
  },
  "Serialize and Deserialize Binary Tree": {
    pattern:    "BFS/DFS Encode/Decode with Sentinel — preorder DFS writes each node value or a null sentinel, deserialize consumes tokens left-to-right and rebuilds the same shape.",
    insight:    "Encoding nulls explicitly turns ambiguous traversals into unique reconstructions, so a single ordered stream suffices.",
    complexity: "T: O(n) S: O(n)",
    followup:   "BFS-based serialization (LeetCode-style with trailing nulls trimmed)?; binary-safe encoding for arbitrary value types?; serialize an n-ary tree?",
    clarify:    "What sentinel marks a null child (e.g. '#')?; can node values contain the delimiter or sentinel character?; is whitespace tolerated between tokens?",
    edges:      "Empty tree (round-trips to empty); single node; values containing the delimiter or sentinel character"
  },
  "Binary Tree Maximum Path Sum": {
    pattern:    "DFS — Global-Maximum Path via Subtree Gain — at each node, candidate = node.val + max(0, leftGain) + max(0, rightGain), return node.val + max(0, max(leftGain, rightGain)) to the parent.",
    insight:    "A node either anchors the answer (using both child gains) or contributes one side upward, clamping negative gains to 0 unifies both cases.",
    complexity: "T: O(n) S: O(h)",
    followup:   "Path constrained to a fixed length k?; report the actual path, not only its sum?; weighted edges instead of node values?",
    clarify:    "Must the path contain at least one node (yes per spec)?; can node values be negative?; is the path constrained to be top-down or any shape?",
    edges:      "Single node with negative value (answer is that value); all-negative tree (answer is the largest single value); long skewed path (answer is the chain sum)"
  },
  "Lowest Common Ancestor of a BST": {
    pattern:    "BST — Property-Pruning Descent — at each node, descend left if both p and q are smaller, right if both are larger, otherwise the current node is the LCA.",
    insight:    "BST ordering localises the LCA to the first node whose value lies between p and q, so a full traversal is unnecessary.",
    complexity: "T: O(h) S: O(1)",
    followup:   "LCA in a general binary tree without ordering?; LCA when one or both nodes may be absent?; iterative vs. recursive trade-offs in stack space?",
    clarify:    "Are p and q guaranteed present and distinct?; are values unique across the BST?; can p equal q?",
    edges:      "p or q equals the root (root is the LCA); p is an ancestor of q (the ancestor is the LCA); fully skewed BST so descent depth equals n"
  },
  "Convert Sorted Array to BST": {
    pattern:    "Divide & Conquer — Middle as Root — root = arr[mid], recurse on [l, mid-1] for the left subtree and [mid+1, r] for the right.",
    insight:    "Choosing the middle element as the root each recursion guarantees height-balance because the two halves differ in size by at most one.",
    complexity: "T: O(n) S: O(log n)",
    followup:   "Convert a sorted linked list to a height-balanced BST in O(n) (inorder simulation)?; build a height-balanced BST from unsorted input?; AVL or red-black variants?",
    clarify:    "Tie-break for even-length subarrays (left or right middle)?; are values guaranteed unique?; is the requirement strictly height-balanced or weight-balanced?",
    edges:      "Empty array (return null); single element (one-node tree); even-length array where the mid choice changes shape but not balance"
  },
  "Validate Binary Search Tree": {
    pattern:    "DFS — Inorder with Range Bounds — recurse passing (lo, hi), each node value must satisfy lo < val < hi, left tightens hi, right tightens lo.",
    insight:    "Local parent-child checks are insufficient, only an inherited (lo, hi) interval enforces BST validity transitively across all descendants.",
    complexity: "T: O(n) S: O(h)",
    followup:   "Iterative inorder with a strictly-increasing previous-value check?; allow duplicates by relaxing strict < to ≤?; recover a BST after exactly one swap (Recover BST)?",
    clarify:    "Are duplicates allowed (strict < or ≤)?; can node values reach INT_MIN or INT_MAX (use null bounds rather than sentinels)?; is the empty tree valid?",
    edges:      "Empty tree (valid); single node (valid); deep tree where a far-down right descendant of a left subtree violates the inherited upper bound"
  },
  "Kth Smallest Element in a BST": {
    pattern:    "Inorder Iterator with Stack — push the left chain, pop, decrement k, and return when k hits 0, otherwise descend into the popped node's right child.",
    insight:    "Inorder traversal of a BST is sorted by construction, so the kth pop is the answer without materialising the full sorted list.",
    complexity: "T: O(h + k) S: O(h)",
    followup:   "Frequent k queries with a mutating tree (augment nodes with subtree size)?; kth largest via reverse inorder?; kth in a balanced BST in O(log n) with size annotations?",
    clarify:    "Is k 1-indexed?; is k guaranteed in [1, n]?; can the tree mutate between queries?",
    edges:      "k = 1 (leftmost node); k = n (rightmost node); fully right-skewed tree where inorder is the input order"
  },
  "Inorder Successor in BST": {
    pattern:    "BST Successor via Right-Subtree Min — if p has a right subtree, descend to its leftmost node, otherwise walk down from the root tracking the deepest ancestor whose value is greater than p.val.",
    insight:    "Successor splits cleanly into two disjoint cases based on whether p has a right child, both resolvable in O(h) without parent pointers.",
    complexity: "T: O(h) S: O(1)",
    followup:   "Inorder predecessor (mirror)?; successor in a non-BST binary tree using inorder?; successor when nodes carry parent pointers?",
    clarify:    "Are node values unique?; what to return when p is the maximum (no successor)?; is p guaranteed present in the tree?",
    edges:      "p is the maximum (return null); p has a right child (descend to its leftmost); p in a left subtree where the successor is several levels up the ancestor chain"
  },
  // ───── Graphs group (task 8.7) ─────
  "Flood Fill": {
    pattern:    "DFS — Recursive Flood — recurse to 4-neighbours that match the original colour and recolour each cell in place.",
    insight:    "Mutating the cell to the new colour as you visit doubles as the visited marker, eliminating any auxiliary set.",
    complexity: "T: O(m*n) S: O(m*n)",
    followup:   "Iterative BFS to bound stack depth?; flood with diagonal (8-neighbour) connectivity?; bounded-region fill where the boundary itself is excluded?",
    clarify:    "Are 4-directional moves the only ones allowed?; what if the start cell already equals newColor (no-op)?; mutate input grid or return a copy?",
    edges:      "newColor equal to the starting cell's colour (must terminate without infinite recursion); single-cell grid; flood that touches every grid border"
  },
  "Number of Islands": {
    pattern:    "DFS Connected-Components on Grid — for each unvisited '1' launch a flood fill and increment the island counter.",
    insight:    "An island count is exactly the number of components in the implicit graph of '1' cells under 4-neighbour adjacency.",
    complexity: "T: O(m*n) S: O(m*n)",
    followup:   "Streaming version where land cells are added one at a time (Number of Islands II via Union-Find)?; 8-direction connectivity?; report the largest island's area?",
    clarify:    "Are diagonal neighbours considered connected?; is mutating the grid as a visited marker acceptable?; can the grid be empty?",
    edges:      "All-water grid (count 0); all-land grid (count 1); single-row or single-column grid"
  },
  "Rotting Oranges": {
    pattern:    "BFS — Multi-Source Layered — seed the queue with every initially rotten orange and advance one minute per BFS layer.",
    insight:    "Parallel rotting at distance d from any source matches the d-th BFS layer when all rotten cells share the queue from minute zero.",
    complexity: "T: O(m*n) S: O(m*n)",
    followup:   "Track which cell rotted last (the bottleneck)?; rotting with diagonal spread?; multiple decay rates per orange type?",
    clarify:    "Do empty cells block spread?; does minute zero count as one elapsed minute?; return -1 when any fresh orange is unreachable?",
    edges:      "No fresh oranges initially (return 0); fresh oranges with no rotten neighbour reachable (return -1); grid where every cell is empty"
  },
  "Clone Graph": {
    pattern:    "DFS Clone with Visited Map — original-node → cloned-node hash, recurse on neighbours, attaching clones to the new node.",
    insight:    "The visited map both prevents cycles and serves as the alias table that lets duplicate edges share a single clone.",
    complexity: "T: O(V+E) S: O(V)",
    followup:   "Iterative BFS clone using the same map?; deep-clone a directed graph with parallel edges?; clone preserving custom node properties?",
    clarify:    "Are node values guaranteed unique?; can the input be null?; should self-loops be preserved?",
    edges:      "Empty input graph (return null); single isolated node (no edges); graph with a self-loop or duplicate parallel edges"
  },
  "01 Matrix": {
    pattern:    "Multi-Source BFS for Distances — seed every 0 cell at distance 0, BFS outward updates each unvisited 1 with the next layer.",
    insight:    "Distance to the nearest of many sources collapses to one ordinary BFS when the queue starts populated with every source.",
    complexity: "T: O(m*n) S: O(m*n)",
    followup:   "Two-pass DP using min(top, left) then min(bottom, right) for O(1) auxiliary space?; weighted distances with non-uniform costs (Dijkstra)?; arbitrary blocked cells?",
    clarify:    "Are diagonal moves allowed?; is the grid guaranteed to contain at least one 0?; mutate the input or return a fresh distance matrix?",
    edges:      "All zeros (every distance is 0); single row or single column; cell whose nearest 0 sits on the opposite corner"
  },
  "Word Search": {
    pattern:    "Backtracking on Grid — DFS from every starting cell, mark visited in place and unmark on the way back.",
    insight:    "In-place visited marking via a sentinel character avoids an auxiliary set without disturbing other DFS branches once unmarked.",
    complexity: "T: O(m*n*4^L) S: O(L)",
    followup:   "Many words against the same grid (Word Search II via Trie pruning)?; allow diagonal moves?; case-insensitive matching?",
    clarify:    "Can the same cell be reused within one path?; are 4-directional moves the only ones allowed?; is the word guaranteed non-empty?",
    edges:      "Single-character word equal to a single cell; word longer than the cell count (must return false); path that would require revisiting a sentinel-marked cell"
  },
  "Course Schedule": {
    pattern:    "Topological Sort — DFS Three-Color — WHITE/GRAY/BLACK marks, encountering a GRAY neighbour proves a cycle and disqualifies the schedule.",
    insight:    "A cycle is precisely a back-edge to a node still on the recursion stack, which the GRAY mark detects in one DFS pass.",
    complexity: "T: O(V+E) S: O(V+E)",
    followup:   "Return the order rather than only feasibility (Course Schedule II)?; report which courses participate in a cycle?; Kahn (BFS) variant for the same check?",
    clarify:    "Can prerequisite pairs duplicate?; are self-prerequisites possible?; is the input a list of directed edges (a, b) meaning a depends on b?",
    edges:      "No prerequisites (always feasible); single self-loop (always infeasible); two-node mutual dependency (a→b and b→a)"
  },
  "Course Schedule II": {
    pattern:    "Topological Sort — Kahn (BFS) — start with every zero-indegree node, repeatedly emit one and decrement the indegree of its successors.",
    insight:    "Order existence and the order itself fall out of the same sweep: an emit count below V signals a cycle, otherwise the emission sequence is valid.",
    complexity: "T: O(V+E) S: O(V+E)",
    followup:   "Lexicographically smallest topological order via a min-heap of zero-indegree nodes?; enumerate every valid order?; DFS post-order alternative?",
    clarify:    "Return any valid order or a specific tie-break?; can the prerequisites list be empty?; are course indices guaranteed in [0, n)?",
    edges:      "No prerequisites (return [0..n-1]); cycle present (return empty list); disconnected sub-graphs where any interleaving is valid"
  },
  "Number of Connected Components": {
    pattern:    "Union-Find with Path Compression — union the endpoints of every edge, the answer is the number of distinct roots among the n nodes.",
    insight:    "Component count starts at n and decreases by exactly one each successful union, so a running counter avoids a final root-scan pass.",
    complexity: "T: O(V + E*α) S: O(V)",
    followup:   "Online edges with deletion (link-cut trees)?; weighted components by node count?; DFS-forest alternative with the same complexity?",
    clarify:    "Are edges undirected?; is n guaranteed positive?; can edges contain self-loops or duplicates?",
    edges:      "No edges (n components); fully connected graph (1 component); self-loop edge that should not change the count"
  },
  "Graph Valid Tree": {
    pattern:    "Union-Find for Tree Validation — exactly n-1 edges and every union must merge two distinct components.",
    insight:    "A graph is a tree iff it has exactly n-1 edges and is fully connected, any failed union would create a cycle.",
    complexity: "T: O(V + E*α) S: O(V)",
    followup:   "DFS-based check using parent tracking to detect cycles?; allow a self-loop and report which edge breaks the tree?; weighted minimum spanning tree variant?",
    clarify:    "Are edges undirected?; can edges be duplicated?; is n guaranteed positive?",
    edges:      "Single isolated node (valid tree); exactly n-1 edges but disconnected (invalid); edge list with a duplicate edge (creates a cycle)"
  },
  "Accounts Merge": {
    pattern:    "Union-Find over Emails — for each account, union every email with the account's first email, group emails by their final root.",
    insight:    "Account identity is transitive over shared emails, so unioning by a representative email collapses every overlapping account into one component.",
    complexity: "T: O(N*K*α) S: O(N*K)",
    followup:   "DFS over an email-to-account adjacency list as an alternative?; case-insensitive email comparison?; streaming account merges?",
    clarify:    "Should output emails be sorted within each account?; are account names guaranteed consistent across shared emails?; is comparison case-sensitive?",
    edges:      "Account with a single email and no overlap (returns the input); two accounts identical except for the name (merge into one); chain of accounts each sharing one email with the next"
  },
  "Pacific Atlantic Water Flow": {
    pattern:    "Reverse-Direction Multi-Source BFS — flood inward from each ocean's border cells, only stepping to neighbours of equal-or-greater height.",
    insight:    "Flowing in reverse from every border source is one BFS per ocean, the answer is the intersection of the two reachable sets.",
    complexity: "T: O(m*n) S: O(m*n)",
    followup:   "DFS variant from the borders with the same intersection logic?; weighted heights with rainfall amounts?; report the path, not only the cells?",
    clarify:    "Is equal-height flow allowed?; can heights be negative?; is the grid guaranteed rectangular and non-empty?",
    edges:      "Single-cell grid (cell touches both oceans); flat grid where every cell drains to both oceans; tall mountain in the centre that drains nowhere"
  },
  "Minimum Height Trees": {
    pattern:    "BFS Trim from Leaves — repeatedly peel every degree-1 node until 1 or 2 nodes remain, those are the centroid roots.",
    insight:    "The centre(s) of a tree minimise eccentricity, and a tree has at most two centres reachable by trimming layers from the outside in.",
    complexity: "T: O(V+E) S: O(V+E)",
    followup:   "Find the diameter by two BFS sweeps?; centroids of a weighted tree?; centroid in a forest with multiple components?",
    clarify:    "Is the input guaranteed to be a tree (n-1 edges, connected)?; can n be 1 (return [0])?; are duplicate edges possible?",
    edges:      "Single node (return [0]); two nodes (return both endpoints); long path graph where the centre is the middle one or two nodes"
  },
  "Minimum Knight Moves": {
    pattern:    "BFS over Knight Moves — uniform-weight BFS from origin, eight L-shaped neighbours per node, first dequeue of target is the answer.",
    insight:    "Symmetry over the four quadrants means searching only the |x|, |y| ≥ 0 region with reflected moves keeps the explored area finite.",
    complexity: "T: O(|x|*|y|) S: O(|x|*|y|)",
    followup:   "Bidirectional BFS to halve the explored area?; A* with an admissible Chebyshev-style heuristic?; arbitrary board size with blocked cells?",
    clarify:    "Is the board infinite or bounded?; does the origin always count as 0 moves?; can the target lie at the origin?",
    edges:      "Target at the origin (0 moves); target at (1, 0) which requires the knight's awkward 3-move dance; target on the board diagonal where symmetry pruning matters"
  },
  "Cheapest Flights Within K Stops": {
    pattern:    "Bellman-Ford with k-Hop Limit — relax every edge K+1 times against a frozen previous-round distance array to enforce the hop cap.",
    insight:    "A hop limit forbids in-round chained relaxations, so each round must read from a snapshot of the previous round rather than the live array.",
    complexity: "T: O(K*E) S: O(V)",
    followup:   "Dijkstra on (node, hops) states with a priority queue?; weighted hop costs?; return the path itself, not only the cost?",
    clarify:    "Is K the number of intermediate stops (so K+1 edges allowed)?; are flight prices non-negative?; can src equal dst?",
    edges:      "K = 0 (only direct flights count); src equals dst (cost 0); destination unreachable within K stops (return -1)"
  },
  "Shortest Path to Get Food": {
    pattern:    "BFS from Person — uniform-cost BFS from '*' to the nearest '#' cell, treating walls and obstacles as blocked.",
    insight:    "Single-source multi-target shortest path collapses to one ordinary BFS that terminates the moment any food cell is dequeued.",
    complexity: "T: O(m*n) S: O(m*n)",
    followup:   "Multiple people sharing the same food map?; weighted terrain costs (Dijkstra)?; return the path, not only the distance?",
    clarify:    "Are diagonal moves allowed?; is exactly one '*' guaranteed?; do open cells include the starting cell at distance 0?",
    edges:      "No food reachable (return -1); food adjacent to the person (distance 1); grid where the only path winds around obstacles"
  },
  "Word Ladder": {
    pattern:    "BFS — Layered Word Ladder — neighbours are words one letter swap away, generated via wildcard buckets keyed like 'h*t'.",
    insight:    "Building wildcard adjacency on the fly via 'h*t'-style patterns avoids materialising an explicit O(N^2) edge list.",
    complexity: "T: O(N*L^2) S: O(N*L^2)",
    followup:   "Bidirectional BFS for fewer expansions?; return all shortest transformation paths (Word Ladder II)?; allow inserts and deletes (edit-distance neighbours)?",
    clarify:    "Must every intermediate word be in the word list?; is endWord guaranteed in the list?; is comparison case-sensitive?",
    edges:      "endWord not in the word list (return 0); beginWord equal to endWord (return 1 by spec); chain length 2 where one letter swap directly reaches endWord"
  },
  "Word Search II": {
    pattern:    "Trie + DFS Backtracking — index the dictionary in a trie, DFS from each cell, descending the trie one character per step.",
    insight:    "Trie nodes prune entire DFS subtrees the moment no dictionary prefix matches, so many words share the same exploration cost.",
    complexity: "T: O(m*n*4^L) S: O(W*L)",
    followup:   "Prune trie nodes once their word is found to speed up later searches?; allow diagonal moves?; case-insensitive matching?",
    clarify:    "Can the same cell be reused within one word?; are duplicate words possible in the input list?; is case-sensitive matching required?",
    edges:      "Empty word list (return empty); word equal to a single cell; words sharing long prefixes that should each be reported once"
  },
  "Alien Dictionary": {
    pattern:    "Topological Sort over Character Edges — derive an edge a→b from the first differing character of each adjacent word pair, then Kahn-sort the chars.",
    insight:    "The complete order is the topological order of a graph whose only edges come from adjacent-word disagreements, non-edge pairs are unconstrained.",
    complexity: "T: O(C+E) S: O(C+E)",
    followup:   "Detect when the input is invalid because a longer word appears before its strict prefix?; enumerate every valid order?; lexicographically smallest valid order?",
    clarify:    "Are characters limited to lowercase ASCII?; do duplicate adjacent words break the input?; how should disconnected characters be ordered (any position)?",
    edges:      "Single-word input (any character order is valid); cycle in derived edges (return empty string); a longer word followed by its strict prefix (invalid input)"
  },
  "Longest Increasing Path in a Matrix": {
    pattern:    "DFS with Memoization on DAG — strict-increase neighbours form an implicit DAG, memo[i][j] = 1 + max over greater 4-neighbours.",
    insight:    "Strict inequality removes any chance of cycles, so the grid is a DAG and each cell's answer is computed exactly once via memoisation.",
    complexity: "T: O(m*n) S: O(m*n)",
    followup:   "Topological-order DP from cells sorted by value as an alternative?; non-strict inequality (allow equal) and re-handle cycles?; report the path itself?",
    clarify:    "Are 4-directional moves the only ones allowed?; is strict-increase required (equal disallowed)?; can the grid be empty?",
    edges:      "Single cell (length 1); strictly decreasing grid (length 1 from every cell); diagonal-only path that requires each turn to find the next greater neighbour"
  },
  "Bus Routes": {
    pattern:    "BFS over Bidirectional Stop-to-Route Graph — alternate layers between stops and routes, expanding a route enqueues every stop it covers.",
    insight:    "Modelling routes as their own graph nodes makes one BFS layer correspond to one bus boarding, so the answer is the layer count to reach the destination stop.",
    complexity: "T: O(V+E) S: O(V+E)",
    followup:   "Weighted edges by stop-to-stop distance instead of unit boardings?; bidirectional BFS from both source and target?; restrict transfers to a maximum count?",
    clarify:    "Are routes circular (the bus loops indefinitely)?; can a stop appear in multiple routes?; if source equals target, return 0?",
    edges:      "Source equals target (return 0); destination unreachable from source (return -1); single route that visits both source and target (return 1)"
  },
  // ───── Heap, Trie, Recursion & Misc group (task 8.8) ─────
  "K Closest Points to Origin": {
    pattern:    "Max-Heap of Size K — push each point keyed by squared distance, pop the max whenever heap size exceeds k.",
    insight:    "A heap of size k bounded by the kth-best distance avoids sorting the entire list and uses only O(k) memory.",
    complexity: "T: O(n log k) S: O(k)",
    followup:   "Quickselect for O(n) average time and O(k) output?; streaming points with continuous queries?; kth-closest under a non-Euclidean metric?",
    clarify:    "Use squared distance to avoid sqrt?; tie-break arbitrarily?; can n equal k (return all)?",
    edges:      "k equals n (return every point); duplicate points at the same distance (any tie order valid); a single point at the origin (distance 0)"
  },
  "Task Scheduler": {
    pattern:    "Greedy + Max-Heap by Frequency — schedule the most-frequent ready task each tick, cooled tasks queue until cooldown elapses.",
    insight:    "The answer is bounded below by (max_freq - 1) * (n + 1) + tied_count, and a greedy heap reaches that bound in every case.",
    complexity: "T: O(N log K) S: O(K)",
    followup:   "Reconstruct the actual schedule rather than only its length?; per-task variable cooldowns?; multiple CPUs running tasks in parallel?",
    clarify:    "Do idle slots count toward total time?; is task identity case-sensitive?; can n be zero (no cooldown)?",
    edges:      "n = 0 (answer equals task count); one task type with very high frequency (idle-dominated); all distinct tasks (no idle needed)"
  },
  "Top K Frequent Words": {
    pattern:    "Min-Heap of Size K with Composite Key — order by (frequency, reversed-lex) so the heap root is the easiest to evict.",
    insight:    "Inverting the lexicographic order inside the heap lets a single min-heap return the top-k while still respecting the lex tiebreaker.",
    complexity: "T: O(n log k) S: O(n)",
    followup:   "Bucket sort by frequency for O(n) when k is small?; streaming Top-K via Misra-Gries?; case-insensitive equality?",
    clarify:    "Is the tie-break ascending lexicographic?; case-sensitive comparison?; can k exceed unique-word count?",
    edges:      "k equals unique-word count (return every word); all words tied in frequency (pure lex sort); single repeated word"
  },
  "Find K Closest Elements": {
    pattern:    "Two-Pointer Window on Sorted Array — binary search the window's left endpoint where arr[mid+k] is farther from x than arr[mid].",
    insight:    "Because the array is sorted, the answer is always a contiguous window of length k, so the search reduces to choosing the left endpoint.",
    complexity: "T: O(log n + k) S: O(k)",
    followup:   "Unsorted input via heap-of-size-k?; closest in a sorted matrix?; tie-break toward larger value?",
    clarify:    "Is tie-break toward smaller value?; can k exceed n?; how to handle absolute-distance equality?",
    edges:      "x smaller than every element (leftmost k); x larger than every element (rightmost k); k equal to n (return all)"
  },
  "Kth Largest Element in an Array": {
    pattern:    "Quickselect / Heap Top-K — partition around a pivot until the pivot index lands at n-k, or maintain a min-heap of size k.",
    insight:    "Full sorting wastes work, quickselect averages O(n) time and a size-k heap caps memory at k.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Worst-case O(n) via median-of-medians pivot?; streaming kth largest using a heap of size k?; kth smallest by symmetry?",
    clarify:    "Is k 1-indexed?; can the array contain duplicates?; mutate input or preserve it?",
    edges:      "k = 1 (maximum); k = n (minimum); all elements equal (any pivot returns the same value)"
  },
  "Find Median from Data Stream": {
    pattern:    "Two Heaps (Max + Min) for Streaming Median — max-heap holds the lower half, min-heap holds the upper half, rebalance after every insert.",
    insight:    "The median is always a function of the two heap tops, so neither half ever needs to be sorted as a whole.",
    complexity: "T: O(log n) S: O(n)",
    followup:   "Sliding-window median via balanced BST or two multisets?; weighted median?; remove an arbitrary value from the stream?",
    clarify:    "Is the stream allowed to be empty when findMedian is called?; integer or floating-point inputs?; even-count tie-break (average of two middles)?",
    edges:      "Single element (median equals that element); strictly increasing stream (max-heap fills first); strictly decreasing stream (min-heap fills first)"
  },
  "Merge k Sorted Lists": {
    pattern:    "Min-Heap k-way Merge — push every list head, on each pop, append to result and push the popped node's next.",
    insight:    "A heap keyed on node values turns the k-way merge into a sequence of log-k extractions across the total node count.",
    complexity: "T: O(N log k) S: O(k)",
    followup:   "Pairwise merge in O(N log k) without a heap?; merge k sorted iterators with bounded memory?; stable merge with tie-break by list index?",
    clarify:    "Can lists be empty or null?; are values comparable across lists?; is k bounded?",
    edges:      "All input lists null (return null); single non-empty list (return as-is); duplicate values across multiple lists"
  },
  "Smallest Range Covering Elements from K Lists": {
    pattern:    "k-Way Merge with Window Min-Range — min-heap over current heads paired with a running max, each pop tightens the window from the left while max anchors the right.",
    insight:    "The minimum-width range that covers all lists always has its left endpoint at some current head, so sweeping heads with the running max enumerates every candidate.",
    complexity: "T: O(N log k) S: O(k)",
    followup:   "Smallest range covering at least p of the k lists?; weighted lists?; arrival-stream version with bounded memory?",
    clarify:    "Are individual lists sorted ascending?; tie-break when two ranges share width (smaller start)?; can a list be empty?",
    edges:      "All lists share a common value (range width 0); one list dominates at the right (max never decreases); k = 1 (range is [head, head])"
  },
  "Implement Trie (Prefix Tree)": {
    pattern:    "Trie Node Map + Terminal Flag — each node carries a children map and an isWord flag, insert/search/startsWith walk one character at a time.",
    insight:    "A separate isWord flag distinguishes a stored word from a mere prefix, which is what makes search and startsWith different.",
    complexity: "T: O(L) S: O(N*L)",
    followup:   "Add delete with reference-count cleanup?; switch children to a fixed-size 26-array for lowercase-only inputs?; persistent trie for versioned dictionaries?",
    clarify:    "Is the alphabet limited to lowercase ASCII?; are duplicate inserts no-ops?; case-sensitive comparison?",
    edges:      "Empty-string insert (root becomes terminal); search before any insert (return false); startsWith on the empty string (return true)"
  },
  "Word Break": {
    pattern:    "DP + Trie Prefix Match — dp[i] holds whether s[0..i] can be segmented, transition checks suffixes via a trie or hash set.",
    insight:    "Treating reachability index by index turns an exponential split search into a single O(n^2) sweep over end positions.",
    complexity: "T: O(n^2) S: O(n + W*L)",
    followup:   "Return all valid sentences (Word Break II)?; minimise number of words used?; very large dictionary with bounded memory?",
    clarify:    "Can words be reused unlimited times?; is comparison case-sensitive?; treat empty input as true?",
    edges:      "Empty string (true); no dictionary word matches any prefix (false); whole string equals a single dictionary word"
  },
  "Design Add and Search Words Data Structure": {
    pattern:    "Trie + DFS for '.' Wildcard — search descends one node per non-wildcard char and branches over every child on '.'.",
    insight:    "A wildcard fans out only at the level it appears, so most queries still cost close to O(L) when wildcards are sparse.",
    complexity: "T: O(26^k * L) S: O(N*L)",
    followup:   "Bound recursion when many dots blow up the branching factor?; support a '*' wildcard matching any number of chars?; multi-pattern bulk search?",
    clarify:    "Is the alphabet lowercase ASCII?; can a query contain leading or trailing dots?; are duplicate adds idempotent?",
    edges:      "All-dot query of length L (matches any stored word of that length); query longer than every stored word (false); empty-string add then empty search (true)"
  },
  "Design In-Memory File System": {
    pattern:    "Trie of Path Components for File System — each node holds a sorted children map and either a directory marker or file content.",
    insight:    "Splitting paths on '/' into components lets one trie support ls, mkdir, addContentToFile, and readContentFromFile uniformly.",
    complexity: "T: O(L + K log K) S: O(P)",
    followup:   "Add rm and mv with reference-count cleanup?; concurrent access with locking?; persist the tree to disk?",
    clarify:    "Are paths always absolute and Unix-style?; is ls on a file expected to return only that file's name?; case-sensitive names?",
    edges:      "ls on the root after no operations (empty list); mkdir on an already-existing path (no-op); addContentToFile to a missing file (creates it)"
  },
  "Permutations": {
    pattern:    "Backtracking — Used Set Permutations — DFS chooses an unused element at each depth and unmarks it on return.",
    insight:    "A boolean used[] array (or in-place swap) builds every permutation with no duplicate work and no extra hashing.",
    complexity: "T: O(n * n!) S: O(n)",
    followup:   "Distinct permutations when the input has duplicates (Permutations II)?; iterative next-permutation enumeration?; lexicographic kth permutation directly?",
    clarify:    "Are inputs distinct?; should output be in lex order?; mutate the input array?",
    edges:      "Empty input (single empty permutation); single element (one permutation); n = 2 (two permutations)"
  },
  "Subsets": {
    pattern:    "Subset Backtracking — Include/Exclude — at each index recurse with and without the current element, record the running prefix at every entry.",
    insight:    "Recording the prefix on entry rather than only at leaves turns the recursion tree into the power set without extra bookkeeping.",
    complexity: "T: O(n * 2^n) S: O(n)",
    followup:   "Unique subsets when duplicates are allowed (Subsets II)?; iterative bitmask enumeration?; subsets of fixed size k (combinations)?",
    clarify:    "Are inputs distinct?; should output include the empty subset?; is order within a subset significant?",
    edges:      "Empty input (one empty subset); single element (two subsets); n large enough that 2^n output size matters"
  },
  "Letter Combinations of a Phone Number": {
    pattern:    "Digit-to-Letter DFS — recurse one digit at a time, appending each mapped letter to the running prefix.",
    insight:    "Because each digit's letter set is independent, a depth-first walk produces every combination without revisits.",
    complexity: "T: O(4^n * n) S: O(n)",
    followup:   "Iterative BFS variant for very deep inputs?; rank a specific combination lexicographically?; dictionary-restricted combinations?",
    clarify:    "Is empty digit string an empty result or a single empty string?; are 7 and 9 the four-letter buttons?; ignore digits 0 and 1?",
    edges:      "Empty input (return empty list); input containing 0 or 1 (skip or empty per spec); single digit (one short list)"
  },
  "Generate Parentheses": {
    pattern:    "Open-Close-Counter Backtracking — extend with '(' while open < n and with ')' while close < open.",
    insight:    "Tracking open and close counts is sufficient to enforce well-formedness without ever validating the string after the fact.",
    complexity: "T: O(C_n * n) S: O(n)",
    followup:   "Count-only via Catalan numbers?; constrained alphabets like {(, ), [, ]}?; generate in lex order without sorting?",
    clarify:    "Is n guaranteed non-negative?; produce a list or yield as a stream?; are duplicates expected (no — by construction unique)?",
    edges:      "n = 0 (single empty string); n = 1 (one pair); large n where output size is the nth Catalan number"
  },
  "Next Permutation": {
    pattern:    "In-Place Next-Permutation Algorithm — find the longest non-increasing suffix, swap pivot with smallest suffix value greater than it, reverse the suffix.",
    insight:    "Reversing the suffix after the swap turns the lexicographically largest tail into the smallest, yielding the immediate next permutation.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Previous permutation by symmetry?; kth next permutation in O(n)?; next permutation that is also a palindrome?",
    clarify:    "Is in-place mutation required?; can the array contain duplicates?; what to do for the largest permutation (rotate to ascending)?",
    edges:      "Strictly descending input (rotate to ascending); single element (no change); duplicates around the pivot (smallest greater wins)"
  },
  "N-Queens": {
    pattern:    "Backtracking on Diagonals + Columns — place row by row, mark column, r+c (anti-diag), and r-c (diag) as occupied to prune in O(1).",
    insight:    "Three set markers per board (col, anti-diag, diag) check attack lines in constant time per placement attempt.",
    complexity: "T: O(n!) S: O(n)",
    followup:   "Count solutions only (N-Queens II)?; bitmask sets for sub-millisecond solves?; symmetry pruning to enumerate canonical boards?",
    clarify:    "Output board layout strings or coordinate lists?; is n guaranteed positive?; first solution only or all of them?",
    edges:      "n = 1 (one solution); n in {2, 3} (no solution); n large enough that pruning quality dominates runtime"
  },
  "Spiral Matrix": {
    pattern:    "Layer-by-Layer Spiral — track top, bottom, left, right boundaries, walk each side and shrink the boundary inward.",
    insight:    "Recomputing the four boundaries after each side avoids special-casing the final row or column on rectangular matrices.",
    complexity: "T: O(m*n) S: O(1)",
    followup:   "Generate (rather than read) a spiral matrix of given n?; rotate the spiral 90 degrees in place?; spiral over an irregular shape?",
    clarify:    "Is the matrix rectangular (not necessarily square)?; can rows or columns be empty?; clockwise from top-left?",
    edges:      "Single row (read left to right only); single column (read top to bottom only); 1x1 matrix (single element)"
  },
  "Valid Sudoku": {
    pattern:    "Per-Cell Validation with Three Hash Sets — for each filled cell check row[r], col[c], and box[(r/3)*3 + c/3] for the digit.",
    insight:    "A single sweep with 27 sets total catches every violation without re-scanning rows, columns, or boxes.",
    complexity: "T: O(1) S: O(1)",
    followup:   "Generalise to a 16x16 board with 4x4 boxes?; validate live as a user types (incremental)?; allow partial completeness checks?",
    clarify:    "Are dots used to mark empty cells?; is the board guaranteed 9x9?; must filled cells be digits 1-9?",
    edges:      "Completely empty board (valid); duplicated digit inside one box only; valid digits in row and column but conflict inside the 3x3 box"
  },
  "Rotate Image": {
    pattern:    "In-Place Transpose + Row Reverse — first swap a[i][j] with a[j][i] across the diagonal, then reverse each row.",
    insight:    "Decomposing the 90-degree rotation into transpose plus reflect avoids an O(n^2) auxiliary buffer.",
    complexity: "T: O(n^2) S: O(1)",
    followup:   "Counter-clockwise rotation (transpose then reverse columns)?; rotate by 180 or 270 degrees?; rectangular matrix rotation requiring reallocation?",
    clarify:    "Is in-place mutation required?; is the matrix guaranteed square?; clockwise unless specified otherwise?",
    edges:      "1x1 matrix (no change); 2x2 matrix (smallest non-trivial rotation); empty matrix (no-op)"
  },
  "Set Matrix Zeroes": {
    pattern:    "First-Row/Column Marker In-Place — use the first row and column as zero-flags, track first-row and first-column zero state in two scalars.",
    insight:    "Reusing the first row and column as O(1) extra storage avoids any O(m+n) marker buffer.",
    complexity: "T: O(m*n) S: O(1)",
    followup:   "Zero out a 3D tensor by analogous markers?; immutable input requirement?; sparse-matrix variant with very few zeros?",
    clarify:    "Is in-place mutation required?; can the matrix be empty?; are m and n guaranteed positive?",
    edges:      "Zero in (0,0) corner (both first row and column flagged); no zeros (no mutation); an entire row already zero (idempotent)"
  },
  "Sudoku Solver": {
    pattern:    "Backtracking with Constraint Propagation — pick the next empty cell, try digits 1-9 unused in row/col/box, recurse.",
    insight:    "Maintaining row/col/box bitmasks lets the legality test run in O(1) per attempted digit, so backtracking stays practical.",
    complexity: "T: O(9^E) S: O(1)",
    followup:   "Choose the most-constrained empty cell first (MRV) for faster solves?; produce all solutions and detect uniqueness?; generalise to 16x16?",
    clarify:    "Is the input guaranteed to have at least one solution?; mutate the input board?; is the board always 9x9?",
    edges:      "Already-solved board (return immediately); board with no empty cells but invalid (input contradiction); puzzle with very few givens (deeper recursion)"
  },
  "Design Hit Counter": {
    pattern:    "Sliding Window Counter via Deque — append a (timestamp, count) bucket per hit, pop from the front while the head is older than 5 minutes.",
    insight:    "Bucketing hits per second keeps the queue length bounded by the window (300 for 5 minutes) regardless of hit volume.",
    complexity: "T: O(1) S: O(W)",
    followup:   "Window other than 300 seconds?; concurrent hits from multiple threads?; subsecond resolution?",
    clarify:    "Is timestamp guaranteed monotonically non-decreasing?; do simultaneous hits coalesce into one bucket?; what units (seconds)?",
    edges:      "getHits before any hit (return 0); hits all in the same second (single bucket); hits exactly 300 seconds apart (oldest evicted)"
  },
  // ───── Dynamic Programming group (task 8.9) ─────
  "Climbing Stairs": {
    pattern:    "1D DP — Fibonacci-Style — ways(n) = ways(n-1) + ways(n-2), roll two scalars instead of an array.",
    insight:    "Each step's count depends only on the previous two, so the recurrence collapses to O(1) memory.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Variable step set {1,2,3} or arbitrary k?; count distinct paths modulo a large prime?; matrix exponentiation for very large n?",
    clarify:    "Is n guaranteed non-negative?; treat n=0 as one empty path?; integer overflow risk on 32-bit count?",
    edges:      "n = 0 (one empty path); n = 1 (single way); n large enough that 32-bit count overflows"
  },
  "House Robber": {
    pattern:    "1D DP — Pick or Skip — dp[i] = max(dp[i-1], dp[i-2] + nums[i]), roll two scalars.",
    insight:    "Adjacent picks are forbidden, so the choice at each index is binary and depends only on the last two answers.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Houses on a circle (House Robber II)?; binary tree of houses (House Robber III)?; reconstruct which houses were robbed?",
    clarify:    "Are values guaranteed non-negative?; can the array be empty?; does robbing zero houses count as a valid plan (return 0)?",
    edges:      "Empty array (return 0); single house (return its value); two houses (return max of the two)"
  },
  "Coin Change": {
    pattern:    "Unbounded Knapsack — Coin Min-Count — dp[a] = 1 + min over coin c of dp[a-c], iterate amounts outer, coins inner.",
    insight:    "Order does not matter, so the per-amount minimum over each coin gives the optimum without enumerating combinations.",
    complexity: "T: O(n*amount) S: O(amount)",
    followup:   "Count number of ways instead of min coins (Coin Change II)?; reconstruct the actual coin multiset used?; BFS on residues when amount is huge but coin count is tiny?",
    clarify:    "Are coins distinct positive integers?; can amount be 0?; return -1 when amount is unreachable?",
    edges:      "amount = 0 (return 0); no subset of coins sums to amount (return -1); single coin equal to amount (return 1)"
  },
  "Partition Equal Subset Sum": {
    pattern:    "0/1 Knapsack — Subset Sum Boolean — reachable[s] true iff some subset sums to s, iterate items outer, sums descending inner.",
    insight:    "Equal partition exists iff some subset sums to total/2, which reduces the problem to a single boolean knapsack.",
    complexity: "T: O(n*S) S: O(S)",
    followup:   "k-way equal partition?; minimum subset-sum difference?; weighted partition with item costs and budgets?",
    clarify:    "Are values non-negative integers?; should an odd total return false immediately?; can the array be empty?",
    edges:      "Odd total (immediate false); single element (false unless 0); array of two equal elements (true)"
  },
  "Unique Paths": {
    pattern:    "2D Grid Path Count DP — dp[r][c] = dp[r-1][c] + dp[r][c-1], collapse to one row when iterating top-down.",
    insight:    "Only right and down moves are allowed, so each cell's count depends only on its top and left neighbours.",
    complexity: "T: O(m*n) S: O(n)",
    followup:   "Closed-form via the binomial coefficient C(m+n-2, m-1)?; obstacles on the grid (Unique Paths II)?; diagonal moves or arbitrary move set?",
    clarify:    "Are m and n guaranteed positive?; are moves strictly right and down?; integer overflow on large grids?",
    edges:      "1xN or Mx1 grid (single path); m = n = 1 (one trivial path); large grid where the binomial coefficient overflows 32-bit"
  },
  "Maximum Product Subarray": {
    pattern:    "Track Running Min and Max for Sign Flips — at each index update (min, max) using x, x*prev_min, x*prev_max.",
    insight:    "A negative value swaps the roles of running min and max, so both must be carried to handle sign flips correctly.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Return the actual subarray indices, not only the product?; allow at most one zero inside the subarray?; product taken modulo a prime?",
    clarify:    "Allow empty subarray?; can values be zero or negative?; integer or floating-point inputs?",
    edges:      "Single negative element (answer is that element); array containing zero (resets running product); all negatives with even count (whole array's product wins)"
  },
  "Longest Increasing Subsequence": {
    pattern:    "Patience Sort / Binary Search DP for LIS — maintain tails[], for each x replace the first tail ≥ x via lower_bound.",
    insight:    "tails[] is not the LIS itself, but its length matches the LIS because each replacement keeps every prefix length achievable.",
    complexity: "T: O(n log n) S: O(n)",
    followup:   "Reconstruct the actual subsequence with parent pointers?; longest non-decreasing variant via upper_bound?; longest common subsequence between two arrays?",
    clarify:    "Is strict increase required?; are duplicates allowed in the input?; return length or the subsequence itself?",
    edges:      "Empty array (length 0); strictly decreasing input (length 1); all equal values under strict-increase (length 1)"
  },
  "Jump Game": {
    pattern:    "Greedy Reachability — Furthest Index — track the maximum index reachable so far, fail if i ever exceeds it.",
    insight:    "Reaching the end depends only on the running max-reach, so per-index DP collapses to a single scalar.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Minimum jumps to reach the end (Jump Game II)?; report which indices are unreachable?; weighted jump costs?",
    clarify:    "Are jump values non-negative integers?; can the array be empty?; must the final index be reached exactly or surpassed?",
    edges:      "Single element (already at end); first element 0 with n > 1 (unreachable); large value at index 0 that covers the entire array"
  },
  "Maximal Square": {
    pattern:    "Square-Side DP via Min Neighbor — dp[r][c] = 1 + min(dp[r-1][c], dp[r][c-1], dp[r-1][c-1]) when grid[r][c] is '1'.",
    insight:    "A k-by-k square at (r,c) requires three (k-1)-squares meeting at the top-left, so the min of three neighbours bounds the side.",
    complexity: "T: O(m*n) S: O(n)",
    followup:   "Maximal rectangle via per-row histogram and largest-rectangle-in-histogram?; maximal cube in a 3D voxel grid?; report the square's coordinates?",
    clarify:    "Are cells the characters '0'/'1' or integers 0/1?; can the grid be empty?; return area or side length?",
    edges:      "Grid of all '0' (area 0); grid of all '1' (whole min(m,n) square); single row or column (max side 1)"
  },
  "Decode Ways": {
    pattern:    "Decode-String DP with One/Two-Char Branches — dp[i] sums dp[i-1] when s[i-1] is 1-9 and dp[i-2] when s[i-2..i-1] is 10-26.",
    insight:    "A leading '0' kills the one-char branch, so each position's count is a conditional sum of its two predecessors.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Decode Ways II with '*' wildcard digits?; reconstruct one valid decoding?; alphabet beyond 26 letters?",
    clarify:    "Is the input guaranteed digits only?; is the empty string one decoding or zero?; how is a leading '0' handled (return 0)?",
    edges:      "Leading '0' (return 0); '10' or '20' (one decoding only); two-digit prefix above 26 (one-char branch only)"
  },
  "Combination Sum IV": {
    pattern:    "Permutation Count DP (Order Matters) — dp[t] = sum over num n of dp[t-n], iterate target outer, nums inner.",
    insight:    "Different orderings count as distinct, so the target loop is outer to admit every prefix once per permutation.",
    complexity: "T: O(n*target) S: O(target)",
    followup:   "Combination Sum where order does not matter (swap loop order)?; bound the sequence length to k?; handle negative numbers where cycles become possible?",
    clarify:    "Are nums positive distinct integers?; can target be 0 (return 1 for the empty sequence)?; integer overflow risk on 32-bit count?",
    edges:      "target = 0 (return 1); no num divides into target (return 0); chains where intermediate counts overflow 32-bit"
  },
  // ───── Strivers SDE Sheet additions (placeholder prep, refine over time) ─────
  // These cover problems imported from tracker/SDEStriversSheet.txt. Each entry
  // satisfies the six-field schema so __listMissingPrep() returns []. Refine
  // the algorithmic-pattern fields in subsequent passes; the placeholders are
  // a minimum viable prep card, not the final word.
  "Pascal's Triangle I": {
    pattern:    "Row-by-Row Build — each value is sum of two values directly above; iterate level by level.",
    insight:    "Each row depends only on the previous row, so O(n) auxiliary space suffices for the whole triangle build.",
    complexity: "T: O(n^2) S: O(n^2) for output",
    followup:   "Return only the kth row in O(k) space?; return one specific entry C(n,k)?",
    clarify:    "1-indexed or 0-indexed numRows?; nested list or flat list?",
    edges:      "numRows = 0; numRows = 1; very large numRows (overflow)"
  },
  "Rotate matrix by 90 degrees": {
    pattern:    "Transpose-then-Reverse — transpose in place, then reverse each row.",
    insight:    "Two simple O(n^2) passes compose into a 90-degree rotation without scratch space.",
    complexity: "T: O(n^2) S: O(1)",
    followup:   "Anticlockwise (transpose then reverse columns)?; non-square matrices?",
    clarify:    "In-place mandatory?; integer or generic element type?",
    edges:      "1x1; 2x2; very large matrices"
  },
  "Merge two sorted arrays without extra space": {
    pattern:    "Gap-Method (Shell-style) — iterate decreasing gaps, swap pairs across the join.",
    insight:    "Treating the two arrays as one logical array of length m+n and shrinking gap by half emulates Shell sort in O((m+n) log(m+n)).",
    complexity: "T: O((m+n) log(m+n)) S: O(1)",
    followup:   "Allow O(1) extra space with stable order?; merge k arrays?",
    clarify:    "Both sorted ascending?; allowed to mutate either?; preserve duplicates?",
    edges:      "One array empty; equal sizes; all elements of A < B"
  },
  "Find the repeating and missing number": {
    pattern:    "XOR or Math Identities — sum/sumSq differences (or XOR pair partition) yields both unknowns.",
    insight:    "Two equations (sum and sum of squares) on two unknowns let you isolate the duplicate and the missing in O(n) and O(1) space.",
    complexity: "T: O(n) S: O(1)",
    followup:   "k missing and k duplicates?; floats / non-integer ranges?",
    clarify:    "Range fixed [1..n]?; both anomalies guaranteed?",
    edges:      "Single-element n=1; missing at boundary; very large n risking overflow"
  },
  "Inversion of Array (Pre-req: Merge Sort)": {
    pattern:    "Modified Merge Sort — count cross-pair inversions during the merge step.",
    insight:    "When the merge sees a left[i] > right[j], all remaining left elements form inversions with right[j], so cross-counting is O(n) per merge level.",
    complexity: "T: O(n log n) S: O(n)",
    followup:   "Persistent BIT / segment-tree variant?; reverse pairs (>2*right)?",
    clarify:    "Allow modifying input?; integer overflow on count?",
    edges:      "Sorted ascending (zero); sorted descending (max); duplicates"
  },
  "Majority Element-II": {
    pattern:    "Boyer-Moore Generalized — track up to two candidates with counts; verify in second pass.",
    insight:    "There can be at most two elements appearing more than n/3 times; the voting structure scales to k-1 candidates for an n/k threshold.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Generalize to elements appearing more than n/k times?; streaming variant?",
    clarify:    "Empty input allowed?; output order matters?; majority not guaranteed?",
    edges:      "Empty array; single element; all equal; exactly two candidates"
  },
  "Grid unique paths": {
    pattern:    "Combinatorics or 2D DP — answer is C(m+n-2, m-1); DP fills dp[i][j] = dp[i-1][j] + dp[i][j-1].",
    insight:    "On a grid with only down/right moves, every path uses exactly (m-1)+(n-1) moves with a fixed split, so the count is a single binomial.",
    complexity: "T: O(m*n) S: O(min(m,n))",
    followup:   "With obstacles?; 3D grid?; minimum-cost path instead?",
    clarify:    "1-indexed or 0-indexed dims?; m or n can be 0?; integer overflow?",
    edges:      "1xN or Mx1 grid; obstacles at start/end; large dims"
  },
  "Reverse Pairs": {
    pattern:    "Modified Merge Sort — count cross-pairs (i<j, nums[i] > 2*nums[j]) during merge.",
    insight:    "The merge step sees both halves sorted, so a two-pointer sweep counts cross-pairs in O(n) per level.",
    complexity: "T: O(n log n) S: O(n)",
    followup:   "Different inequality (>k*right)?; persistent BIT/segment tree?",
    clarify:    "Overflow on 2*nums[j]?; allow modifying input?",
    edges:      "Sorted ascending (zero); sorted descending (worst case); large negatives mixed with positives"
  },
  "Distinct Numbers in Each Subarray": {
    pattern:    "Sliding Window + HashMap — increment on add, decrement on remove, count nonzero entries.",
    insight:    "Maintaining a count map under window slide gives the distinct-count answer per window in O(n) total.",
    complexity: "T: O(n) S: O(k)",
    followup:   "Top-k frequent in window?; window of variable size?",
    clarify:    "Window size k fixed?; values bounded?",
    edges:      "k = 1; all distinct; all duplicates; k = n"
  },
  "4 Sum": {
    pattern:    "Sort then Two-Pointer Nested — fix two indices, two-pointer the remaining pair toward residual target.",
    insight:    "Sorting plus a tightening two-pointer collapses an O(n^4) brute force to O(n^3) without extra space.",
    complexity: "T: O(n^3) S: O(1) extra",
    followup:   "k-Sum generalization?; allow duplicates in output?; positive-only restriction?",
    clarify:    "Output unique quadruplets only?; integer overflow on sum?; signed values?",
    edges:      "All zeros; many duplicates; small array (n<4); target unreachable"
  },
  "Largest Subarray with K sum": {
    pattern:    "Prefix Sum + HashMap — first-seen index of each running sum; longest = i - firstSeen[runningSum - k].",
    insight:    "If the same prefix sum repeats and (sum - k) was seen earlier, the slice between them sums to k.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Count instead of length?; non-negative-only variant in O(1) space?",
    clarify:    "Empty subarray allowed?; values can be negative?",
    edges:      "All zeros with k=0; entirely negative; k unreachable"
  },
  "Count subarrays with given xor K": {
    pattern:    "Prefix XOR + HashMap — frequency of (prefix ^ k) tells you how many subarrays end here with xor = k.",
    insight:    "XOR is its own inverse, so prefix-XOR equality ↔ subarray XOR = 0; hashmap turns it linear.",
    complexity: "T: O(n) S: O(n)",
    followup:   "Range XOR queries?; persistent variant?",
    clarify:    "Values bounded?; empty subarray counts?",
    edges:      "k = 0 (count zero-XOR subarrays); all values equal k; n = 1"
  },
  "Reverse every word in a string": {
    pattern:    "Split-Reverse-Join — split on whitespace, reverse, join with single space.",
    insight:    "Treating words as atomic tokens reduces to list reversal with whitespace normalization.",
    complexity: "T: O(n) S: O(n)",
    followup:   "In-place O(1) extra?; reverse characters within each word too?",
    clarify:    "Multiple spaces between words?; preserve original separators?",
    edges:      "Empty string; all whitespace; single word; trailing/leading spaces"
  },
  "Implement ATOI/STRSTR": {
    pattern:    "State-Machine Parser — skip whitespace, read sign, accumulate digits with overflow guard.",
    insight:    "Each character class is a state transition; overflow check is localized to the digit branch.",
    complexity: "T: O(n) S: O(1)",
    followup:   "Unicode digit handling?; signed-magnitude vs two's complement clamping?",
    clarify:    "Whitespace forms?; overflow saturates or throws?",
    edges:      "Pure whitespace; sign with no digits; INT_MAX boundary"
  },
  "Rabin Karp Algorithm": {
    pattern:    "Rolling Hash — hash a window, slide and compare; verify on hash hit.",
    insight:    "A multiplicative rolling hash adds one char in O(1), so substring-search is amortized O(n+m).",
    complexity: "T: O(n+m) avg, O(n*m) worst S: O(1)",
    followup:   "Double hashing to defeat collisions?; multi-pattern (Aho-Corasick)?",
    clarify:    "Ascii or unicode?; case sensitive?",
    edges:      "Pattern longer than text; pattern empty; many hash collisions"
  },
  "Z function": {
    pattern:    "Z-Array — for each i, longest prefix matching s starting at i.",
    insight:    "Z[i] computation reuses prior matches via the [l..r] window so total work is O(n).",
    complexity: "T: O(n) S: O(n)",
    followup:   "Pattern matching in O(n+m)?; longest palindrome via Z?",
    clarify:    "Alphabet bounded?; ASCII?",
    edges:      "All same character; empty string; single char"
  },
  "KMP Algorithm or LPS array": {
    pattern:    "Failure Function — LPS[i] is the longest proper prefix-suffix; reuse on mismatch.",
    insight:    "Precomputed LPS lets the matcher avoid backtracking the text pointer, giving O(n+m).",
    complexity: "T: O(n+m) S: O(m)",
    followup:   "Multi-pattern matching?; KMP for streaming text?",
    clarify:    "Pattern smaller than text?; ASCII or unicode?",
    edges:      "Pattern == text; pattern length 1; many partial matches"
  },
  "Minimum insertions to make string palindrome": {
    pattern:    "Longest Palindromic Subsequence DP — answer = n - LPS(s).",
    insight:    "Inserting characters can pair up everything that isn't already in the longest palindromic subsequence.",
    complexity: "T: O(n^2) S: O(n^2)",
    followup:   "Track which characters to insert?; minimum insertions on a window?",
    clarify:    "Case-sensitive?; allow non-ASCII?",
    edges:      "Empty; single char; already palindrome; all same char"
  },
  "Count and say": {
    pattern:    "Sequential Run-Length Generation — generate term k from term k-1 by reading runs.",
    insight:    "Each term is the run-length encoding of the previous term; no closed form.",
    complexity: "T: O(2^n) S: O(2^n)",
    followup:   "kth term in compressed form?; growth bounds?",
    clarify:    "1-indexed n?; output as string or array?",
    edges:      "n=1 base case; large n where output is huge"
  },
  "Compare version numbers": {
    pattern:    "Two-Pointer Numeric Tokenization — split on '.', compare as integers, treat missing as zero.",
    insight:    "Lexicographic compare fails on '1.10' vs '1.2'; numeric compare per token plus zero-padding handles all shapes.",
    complexity: "T: O(n+m) S: O(1)",
    followup:   "Pre-release suffixes (1.0-rc1)?; semver?",
    clarify:    "Leading zeros equal?; trailing .0 equal?",
    edges:      "Different lengths; leading zeros; non-numeric tokens"
  },
  // Stack & Queue · Strivers
  "Implement Stack using Arrays":   { pattern:"Dynamic Array Backing — push appends, pop drops the tail.", insight:"Array gives O(1) amortized push/pop because growth doubles capacity.", complexity:"T: O(1) amortized  S: O(n)", followup:"Fixed-size with overflow handling?; ring buffer?", clarify:"Capacity bounded?; thread-safe?", edges:"Pop on empty; push past capacity; single element" },
  "Implement Queue using Arrays":   { pattern:"Circular Buffer Indices — head/tail with modulo wrap; resize on full.", insight:"Linear-array dequeue is O(n); circular indices restore O(1).", complexity:"T: O(1) amortized  S: O(n)", followup:"Linked list backing?; bounded vs unbounded?", clarify:"Capacity bounded?; head/tail full-vs-empty disambiguation?", edges:"Empty dequeue; full enqueue; head == tail" },
  "Implement Stack using Queue (using single queue)": { pattern:"Rotate-On-Push — after enqueueing x, rotate (n-1) times so x is front.", insight:"O(n) push and O(1) pop satisfy LIFO with one underlying FIFO.", complexity:"T: O(n) push, O(1) pop  S: O(n)", followup:"Push-O(1) pop-O(n) variant?; two-queue variant?", clarify:"Queue interface limited to enqueue/dequeue?", edges:"Push on empty; pop on empty; single element" },
  "Next Greater Element":           { pattern:"Monotonic Stack Right-to-Left — pop <=, top is next greater.", insight:"Each index enters/leaves the stack at most once → linear total work.", complexity:"T: O(n)  S: O(n)", followup:"Circular array variant?; in stream?", clarify:"Strictly greater or >=?; output for missing?", edges:"Strictly increasing; strictly decreasing; all equal; single element" },
  "Sort a Stack":                   { pattern:"Recursion + Insertion — pop all, sort recursively, insert in order.", insight:"Without auxiliary structures you can sort by recursive insertion using only stack semantics.", complexity:"T: O(n^2)  S: O(n) call stack", followup:"With auxiliary stack in O(n^2)?; constant space (impossible)?", clarify:"Mutate input?; stable order?", edges:"Empty stack; already sorted; all duplicates" },
  "Next Smaller Element":           { pattern:"Monotonic Stack Right-to-Left — symmetric to NGE for smaller.", insight:"Same per-index entry/exit accounting gives linear total work.", complexity:"T: O(n)  S: O(n)", followup:"Circular variant?; both prev and next smaller?", clarify:"Strict or <=?; missing default?", edges:"All same value; strictly increasing; strictly decreasing" },
  "LFU Cache":                      { pattern:"HashMap of Doubly-Linked-List Buckets — buckets keyed by frequency, LRU within each.", insight:"Tracking minimum frequency lets eviction find the right bucket in O(1); LRU end is the eviction target.", complexity:"T: O(1) get/put  S: O(capacity)", followup:"Expiring keys?; concurrent variant?; hybrid LFU+LRU?", clarify:"Tie-break (LFU first, then LRU)?; capacity zero?", edges:"Capacity 0; repeated put on same key; ties between buckets" },
  "Stock span problem":             { pattern:"Monotonic Decreasing Stack — pop while top price <= current; span = idx - lastTopIdx.", insight:"Span counts the run of consecutive prior days <= today's price, exactly what a monotonic stack tracks.", complexity:"T: O(n) amortized  S: O(n)", followup:"Streaming variant?; longest run of strictly increasing days?", clarify:"Strict comparison or <=?; ties count?", edges:"All increasing prices; all decreasing; all equal; single day" },
  "Maximum of Minimums for Every Window Size": { pattern:"Stack of Spans — find for each element the largest window where it's min, then aggregate.", insight:"Per-element span lengths from previous and next smaller elements roll up the answer in O(n).", complexity:"T: O(n)  S: O(n)", followup:"Maximum of maximums?; weighted variant?", clarify:"Strict or <=?; ties broken how?", edges:"All same; strictly increasing; strictly decreasing" },
  "Celebrity Problem":              { pattern:"Stack Elimination — pair-and-eliminate; verify final candidate.", insight:"Each `knows(a,b)` query eliminates one candidate; n-1 queries plus 2(n-1) verification suffice.", complexity:"T: O(n)  S: O(1)", followup:"Stream of arrivals?; multiple celebrities?", clarify:"0-indexed?; reflexive knows?; party may have no celebrity?", edges:"Single person; everyone knows everyone; nobody knows anyone" },
  // Linked List · Strivers
  "Delete Node in a Linked List O(1)": { pattern:"Copy-Next-Then-Skip — overwrite current value with next value, then bypass next.", insight:"Without head access, simulate deletion by mutating the current node into a clone of its successor.", complexity:"T: O(1)  S: O(1)", followup:"Tail node case?; doubly linked variant?", clarify:"Node guaranteed not tail?; mutate values or pointers?", edges:"Single successor; values may equal target; concurrent traversal" },
  "Find the intersection point of Y LL": { pattern:"Two-Pointer Length Equalization — switch heads at end so both pointers traverse |A|+|B| total.", insight:"Switching heads gives both pointers the same total path, so they meet at the intersection node.", complexity:"T: O(m+n)  S: O(1)", followup:"Detect no intersection?; lists with cycles?", clarify:"Intersection by reference or value?; one list empty?", edges:"No intersection; fully overlapping lists; one list empty" },
  "Find the starting point in LL":  { pattern:"Floyd's Cycle — fast/slow meet inside cycle, then advance from head until they meet at entry.", insight:"Distance from head to entry equals distance from meeting point to entry along the cycle.", complexity:"T: O(n)  S: O(1)", followup:"Cycle length?; remove cycle?", clarify:"Empty list?; self-loop?", edges:"No cycle; cycle starts at head; cycle length 1; single-node self-loop" },
  "Flattening of LL":               { pattern:"Recursive Merge — merge from right to left using bottom pointer.", insight:"Each pairwise merge of sorted vertical lists is the standard sorted-merge primitive.", complexity:"T: O(N) with N = total nodes  S: O(1) iterative / O(d) recursion", followup:"Multi-level (next of next-of-next) variant?; flatten in-place?", clarify:"Bottom pointer always sorted ascending?; preserve next pointer or null it out?", edges:"Single vertical list; empty bottom chains; very tall single column" },
  "Rotate a LL":                    { pattern:"Length-Then-Pivot — find length L, k %= L, walk to (L-k-1)th node, rewire.", insight:"Rotation by k splits the list at L-k and swaps the two halves.", complexity:"T: O(n)  S: O(1)", followup:"Negative k?; circular list?", clarify:"k > L?; head null?; mutate?", edges:"k = 0; k = L; k > L; single-node" },
  "Clone a LL with random and next pointer": { pattern:"Interleave-Clone-Split — weave clones, set random via original.random.next, then unweave.", insight:"Interleaving lets each clone read its random target by following one hop, removing the hash map.", complexity:"T: O(n)  S: O(1) extra", followup:"Hash-map variant for clarity?; deep clone of arbitrary graph?", clarify:"Random may be null?; cycles via random?", edges:"All randoms point to head; no random pointers; single-node" },
  "Remove duplicates from sorted array": { pattern:"Two-Pointer In-Place — write index advances only on a new value.", insight:"Sorted input puts every duplicate adjacent, so a single linear sweep suffices.", complexity:"T: O(n)  S: O(1)", followup:"Allow at most k duplicates?; unsorted variant?", clarify:"Mutate in place?; preserve relative order?", edges:"All duplicates; no duplicates; single element" },
  "Maximum Consecutive Ones":       { pattern:"Single-Pass Run Counter — track current run length, update max on reset.", insight:"Run-length problems on binary streams collapse to one accumulator and one global max.", complexity:"T: O(n)  S: O(1)", followup:"Allow flipping at most k zeros?; circular variant?", clarify:"Empty allowed?; only 0/1 values?", edges:"All ones; all zeros; alternating; single element" },
  // Binary Search · Strivers
  "The N-th root of an integer":    { pattern:"Binary Search on Answer — search r in [0, n] such that r^k == n (or precision band).", insight:"Monotonicity of r^k in r gives O(log n) search even without closed form.", complexity:"T: O(log n * cost(pow))  S: O(1)", followup:"Floating precision?; integer-only floor?", clarify:"k bounded?; n positive?; precision tolerance?", edges:"n = 0 or 1; very large n; k = 1 (identity)" },
  "Matrix Median":                  { pattern:"Binary Search on Value + Row-wise Count ≤ x.", insight:"For sorted-rows matrix, count of values ≤ x can be computed row-by-row in O(m log n); search the value space.", complexity:"T: O(32 * m * log n)  S: O(1)", followup:"Unsorted rows?; column-sorted variant?", clarify:"Rows sorted ascending?; total count odd?", edges:"Single row; single column; all same value" },
  "Single element in sorted array": { pattern:"Binary Search on Pair Parity — at even index, mate is at index+1; mismatch means single is left.", insight:"Pairs occupy even-odd index pairs; the lone element breaks parity and binary search locates the break in O(log n).", complexity:"T: O(log n)  S: O(1)", followup:"Two singles?; XOR-based O(n) for unsorted?", clarify:"Length always odd?; values may repeat more than twice?", edges:"Single element only; lone at start; lone at end" },
  "Median of 2 sorted arrays":      { pattern:"Binary Search on Partition — partition smaller array so left/right halves balance across both.", insight:"Median is fully determined by boundary elements of the two partitions, found in O(log min(m,n)).", complexity:"T: O(log min(m,n))  S: O(1)", followup:"kth element of two sorted arrays?; streaming median?", clarify:"Both ascending?; overflow on midpoint?", edges:"One empty; equal sizes vs very different; all equal" },
  "Kth element of 2 sorted arrays": { pattern:"Binary Search Discard — discard k/2 elements from one array's prefix at each step.", insight:"Two-array kth-smallest collapses to discarding chunks until k=1; O(log k).", complexity:"T: O(log(min(m,n)))  S: O(1)", followup:"Median (k = (m+n)/2)?; streaming variant?", clarify:"k 1-indexed?; both ascending?", edges:"k = 1; k = m+n; one array empty" },
  "Allocate Minimum Number of Pages": { pattern:"Binary Search on Answer — feasibility check counts students given page-cap.", insight:"The set of feasible page-caps is monotone; binary-search the smallest feasible cap.", complexity:"T: O(n log(sum))  S: O(1)", followup:"Painter's partition variant?; minimize max?", clarify:"Each book to one student?; contiguous allocation?", edges:"Students > books; single book; all equal book sizes" },
  "Aggressive Cows":                { pattern:"Binary Search on Distance — feasibility: can we place k cows with min spacing d?", insight:"Sort positions, binary-search the largest d such that greedy placement fits k cows.", complexity:"T: O(n log(maxD))  S: O(1)", followup:"Variable cow weights?; circular farm?", clarify:"k <= n always?; sorted input?", edges:"k = 2 (just max - min); k = n (smallest gap); duplicates" },
  // Binary Tree · Strivers
  "Inorder Traversal":              { pattern:"Iterative Stack — push left chain, pop and visit, descend right.", insight:"Explicit stack mirrors recursion and gives O(h) auxiliary space.", complexity:"T: O(n)  S: O(h)", followup:"Morris O(1) space?; recursive?", clarify:"Order is L-Root-R; values or nodes?", edges:"Empty; left/right-skewed; single node" },
  "Preorder Traversal":             { pattern:"Iterative Stack — visit root, push right then left.", insight:"Pushing right before left preserves Root-L-R on a LIFO stack.", complexity:"T: O(n)  S: O(h)", followup:"Morris-style preorder?; iterative postorder via two stacks?", clarify:"Order is Root-L-R; values or nodes?", edges:"Empty; skewed; single node" },
  "Postorder Traversal":            { pattern:"Two-Stack or Reversed Preorder — Root-R-L then reverse.", insight:"Postorder is preorder with children swapped, then reversed; O(n).", complexity:"T: O(n)  S: O(h)", followup:"Single-stack iterative postorder?; Morris postorder?", clarify:"Order is L-R-Root; values or nodes?", edges:"Empty; skewed; single node" },
  "Morris Inorder Traversal":       { pattern:"Threaded Tree — temporarily link predecessor.right to current.", insight:"Re-using right pointers as threads gives O(1) auxiliary space.", complexity:"T: O(n)  S: O(1)", followup:"Morris preorder?; postorder Morris?", clarify:"May we mutate temporarily?; restore pointers fully?", edges:"Empty; single node; right-skewed (no threading)" },
  "Morris Preorder Traversal":      { pattern:"Threaded Tree (Preorder) — emit at thread-creation moment.", insight:"Same threading mechanism as Morris inorder; emission timing changes.", complexity:"T: O(n)  S: O(1)", followup:"Morris postorder?; reverse postorder?", clarify:"Mutate temporarily?; restore?", edges:"Empty; single node; right-skewed" },
  "Bottom view of BT":              { pattern:"BFS with Column Index — last node per column wins.", insight:"BFS order means later assignments overwrite earlier ones, naturally yielding bottom view.", complexity:"T: O(n log n)  S: O(n)", followup:"Top view (first wins)?; with negative columns?", clarify:"Tie-break order?; column 0-based?", edges:"Single node; left-only; right-only" },
  "Top View of BT":                 { pattern:"BFS with Column Index — first node per column wins.", insight:"BFS order ensures the first node seen at each column is at the topmost level.", complexity:"T: O(n log n)  S: O(n)", followup:"Bottom view?; vertical traversal?", clarify:"Tie-break left-most?; column 0-based?", edges:"Single node; left-only; right-only" },
  "Pre, Post, Inorder in one traversal": { pattern:"Single Stack with State Counter — increment per visit; emit on each state.", insight:"Three traversals share the same stack frame; state counter routes the emission.", complexity:"T: O(n)  S: O(h)", followup:"Iterative postorder via single stack?", clarify:"Order of three lists?", edges:"Empty; skewed; single node" },
  "Vertical Order Traversal":       { pattern:"BFS with (col, row) — group by column; sort within column by row then value.", insight:"Tracking column offsets during BFS yields stable horizontal grouping.", complexity:"T: O(n log n)  S: O(n)", followup:"Streaming output?; weighted columns?", clarify:"Tie-break (row then value)?; column relative to root?", edges:"Single node; identical (col,row,value) entries" },
  "Print root to leaf path in BT":  { pattern:"DFS with Path Stack — push on entry, pop on exit, emit at leaf.", insight:"Stack mirrors current root-to-node path; mutation on entry/exit avoids prefix recomputation.", complexity:"T: O(n*h) output  S: O(h) recursion", followup:"Paths summing to k?; longest path?", clarify:"List of strings or nested lists?", edges:"Empty; single node; left-skewed" },
  "Check if two trees are identical or not": { pattern:"Synchronous DFS — recurse left/right pairs, return false on first mismatch.", insight:"Structural equality compares roots and recursively their children.", complexity:"T: O(min(n,m))  S: O(min(h1,h2))", followup:"Subtree-of-other?; mirror equality?", clarify:"Compare values strictly?; null trees equal?", edges:"Both empty; one empty; mirrored shapes" },
  "Boundary Traversal":             { pattern:"Three-Phase — left boundary top-down + leaves L→R + right boundary bottom-up.", insight:"Splitting boundary into three disjoint phases avoids double-counting at corners.", complexity:"T: O(n)  S: O(h)", followup:"Generic tree?; clockwise vs counter-clockwise?", clarify:"Include root once?; leaf of single-node tree?", edges:"Single node (root is a leaf); left-only; right-only" },
  "Construct a BT from Postorder and Inorder": { pattern:"Recursive Split — postorder.last is root, inorder split gives left/right sizes.", insight:"With an inorder index map, each recursion is O(1).", complexity:"T: O(n)  S: O(n)", followup:"Construct from preorder + postorder (ambiguous)?; verify validity?", clarify:"Values unique?; arrays same length?", edges:"Empty input; single node; skewed" },
  "Flatten Binary Tree to Linked List": { pattern:"Reverse-Postorder Pointer Rewiring — walk R-L-Root, rewire current.right to last visited.", insight:"Treating it as preorder reverse lets you rewire in O(1) extra space.", complexity:"T: O(n)  S: O(1) iterative / O(h) recursive", followup:"Flatten to circular DLL?; BST to inorder DLL?", clarify:"Mutate in place?; left pointers null?", edges:"Empty; single node; left/right-only chain" },
  "Children Sum Property in Binary Tree": { pattern:"Bottom-Up Adjustment — propagate parent value down or fix children up.", insight:"DFS post-order can re-establish the children-sum invariant by additive updates.", complexity:"T: O(n)  S: O(h)", followup:"Verify only (no mutation)?; weighted nodes?", clarify:"Allowed to increase node values only?; integer overflow?", edges:"Leaf nodes; single node; tree already satisfies property" },
  "Binary Tree to Doubly Linked List": { pattern:"Inorder DFS with Pointer Stitching — keep prev pointer; set prev.right = curr, curr.left = prev.", insight:"Inorder traversal yields BST keys in sorted order; stitching during the walk produces the DLL in O(n).", complexity:"T: O(n)  S: O(h)", followup:"Circular DLL variant?; reverse inorder for descending?", clarify:"In-place mutation of tree pointers?; head of DLL needed?", edges:"Empty; single node; left-skewed (degenerate)" },
  "Kth largest element in a stream of running integers": { pattern:"Min-Heap of Size K — push each new value, pop if size > k; root is kth largest.", insight:"Maintaining only k elements gives O(log k) per add and O(1) for kth largest.", complexity:"T: O(log k) per add  S: O(k)", followup:"Kth largest in fixed window?; with deletions?", clarify:"k 1-indexed?; k may exceed stream length?", edges:"Stream shorter than k initially; ties; k = 1" },
  // BST · Strivers
  "Populating Next Right Pointers in Each Node": { pattern:"Level-by-Level Linking — use previous level's `next` chain to traverse and link the current.", insight:"After level k is linked, traversing it via `next` and setting children's `next` produces level k+1's chain in O(1) extra space.", complexity:"T: O(n)  S: O(1)", followup:"Generic (non-perfect) tree?; recursive solution?", clarify:"Perfect tree guaranteed?; root next is null?", edges:"Single node; height 1; incomplete tree" },
  "Search in BST":                  { pattern:"Iterative BST Descent — left if target < val, right otherwise.", insight:"BST property reduces search to a single root-to-leaf walk.", complexity:"T: O(h)  S: O(1)", followup:"Insert/delete?; balance?", clarify:"Target may be absent?; values unique?", edges:"Empty; target at root; skewed BST" },
  "Construct BST from given keys":  { pattern:"Sequential Insert — insert each key at its BST position.", insight:"Order of insertion determines tree shape; balanced input keeps height log.", complexity:"T: O(n*h)  S: O(h)", followup:"Construct from sorted input in O(n) (use middle as root recursively)?", clarify:"Allow duplicates?; preserve insertion order?", edges:"Sorted input (degenerate tree); empty input; single key" },
  "Construct a BST from a preorder traversal": { pattern:"Bounded Recursion — assign current value if it fits in (lo, hi), recurse with tightened bounds.", insight:"Preorder visits root before subtrees, so bounds determine which subtree the next value belongs to.", complexity:"T: O(n)  S: O(h)", followup:"Construct from inorder + preorder?; verify preorder valid?", clarify:"Values unique?; allow duplicates?", edges:"Empty input; single value; strictly increasing" },
  "Floor in a BST":                 { pattern:"Iterative Descent — track the largest value ≤ target seen so far.", insight:"BST ordering localizes the floor to the path taken when going right.", complexity:"T: O(h)  S: O(1)", followup:"Ceiling?; both at once?", clarify:"Target may be absent?; integer overflow?", edges:"Target smaller than min (no floor); target == max; skewed BST" },
  "Ceil in a BST":                  { pattern:"Iterative Descent — track the smallest value ≥ target seen so far.", insight:"BST ordering localizes the ceil to the path taken when going left.", complexity:"T: O(h)  S: O(1)", followup:"Floor?; closest neighbor?", clarify:"Target may be absent?; integer overflow?", edges:"Target larger than max (no ceil); target == min; skewed BST" },
  "Kth Smallest and Largest element in BST": { pattern:"Iterative Inorder + Reverse Inorder — counters reach k respectively.", insight:"Inorder visits BST values sorted; reverse inorder visits descending; both reach kth in O(h+k).", complexity:"T: O(h+k)  S: O(h)", followup:"Frequent queries with mutations?; both at once?", clarify:"k 1-indexed?; k bounded by n?", edges:"k = 1; k = n; skewed tree" },
  "Two sum in BST":                 { pattern:"Two Iterators (forward + reverse inorder) — meet in the middle on target.", insight:"Two synchronized BST iterators emulate two-pointer on sorted array without flattening.", complexity:"T: O(n)  S: O(h)", followup:"k-sum in BST?; allow same node twice?", clarify:"Use same node twice?; values unique?", edges:"Empty tree; single node; target unreachable" },
  "BST iterator":                   { pattern:"Lazy Inorder via Stack — initialize with left chain; next() pops then pushes popped.right's left chain.", insight:"Each node pushed/popped once across iterator's lifetime → amortized O(1) next().", complexity:"T: O(1) amortized  S: O(h)", followup:"Reverse iterator?; iterator over k smallest?", clarify:"Iterator persists across mutations?; thread-safe?", edges:"Empty; single node; skewed" },
  "Size of the largest BST in a Binary Tree": { pattern:"Postorder Aggregator — return (isBst, min, max, size) for each subtree.", insight:"Subtree-level invariants combine in postorder so a single O(n) sweep finds the largest valid BST.", complexity:"T: O(n)  S: O(h)", followup:"Largest BST sum?; lock subtree?", clarify:"Single-node counts as BST?; duplicates allowed?", edges:"All-BST tree (whole tree); no valid BST larger than 1; tree is a single node" },
  // Graph · Strivers
  "DFS":                                 { pattern:"Recursive Depth-First — push to call stack, mark visited on entry.", insight:"DFS explores via recursion; visited set prevents cycles.", complexity:"T: O(V+E)  S: O(V)", followup:"Iterative with explicit stack?; iterative with state machine?", clarify:"Directed or undirected?; visited semantics?", edges:"Empty graph; single node; cyclic graph" },
  "Traversal Techniques":                { pattern:"DFS vs BFS Tradeoff — depth vs breadth, stack vs queue.", insight:"DFS finds any path; BFS finds shortest unweighted path; choice depends on the question asked.", complexity:"T: O(V+E)  S: O(V)", followup:"Bidirectional BFS?; iterative deepening DFS?", clarify:"Connected vs disconnected?; weighted edges?", edges:"Disconnected graph; cycles; single node" },
  "Detect A cycle in Undirected Graph using BFS": { pattern:"BFS with Parent Tracking — non-parent visited neighbor signals a cycle.", insight:"In undirected BFS, an already-visited neighbor that is not your parent must close a cycle.", complexity:"T: O(V+E)  S: O(V)", followup:"Find the cycle nodes?; multi-component graph?", clarify:"Self-loops allowed?; multi-edges?", edges:"Tree (no cycle); self-loop; single edge cycle (2 nodes)" },
  "Detect A cycle in Undirected Graph using DFS": { pattern:"DFS with Parent — non-parent visited neighbor signals a cycle.", insight:"Same logic as BFS variant; recursion stack replaces explicit queue.", complexity:"T: O(V+E)  S: O(V)", followup:"Iterative DFS?; bridges/articulation?", clarify:"Self-loops?; multi-edges?", edges:"Tree; self-loop; single edge" },
  "Detect A cycle in a Directed Graph using DFS": { pattern:"DFS with 3-Color — gray edge to gray neighbor signals a back-edge.", insight:"Directed cycles correspond to back-edges in DFS, detectable via white/gray/black coloring.", complexity:"T: O(V+E)  S: O(V)", followup:"Find one cycle?; topological sort if acyclic?", clarify:"Self-loops are 1-cycles?; multi-graph?", edges:"DAG; self-loop; back-edge to root" },
  "Detect A cycle in a Directed Graph using BFS": { pattern:"Kahn's Algorithm — repeatedly remove indegree-0 nodes; remainder forms a cycle.", insight:"If topological sort doesn't consume all nodes, the leftover nodes are in cycles.", complexity:"T: O(V+E)  S: O(V)", followup:"Find the cycle?; longest path in DAG?", clarify:"Multi-graph?; self-loops?", edges:"DAG; isolated vertices; single self-loop" },
  "Topological Sort BFS":                { pattern:"Kahn's Algorithm — repeatedly emit indegree-0 nodes.", insight:"Removing source nodes layer by layer yields a valid topological order in O(V+E).", complexity:"T: O(V+E)  S: O(V)", followup:"Lexicographically smallest order?; multiple valid orders?", clarify:"Cycles cause failure?; reproducibility needed?", edges:"DAG with isolated vertices; cycle (no order); single node" },
  "Topological Sort DFS":                { pattern:"DFS Postorder Reverse — postorder finish times, reverse for topo order.", insight:"DFS finish-time reversal gives a topological order on a DAG.", complexity:"T: O(V+E)  S: O(V)", followup:"Iterative variant?; for SCC condensation?", clarify:"Cycles cause failure?; multiple valid orders?", edges:"DAG; cycle; isolated vertices" },
  "Bipartite graph":                     { pattern:"BFS Two-Coloring — color start 0, neighbors 1; conflict means not bipartite.", insight:"Two-coloring succeeds iff no odd-length cycle; BFS detects conflicts in O(V+E).", complexity:"T: O(V+E)  S: O(V)", followup:"DFS variant?; weighted bipartite matching?", clarify:"Disconnected?; self-loops fail immediately?", edges:"Disconnected; single node; self-loop; isolated vertices" },
  "Bipartite Check using DFS":           { pattern:"DFS Two-Coloring — assign opposite color to each neighbor; conflict means not bipartite.", insight:"Same theorem as BFS variant; recursion stack replaces queue.", complexity:"T: O(V+E)  S: O(V)", followup:"Multi-component variant?; k-coloring?", clarify:"Disconnected?; self-loops?", edges:"Disconnected; single node; self-loop" },
  "Strongly Connected Component (Kosaraju)": { pattern:"Two-Pass DFS — DFS finish-time order on G, then DFS on Gᵀ in that order.", insight:"Reversing edge direction and replaying DFS in finish-time order isolates SCCs in two linear passes.", complexity:"T: O(V+E)  S: O(V)", followup:"Tarjan's single-pass variant?; SCC condensation DAG?", clarify:"Self-loops are 1-SCCs?; isolated vertices are 1-SCCs?", edges:"DAG (each node is its own SCC); single big SCC; isolated vertices" },
  "Dijkstra's algorithm":                { pattern:"Min-Heap Greedy — pop nearest, relax neighbors with non-negative weights.", insight:"Greedy expansion of nearest unsettled node is optimal when edge weights are non-negative.", complexity:"T: O((V+E) log V)  S: O(V)", followup:"Negative weights (Bellman-Ford)?; A*?; bidirectional?", clarify:"Non-negative weights?; multiple sources?; target-only?", edges:"Disconnected target (infinity); zero-weight edges; single source = target" },
  "Bellman ford algorithm":              { pattern:"Iterative Relaxation V-1 Times — detect negative cycle by extra relaxation.", insight:"Relaxing all edges V-1 times suffices for shortest paths; a Vth relaxation that succeeds proves a negative cycle.", complexity:"T: O(V*E)  S: O(V)", followup:"Detect which nodes are reachable from a negative cycle?; SPFA?", clarify:"Allow negative weights?; allow disconnected?", edges:"Negative cycle present; isolated vertices; single edge" },
  "Floyd Warshall Algorithm":            { pattern:"Triple-Nested DP — dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j]).", insight:"All-pairs shortest paths via DP over allowed intermediate vertices; O(V^3).", complexity:"T: O(V^3)  S: O(V^2)", followup:"Path reconstruction?; transitive closure variant?", clarify:"Allow negative weights (no negative cycle)?; dense vs sparse graph?", edges:"Disconnected (infinities); negative cycle (diagonal becomes negative); single node" },
  "MST using Prim's Algo":               { pattern:"Min-Heap Greedy from a Source — grow tree by minimum-weight crossing edge.", insight:"Greedy edge-by-edge expansion is optimal because adding a minimum crossing edge never violates MST.", complexity:"T: O((V+E) log V)  S: O(V)", followup:"Boruvka's algorithm?; second-best MST?", clarify:"Connected graph guaranteed?; allow parallel edges?", edges:"Single node; tree input (already MST); duplicate weights" },
  "MST using Kruskal's Algo":            { pattern:"Sort Edges + Union-Find — accept edge if it joins different components.", insight:"Sorting edges and accepting via union-find avoids cycles while greedily picking lowest weights.", complexity:"T: O(E log E)  S: O(V)", followup:"Boruvka's algorithm?; reverse-delete?", clarify:"Connected guaranteed?; multi-edges?", edges:"Single node; already MST; tied weights" },
  // Heap · Strivers
  "Implement Max Heap":                  { pattern:"Array-Backed Binary Heap — sift up on insert, sift down on extract.", insight:"Heap operations are O(log n) because each sift only walks one root-to-leaf path.", complexity:"T: O(log n) per op  S: O(n)", followup:"D-ary heap?; pairing heap?; persistent heap?", clarify:"Resizable?; thread-safe?", edges:"Empty extract; single element; full capacity (resize)" },
  "Maximum Sum Combination":             { pattern:"Max-Heap of (sum, i, j) — neighbors-of-best generates the next best.", insight:"Sorted inputs let neighbors-of-best generate the next top-k in O(k log k).", complexity:"T: O(k log k)  S: O(k)", followup:"Top-k sums of N arrays?; allow duplicate pairs?", clarify:"0-indexed?; arrays sorted ascending?; visited set?", edges:"k = 1; k = n*m; arrays of size 1" },
  "Top K Frequent Elements":             { pattern:"Bucket Sort by Frequency — index buckets by count, pick top buckets.", insight:"Frequencies are bounded by n, so O(n) bucket sort beats heap-based O(n log k) when k is large.", complexity:"T: O(n)  S: O(n)", followup:"Streaming top-k?; ties broken lexicographically?", clarify:"k <= distinct?; output order matters?", edges:"All same; all distinct; k = 1; k = n" },
  // Trie · Strivers
  "Trie Implementation and Operations":  { pattern:"Prefix Tree — each node maps a character to a child, end-flag marks word boundary.", insight:"Tries amortize prefix sharing across many strings, giving O(L) per insert/lookup.", complexity:"T: O(L) per op  S: O(N*L)", followup:"Array-backed for ASCII speed?; ternary search tree?", clarify:"Case-sensitive?; allow non-ASCII?; persistent variant?", edges:"Empty trie; single character; deeply nested shared prefix" },
  "Trie Implementation and Advanced Operations": { pattern:"Prefix Tree + Counts — counts at nodes enable wordsWithPrefix and prefix delete.", insight:"Adding insert/delete counters at every node turns a trie into a queryable database.", complexity:"T: O(L) per op  S: O(N*L)", followup:"Persistent variant?; compressed trie (radix tree)?", clarify:"Counts under deletes?; case folding?", edges:"Delete non-existent word; delete leaving empty trie; mixed case" },
  "Longest Word with All Prefixes":      { pattern:"Trie Walk — only words whose every prefix is also a word qualify.", insight:"Insert all words; DFS the trie keeping only paths where every node has end-flag.", complexity:"T: O(N*L)  S: O(N*L)", followup:"Stream variant?; case-insensitive?", clarify:"Tie-break (lexicographically smallest)?; allow empty word?", edges:"All words share prefixes; no qualifying word; single 1-char word" },
  "Number of distinct substrings in a string": { pattern:"Suffix Trie / Suffix Array — count internal nodes (or LCP-based formula).", insight:"The number of distinct substrings equals the number of internal trie nodes (or n*(n+1)/2 - sum of LCP).", complexity:"T: O(n^2) trie / O(n log n) suffix array  S: O(n^2) / O(n)", followup:"Online variant?; longest distinct substring?", clarify:"ASCII alphabet?; case sensitive?", edges:"All same character; n = 1; very long string" },
  "Maximum XOR of two numbers in an array": { pattern:"Bitwise Trie — insert each 32-bit representation; greedily descend opposite bits per query.", insight:"At every bit, picking the opposite bit (when possible) maximizes that bit's XOR contribution.", complexity:"T: O(n*32)  S: O(n*32)", followup:"Offline queries?; 2D variant?", clarify:"Numbers fit in 32 bits?; allow same index twice?", edges:"All zeros; identical numbers; n = 2" },
  "Maximum Xor with an element from an array": { pattern:"Offline Sort + Trie — sort queries and array by upper bound, insert as bound rises.", insight:"Sorting both sides ensures the trie always contains exactly the candidates ≤ current m.", complexity:"T: O((n+q) log n + (n+q)*32)  S: O(n*32)", followup:"Online variant?; range-restricted XOR?", clarify:"Multiple queries with same m?; preserve query order?", edges:"All m too small; n = 1; q = 0" },
  // Recursion · Strivers
  "Subset Sums":                         { pattern:"Recursive Pick/Skip — at each index, include or exclude.", insight:"Each subset corresponds to a unique sequence of pick/skip decisions; total work is 2^n.", complexity:"T: O(2^n)  S: O(n)", followup:"Sort and emit?; iterative bitmask?", clarify:"Output order matters?; duplicates in input?", edges:"Empty array (one subset = sum 0); all zeros; n = 1" },
  "Subsets II":                          { pattern:"Sort + Skip Duplicates — sort and skip same-value siblings to dedupe.", insight:"Sorting groups duplicates so a single skip-rule on each recursion level suppresses repeats.", complexity:"T: O(2^n)  S: O(n)", followup:"Permutations II?; combinations with repetition?", clarify:"Output unique subsets?; preserve order?", edges:"All duplicates; empty input; mixed duplicates" },
  "Combination Sum II":                  { pattern:"Sort + Pick-Once + Skip Duplicates — each candidate used once, dedupe siblings.", insight:"Sorting plus a same-level skip rule deduplicates without explicit set bookkeeping.", complexity:"T: O(2^n)  S: O(target)", followup:"Combination Sum I (reuse)?; counting variant via DP?", clarify:"Duplicates in candidates?; allow target zero?", edges:"All duplicates; target larger than sum; single candidate" },
  "Palindrome partitioning":             { pattern:"Backtracking + Palindrome Check — explore each partition, prune non-palindrome cuts.", insight:"DP-precomputed palindrome flags make per-cut check O(1).", complexity:"T: O(n*2^n)  S: O(n^2) for flags", followup:"Minimum cuts (interval DP)?; longest palindrome partition?", clarify:"Single character is a palindrome; output as list of lists?", edges:"Empty string; all same character; already a palindrome" },
  "Permutation Sequence":                { pattern:"Factorial Number System — pick digit at each position by k / (n-1)!.", insight:"Treating k-1 in factorial base directly gives the kth permutation in O(n^2) without enumeration.", complexity:"T: O(n^2)  S: O(n)", followup:"Inverse (find k from a permutation)?; multiset variant?", clarify:"k 1-indexed?; n bounded?", edges:"k = 1 (identity); k = n!; n = 1" },
  "Permutations of a String":            { pattern:"Backtracking with Swap — fix prefix, recursively permute suffix.", insight:"In-place swap-based permutation avoids copying the prefix at each level.", complexity:"T: O(n*n!)  S: O(n)", followup:"Permutations II (with duplicates)?; lexicographic next permutation?", clarify:"Output order?; allow duplicates?", edges:"Empty string; single character; all same character" },
  "M Coloring Problem":                  { pattern:"Backtracking — assign colors greedily, prune on conflict.", insight:"DFS over vertex order with on-the-fly conflict pruning.", complexity:"T: O(M^V)  S: O(V)", followup:"Chromatic number?; bipartite (M=2)?", clarify:"Vertex order matters for performance?; constraint type?", edges:"M >= V (always feasible); M = 1 (only if no edges); empty graph" },
  "Rat in a Maze":                       { pattern:"Backtracking on Grid — try each direction, mark visited on entry.", insight:"Pure DFS with a visited grid; emit a path string on reaching the goal.", complexity:"T: O(4^(n*n))  S: O(n*n)", followup:"All shortest paths?; weighted maze (Dijkstra)?", clarify:"Movement directions?; output all paths?", edges:"Start blocked; goal blocked; single-cell maze" },
  // Greedy · Strivers
  "N meetings in one room":              { pattern:"Sort by End Time + Greedy Pick — pick next non-overlapping meeting.", insight:"Earliest-finish heuristic is optimal for interval scheduling; classic exchange argument.", complexity:"T: O(n log n)  S: O(1) extra", followup:"Weighted interval scheduling?; multiple rooms?", clarify:"Inclusive/exclusive endpoints?; ties?", edges:"All overlap (pick 1); none overlap (pick all); single meeting" },
  "Minimum number of platforms required for a railway": { pattern:"Sort Arrivals/Departures + Sweep — track running platforms, max is the answer.", insight:"Two-pointer sweep over sorted arrivals and departures captures peak concurrency.", complexity:"T: O(n log n)  S: O(1)", followup:"Online variant?; train priorities?", clarify:"Equal time = same platform?; format of times?", edges:"All arrive together; all depart together; one train" },
  "Job sequencing Problem":              { pattern:"Sort by Profit + DSU Slot — assign each job to the latest free slot ≤ deadline.", insight:"Union-find compresses the search for the latest free slot to nearly O(1) per job.", complexity:"T: O(n log n)  S: O(n)", followup:"Job sequencing with cooldown?; weighted deadlines?", clarify:"Profit non-negative?; deadline 1-indexed?", edges:"All deadlines = 1; all same profit; empty input" },
  "Fractional Knapsack":                 { pattern:"Sort by Value/Weight + Greedy Fill — take whole items, fraction the last.", insight:"Continuous knapsack is greedy because partial inclusion is allowed; sorted by ratio.", complexity:"T: O(n log n)  S: O(1)", followup:"0/1 knapsack DP?; multiple knapsacks?", clarify:"Capacity float-precision?; positive weights?", edges:"Capacity 0; single item; all items fit" },
  "Assign Cookies":                      { pattern:"Sort + Two-Pointer Greedy — sort children and cookies, advance pointers, count fits.", insight:"Pairing the smallest cookie that satisfies the smallest child maximizes total satisfied.", complexity:"T: O(n log n + m log m)  S: O(1)", followup:"Maximize cookie value rather than count?; multiple cookies per child?", clarify:"Strict greater-equal?; arrays may be empty?", edges:"Empty inputs; cookies all too small; greedy children all same size" },
  // DP · Strivers
  "Longest common subsequence":          { pattern:"2D DP Edit-Style — dp[i][j] = dp[i-1][j-1]+1 if match, else max(dp[i-1][j], dp[i][j-1]).", insight:"Each prefix pair has an optimal LCS; recurrence chooses to align or skip one character.", complexity:"T: O(n*m)  S: O(min(n,m)) rolling",     followup:"Reconstruct the LCS?; longest common substring?; LPS?", clarify:"Case-sensitive?; allow non-ASCII?", edges:"Empty strings; identical; no common chars" },
  "0 and 1 Knapsack":                    { pattern:"2D DP — dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i]).", insight:"Each item is included or excluded; the recurrence enumerates both.", complexity:"T: O(n*W)  S: O(W) rolling row", followup:"Unbounded knapsack?; bounded item counts?", clarify:"Integer weights?; capacity bounded?", edges:"Capacity 0; single item; all items too heavy" },
  "Edit distance":                       { pattern:"Levenshtein 2D DP — dp[i][j] = 1 + min(insert, delete, replace); 0 cost on match.", insight:"Each cell decides between three operations; recurrence captures all three on prefixes.", complexity:"T: O(n*m)  S: O(min(n,m)) rolling row", followup:"Damerau-Levenshtein?; weighted operations?", clarify:"All ops same cost?; case-sensitive?", edges:"Empty strings; identical; one a prefix of the other" },
  "Maximum Sum Increasing Subsequence":  { pattern:"DP over LIS Recurrence — dp[i] = max(dp[j] + a[i]) for j<i with a[j]<a[i].", insight:"Same scaffold as LIS but accumulating values rather than counting length.", complexity:"T: O(n^2)  S: O(n)", followup:"O(n log n) variant?; reconstruct subsequence?", clarify:"Strictly increasing?; values may be negative?", edges:"All same value; sorted descending; n = 1" },
  "Matrix chain multiplication":         { pattern:"Interval DP — dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j].", insight:"Each split point yields a multiplication cost; interval DP enumerates all splits.", complexity:"T: O(n^3)  S: O(n^2)", followup:"Reconstruct the parenthesization?; Knuth's O(n^2)?", clarify:"Dimensions positive?; matrices non-square?", edges:"Single matrix (cost 0); two matrices; chain of 1xN or Nx1" },
  "Minimum Path Sum (Strivers)":         { pattern:"2D DP Right/Down — dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]).", insight:"Optimal path to (i,j) extends optimal path to (i-1,j) or (i,j-1); each cell decides locally.", complexity:"T: O(m*n)  S: O(n) rolling row", followup:"All four directions (Dijkstra)?; reconstruct path?", clarify:"Negative values?; non-rectangular grid?", edges:"1xN or Mx1; all zeros; all negatives" },
  "Coin change II":                      { pattern:"Unbounded Knapsack — dp[a] = sum over coins of dp[a - coin]; coin loop outer.", insight:"Outer-coin / inner-amount counts unordered combinations; reverse counts permutations.", complexity:"T: O(amount * coins)  S: O(amount)", followup:"Count permutations?; minimum coins?", clarify:"Coins unique?; amount = 0 returns 1?", edges:"amount 0; no coins; coin > amount" },
  "Subset sum equals to target":         { pattern:"Boolean Knapsack DP — dp[i][s] = dp[i-1][s] || dp[i-1][s - a[i]].", insight:"Each subset contributes 0 or one element; bottom-up table fills all reachable sums.", complexity:"T: O(n*sum)  S: O(sum) rolling row", followup:"Count subsets?; partition into k equal subsets?", clarify:"Non-negative values?; sum bounded?", edges:"Sum 0 (empty subset); single element; sum exceeds total" },
  "Rod cutting problem":                 { pattern:"Unbounded Knapsack — dp[len] = max over k of dp[len-k] + price[k].", insight:"Each rod length decomposes into one cut plus the optimal of the rest; standard DP.", complexity:"T: O(n^2)  S: O(n)", followup:"Reconstruct cut points?; cost-per-cut variant?", clarify:"Prices non-negative?; integer lengths only?", edges:"Length 0; price array length 1; identical prices" },
  "Super Egg Drop":                      { pattern:"Inverted DP — dp[k][m] = max floors testable with k eggs and m moves.", insight:"Inverting state from (eggs, floors) to (eggs, moves) collapses cost from O(k*n^2) to O(k*n).", complexity:"T: O(k*n)  S: O(k*n)", followup:"Closed form?; eggs reusable?", clarify:"Egg breaks irreversibly?; thresholds inclusive?", edges:"1 egg (linear); k >= log2(n) (binary); n = 0" },
  "Minimum coins (Strivers)":            { pattern:"Unbounded Knapsack DP — dp[a] = min(dp[a - coin] + 1) over coins.", insight:"Minimum coins to reach amount a depends only on minimums for smaller a.", complexity:"T: O(amount * coins)  S: O(amount)", followup:"Bounded coins?; max coins variant?", clarify:"Coins distinct?; reaching impossible amounts?", edges:"amount 0 (zero coins); no valid combo (-1); single coin" }
  // ───── Future task groups (8.2-8.9) splice their entries above this line ─────
};

// Normalize a raw DSA task name into a key suitable for PROBLEM_PREP lookup.
// Strips numeric prefixes ("1. ", "001 "), trailing difficulty badges
// ("[E]", "[M]", "[H]", "[M·P]"), and variant suffixes ("(variant)",
// "— follow-up", "- follow-up") so prepLookup can match decorated DSA task
// text against canonical PROBLEM_PREP keys.
function normalizePrepKey(rawName){
  return String(rawName)
    .replace(/^\s*\d+[.)\s-]+/, "")
    .replace(/\s*\[[^\]]+\]\s*$/, "")
    .replace(/\s*\((variant|follow-?up)\)\s*$/i, "")
    .replace(/\s*[—-]\s*(variant|follow-?up)\s*$/i, "")
    .trim();
}

// Module-local set tracking which prep names have already produced a
// console.warn — so each missing name (and the table-missing banner) warns
// exactly once per page load.
const _warnedMissingPrep = new Set();

// Module-level set tracking which prep cards are currently expanded, keyed by
// `prepId` (e.g. `${taskId}::${normalizePrepKey(name)}` for the Daily Schedule
// or `grind::${normalizePrepKey(name)}` for the Grind 169 tab). Membership is
// the single source of truth that `renderPrepCard` consults to decide whether
// to emit an open or collapsed card on every render pass — so cards stay open
// across re-renders triggered by checkbox ticks, note edits, or timer updates
// (Requirement 5.3). NOT persisted to localStorage: the Set lives only in
// memory for the current page session, so reloading the page returns every
// card to the collapsed default (Requirement 5.4).
const expandedPrepCards = new Set();

// Emit a single console.warn for `name` the first time it is missing from
// PROBLEM_PREP. The sentinel "__missing_table__" is reserved for the
// banner warning when PROBLEM_PREP itself is undefined.
function warnMissingPrepOnce(name){
  const key = name == null ? "" : String(name);
  if (_warnedMissingPrep.has(key)) return;
  _warnedMissingPrep.add(key);
  if (key === "__missing_table__") {
    console.warn("PROBLEM_PREP table missing — prep cards disabled");
  } else {
    console.warn(`PROBLEM_PREP: no entry for "${key}"`);
  }
}

// Look up a prep entry for a raw DSA task name. Returns the entry object
// on hit, or null on miss / when PROBLEM_PREP is unavailable. Misses
// trigger a single console.warn per normalized key.
function prepLookup(rawName){
  if (!rawName) return null;
  // Guard: PROBLEM_PREP could be undefined if an earlier JS error blocked its declaration
  if (typeof PROBLEM_PREP === 'undefined') {
    warnMissingPrepOnce("__missing_table__");
    return null;
  }
  const key = normalizePrepKey(rawName);
  const entry = PROBLEM_PREP[key] || null;
  if (!entry) warnMissingPrepOnce(key);
  return entry;
}

// Escape HTML-significant characters so prep-card content can safely
// interpolate into innerHTML strings. Covers the four characters that can
// break attribute or element parsing: `&`, `<`, `>`, and `"`.
// Order matters: `&` MUST be replaced first so the later substitutions don't
// double-escape the ampersands they introduce (e.g. `<` → `&lt;` would become
// `&amp;lt;` if `&` were escaped after `<`).
// @param {*} s — coerced to string before escaping
// @returns {string} the input with `& < > "` replaced by their entity forms
function escapeHTML(s){
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Sanitize an arbitrary string into a fragment safe for use inside an HTML
// `id` attribute. Replaces every character that is not ASCII alphanumeric
// with `_` so problem names containing spaces, punctuation, or em-dashes
// (e.g. "Two Sum II — input array is sorted") yield a valid id like
// `Two_Sum_II___input_array_is_sorted`. Used by `renderPrepCard` to build
// per-card ids of the form `prep-${cssEscape(prepId)}`.
// @param {*} s — coerced to string before sanitizing
// @returns {string} the input with every non-alphanumeric character replaced by `_`
function cssEscape(s){
  return String(s).replace(/[^A-Za-z0-9]/g, "_");
}

// Render a single labelled row inside a prep-card. Two-shape output:
//   - When `value` contains a `;`, the value is treated as a multi-item field
//     and rendered as a `<ul>` with one `<li>` per non-empty trimmed segment
//     (per Requirement 1.5 / Property 5: count of <li> tags equals the count
//     of non-empty trimmed segments in `value.split(";")`).
//   - Otherwise the value is rendered as plain escaped text inside the `.val`
//     span (zero `<li>` tags).
// All emitted text is run through `escapeHTML` so prep content containing
// `< > & "` cannot break attribute or element parsing (Property 14).
// `labelClass` is the modifier class (e.g. "pattern", "insight", "complex",
// "followup", "clarify", "edges") that selects the existing per-label color
// token from the prep-card CSS in tracker/index.html.
// @param {string} labelText  — visible label text (e.g. "Pattern", "Edge Cases")
// @param {string} labelClass — modifier class on `.label`
// @param {*}      value      — coerced to string; `;` triggers list rendering
// @returns {string} a `<div class="row">…</div>` HTML fragment
function renderPrepRow(labelText, labelClass, value){
  const str = String(value);
  let body;
  if (str.includes(";")) {
    const items = str.split(";").map(s => s.trim()).filter(Boolean);
    body = `<ul>${items.map(s => `<li>${escapeHTML(s)}</li>`).join("")}</ul>`;
  } else {
    body = escapeHTML(str);
  }
  return `<div class="row">
      <span class="label ${labelClass}">${labelText}</span>
      <span class="val">${body}</span>
    </div>`;
}

// Render a single prep card (toggle + collapsible body) for one problem.
// PURE function: identical inputs always produce identical output. The
// open-vs-collapsed shape of the returned HTML is determined solely by
// `expandedPrepCards.has(prepId)` at call time — so callers can re-invoke
// `renderPrepCard` after any in-session re-render and the card's open state
// will survive (Requirement 5.3). All six rows are emitted in the fixed
// order required by Requirement 3.2: Pattern, Key Insight, Complexity,
// Follow-up, Clarify, Edge Cases — using the existing label modifier
// classes `pattern`, `insight`, `complex`, `followup`, `clarify`, `edges`
// already defined in tracker/index.html (Requirement 3.3 / 8.1).
//
// Attribute escaping:
//   - `data-prep-toggle` and `data-prep-card` carry the raw `prepId` (which
//     may include problem-name characters like spaces, em-dashes, or quotes),
//     so the value MUST be run through `escapeHTML` to keep `"` from
//     terminating the attribute early (Property 14 / Requirement 8.5).
//   - `id` and `aria-controls` use `cssEscape(prepId)`, which already
//     replaces every non-alphanumeric character with `_`, so its output is
//     safe to interpolate directly without further escaping.
//
// Toggle wiring is intentionally NOT done here: this function emits markup
// only. The click + keyboard handlers are attached separately by
// `wirePrepToggles` (task 4.1), which reads back `data-prep-toggle` /
// `data-prep-card` to flip `expandedPrepCards` membership and re-style the
// card in place. Containing `renderPrepCard` to a pure string-in / string-out
// shape is what lets Properties 6, 7, 8, 13, and 14 test it without a DOM.
//
// No external links are emitted (Requirement 7.1 / 7.3) — the card content
// is whatever the caller-supplied `prep` fields contain, rendered through
// `renderPrepRow` which only emits `<ul>`, `<li>`, and `<span>` elements.
//
// @param {string}    prepId — opaque per-card identifier; doubles as the
//                              `expandedPrepCards` Set key and the `data-*`
//                              attribute value
// @param {Object}    prep   — six-field prep entry
// @param {string}    prep.pattern
// @param {string}    prep.insight
// @param {string}    prep.complexity
// @param {string}    prep.followup
// @param {string}    prep.clarify
// @param {string}    prep.edges
// @returns {string} a `<span class="prep-toggle">…</span><div class="prep-card">…</div>`
//                   HTML fragment, ready to be embedded inside an existing
//                   task `<li>` or Grind row `<li>`
function renderPrepCard(prepId, prep){
  const open = expandedPrepCards.has(prepId);
  const cardStyle = open ? "" : "display:none";
  const toggleText = open ? "▾ Hide prep" : "▸ Show prep";
  const idAttr = cssEscape(prepId);
  const dataAttr = escapeHTML(prepId);
  return `
    <span class="prep-toggle"
          data-prep-toggle="${dataAttr}"
          tabindex="0" role="button"
          aria-expanded="${open}"
          aria-controls="prep-${idAttr}"
          title="Show/hide the per-problem interview prep card (pattern, insight, complexity, follow-up, clarify, edges).">${toggleText}</span>
    <div class="prep-card" id="prep-${idAttr}" data-prep-card="${dataAttr}" style="${cardStyle}">
      ${renderPrepRow("Pattern",     "pattern",  prep.pattern)}
      ${renderPrepRow("Key Insight", "insight",  prep.insight)}
      ${renderPrepRow("Complexity",  "complex",  prep.complexity)}
      ${renderPrepRow("Follow-up",   "followup", prep.followup)}
      ${renderPrepRow("Clarify",     "clarify",  prep.clarify)}
      ${renderPrepRow("Edge Cases",  "edges",    prep.edges)}
    </div>`;
}

// Convert a six-field prep entry into a plain-text block for the clipboard
// export (consumed by `taskToText` / `buildDayText`). Emits exactly six
// labelled lines in the fixed order matching the on-screen render order
// (Requirement 6.1):
//
//   Pattern, Key Insight, Complexity, Follow-up, Clarify, Edge Cases
//
// Indentation contract (Requirement 6.4 / Property 17): every line begins
// with at least five leading space characters, so the prep block stays
// visually distinct from the surrounding task lines — DSA task lines
// begin with `  • ` (two spaces and a bullet), so a five-space indent
// nests the prep block underneath them in any plain-text viewer.
//
// Multi-item fields use `;` as separator (Requirement 1.5). When a value
// contains a semicolon, the label is emitted on its own line as
// `     Label:` (five spaces, label, colon — with NO trailing
// colon-space), and each non-empty trimmed segment becomes a bullet line
// of the form `       - item` (seven leading spaces — five for the
// indent plus two for the `- ` marker — followed by the trimmed segment
// text). This matches Property 12: a value with k semicolons yields k+1
// segments, so the renderer emits one bullet per non-empty trimmed
// segment (k+1 bullets when none are empty). Empty segments — produced
// by stray separators like a trailing `;` or a `;;` run — are filtered
// out so the export never contains an empty `       - ` line.
//
// Each field value is coerced to `String` before the `;` check so the
// helper is defensive against any non-string field reaching it (e.g. a
// future schema mistake or a malformed `PROBLEM_PREP` entry).
//
// @param {Object} prep            — six-field prep entry (see PrepEntry)
// @param {string} prep.pattern
// @param {string} prep.insight
// @param {string} prep.complexity
// @param {string} prep.followup
// @param {string} prep.clarify
// @param {string} prep.edges
// @returns {string} a multi-line plain-text block, suitable for direct
//                   inclusion under a DSA task line in `taskToText`
function prepToPlainText(prep){
  const lines = [];
  const push = (label, val) => {
    const s = String(val);
    if (s.includes(";")){
      lines.push(`     ${label}:`);
      s.split(";")
       .map(seg => seg.trim())
       .filter(seg => seg.length > 0)
       .forEach(seg => lines.push(`       - ${seg}`));
    } else {
      lines.push(`     ${label}: ${s}`);
    }
  };
  push("Pattern",     prep.pattern);
  push("Key Insight", prep.insight);
  push("Complexity",  prep.complexity);
  push("Follow-up",   prep.followup);
  push("Clarify",     prep.clarify);
  push("Edge Cases",  prep.edges);
  return lines.join("\n");
}

// Escape a string for safe interpolation into an attribute-equals selector
// like `[data-prep-card="..."]`. Problem names contain spaces, em-dashes,
// quotes, and backslashes, all of which can break a naively-built selector.
// Prefers the canonical `CSS.escape()` API (well-supported in every browser
// the Tracker targets); falls back to escaping `\` and `"` for environments
// where `CSS.escape` is somehow unavailable (older test runners).
// @param {*} s — coerced to string before escaping
// @returns {string} a fragment safe to interpolate inside `[attr="..."]`
function _cssAttrEscape(s){
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(s);
  }
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// Bind click + keyboard activation handlers to every `.prep-toggle` inside
// `cont`. Each toggle activates a single Prep Card whose `data-prep-card`
// attribute matches the toggle's `data-prep-toggle` value, with all lookup
// scoped to `cont` — so two cards rendered with the same Problem Name in
// different views (e.g. the Daily Schedule and the Grind 169 Tab) never
// cross-toggle (Requirement 5.5).
//
// On activation (click, Enter, or Space):
//   1. Stop the event from bubbling up to ancestor handlers (Requirement
//      3.7) — DSA tasks have parent click handlers for `why-toggle` and
//      `<li>` selection that would otherwise also fire.
//   2. Flip the toggle's `prepId` membership in the module-local
//      `expandedPrepCards` Set, which is the single source of truth that
//      `renderPrepCard` consults on every subsequent re-render so the
//      open/closed state survives unrelated re-renders (Requirement 5.3).
//   3. Update the matching `.prep-card`'s inline `style.display` to either
//      `""` (open — falls back to the stylesheet's natural display) or
//      `"none"` (closed). This avoids removing/recreating the card markup
//      and avoids any flicker (Requirement 5.2).
//   4. Update the toggle's text and `aria-expanded` attribute to reflect
//      the new state (Requirement 3.6 / 3.7).
//
// Keyboard handling: Enter and Space both activate the toggle (Requirement
// 3.8). The `Space` key reports as `" "` in modern browsers and as
// `"Spacebar"` in some older Edge / IE-derived environments, so both are
// accepted. `preventDefault()` on those keys stops Space from scrolling
// the page when the toggle has focus.
//
// Idempotence: `wirePrepToggles` is called from inside
// `wireScheduleInteractions(cont)` (task 4.2) and the Grind 169 wiring
// tail (task 4.3), both of which fire on every re-render. To avoid
// double-binding the same toggle (which would flip the state twice per
// click, leaving it where it started), each toggle is tagged with a
// `__prepWired` property the first time it is wired and skipped on every
// subsequent pass. Re-rendered toggles are fresh DOM nodes, so they pick
// up handlers as expected.
//
// Defensive guards: returns early when `cont` is null/undefined or lacks
// `querySelectorAll`, and skips toggles missing a `data-prep-toggle`
// value rather than throwing — consistent with Requirement 1.6's
// non-throwing posture.
//
// @param {Element|Document} cont — any object with a `querySelectorAll`
//                                  method whose subtree contains the
//                                  `.prep-toggle` elements to wire
function wirePrepToggles(cont){
  if (!cont || typeof cont.querySelectorAll !== "function") return;
  cont.querySelectorAll(".prep-toggle").forEach(tg => {
    if (tg.__prepWired) return;
    tg.__prepWired = true;
    const activate = (e) => {
      if (e && typeof e.stopPropagation === "function") e.stopPropagation();
      const prepId = tg.dataset.prepToggle;
      if (!prepId) return;
      const card = cont.querySelector(`[data-prep-card="${_cssAttrEscape(prepId)}"]`);
      const willOpen = !expandedPrepCards.has(prepId);
      if (willOpen) expandedPrepCards.add(prepId); else expandedPrepCards.delete(prepId);
      if (card) card.style.display = willOpen ? "" : "none";
      tg.textContent = willOpen ? "▾ Hide prep" : "▸ Show prep";
      tg.setAttribute("aria-expanded", String(willOpen));
    };
    tg.addEventListener("click", activate);
    tg.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        activate(e);
      }
    });
  });
}

// Expose the helpers on `window` so:
//   - the test harness can detect that helpers loaded
//     (typeof window.normalizePrepKey === "function")
//   - the property tests can read/mutate PROBLEM_PREP fixtures and reset
//     the warned-name set between iterations
//   - the diagnostic helper window.__listMissingPrep (added in a later task)
//     can call prepLookup/normalizePrepKey from DevTools
window.PROBLEM_PREP = PROBLEM_PREP;
window.normalizePrepKey = normalizePrepKey;
window.warnMissingPrepOnce = warnMissingPrepOnce;
window.prepLookup = prepLookup;
window.escapeHTML = escapeHTML;
window.cssEscape = cssEscape;
window.renderPrepRow = renderPrepRow;
window.renderPrepCard = renderPrepCard;
window.expandedPrepCards = expandedPrepCards;
window.wirePrepToggles = wirePrepToggles;
window.prepToPlainText = prepToPlainText;

// Test-only helper: clear the once-only warning record so individual
// property-test iterations can be isolated.
window.__resetPrepWarnings = function(){ _warnedMissingPrep.clear(); };
