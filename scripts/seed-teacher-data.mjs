import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv(envPath) {
  try {
    const txt = fs.readFileSync(envPath, "utf8");
    const obj = {};
    for (const l of txt.split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) obj[m[1]] = m[2];
    }
    return obj;
  } catch { return {}; }
}

const env = loadEnv(path.join(__dirname, "..", ".env.local"));
const MONGODB_URI = env.MONGODB_URI || "mongodb://localhost:27017/codearena";

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("codearena");

  // ── Find or create the teacher ───────────────────────────────────────────
  let teacher = await db.collection("users").findOne({ email: "mrteacher@codearena.com" });
  if (!teacher) {
    // Also check campuscode variant
    teacher = await db.collection("users").findOne({ email: "mrteacher@campuscode.com" });
  }
  if (!teacher) {
    console.log("Teacher not found — creating...");
    const hash = await bcrypt.hash("Teacher@123", 10);
    const res = await db.collection("users").insertOne({
      username: "mrteacher",
      email: "mrteacher@codearena.com",
      password: hash,
      role: "teacher",
      createdAt: new Date(),
    });
    teacher = { _id: res.insertedId, username: "mrteacher", email: "mrteacher@codearena.com" };
    console.log("✅ Created teacher:", teacher.email);
  } else {
    console.log("✅ Found teacher:", teacher.email, "— ID:", teacher._id);
  }

  const teacherId   = teacher._id.toString();
  const teacherName = teacher.username || "mrteacher";

  // ── 4 Contests ───────────────────────────────────────────────────────────
  const contests = [
    {
      title: "Data Structures Sprint",
      slug: "ds-sprint-" + Date.now(),
      description: "Test your knowledge of arrays, linked lists, stacks and queues in this fast-paced contest.",
      duration: 90,
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endTime:   new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      problemSlugs: ["two-sum", "valid-parentheses", "reverse-string"],
      difficulty: "Easy",
      tags: ["arrays", "strings", "stack"],
      participants: [], leaderboard: [], status: "upcoming", isPublic: true,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
    {
      title: "Algorithm Blitz",
      slug: "algo-blitz-" + Date.now(),
      description: "Sorting, searching and recursion problems. Can you beat the clock?",
      duration: 120,
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endTime:   new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
      problemSlugs: ["binary-search", "merge-sort", "fibonacci-number"],
      difficulty: "Medium",
      tags: ["sorting", "binary-search", "recursion"],
      participants: [], leaderboard: [], status: "upcoming", isPublic: true,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
    {
      title: "Graph Theory Challenge",
      slug: "graph-challenge-" + Date.now(),
      description: "BFS, DFS, shortest path and spanning trees — graph problems for all levels.",
      duration: 150,
      startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endTime:   new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 150 * 60 * 1000),
      problemSlugs: ["number-of-islands", "course-schedule", "word-ladder"],
      difficulty: "Hard",
      tags: ["graphs", "bfs", "dfs"],
      participants: [], leaderboard: [], status: "upcoming", isPublic: true,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
    {
      title: "DP Fundamentals",
      slug: "dp-fundamentals-" + Date.now(),
      description: "Dynamic programming from tabulation basics to optimization — great interview prep.",
      duration: 180,
      startTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      endTime:   new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 180 * 60 * 1000),
      problemSlugs: ["climbing-stairs", "coin-change", "longest-common-subsequence"],
      difficulty: "Medium",
      tags: ["dynamic-programming", "memoization"],
      participants: [], leaderboard: [], status: "upcoming", isPublic: true,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
  ];
  const cRes = await db.collection("contests").insertMany(contests);
  console.log(`✅ Inserted ${cRes.insertedCount} contests`);

  // ── 3 Placements ─────────────────────────────────────────────────────────
  const placements = [
    {
      title: "Full Stack Developer",
      company: "Infosys",
      location: "Bangalore, India",
      salaryMin: 800000,
      salaryMax: 1200000,
      jobType: "Full-time",
      description: "Build and maintain scalable web applications for enterprise clients. Work with React, Node.js and MongoDB in an agile team.",
      requirements: [
        "B.Tech / MCA in CS or related field",
        "Proficiency in JavaScript, React and Node.js",
        "Knowledge of REST APIs and databases",
        "Good communication skills",
      ],
      applicationDeadline: new Date("2026-04-30"),
      status: "active", applicants: [],
      createdBy: teacherId, createdByUsername: teacherName,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      title: "Software Engineer Trainee",
      company: "TCS",
      location: "Hyderabad, India",
      salaryMin: 350000,
      salaryMax: 450000,
      jobType: "Full-time",
      description: "Entry-level software engineering role. You will receive 6 months of training before joining a product team.",
      requirements: [
        "Fresh graduates (2024–2026 batch)",
        "Strong fundamentals in DSA",
        "Any programming language (Java / Python / C++)",
        "Aggregate CGPA ≥ 6.0",
      ],
      applicationDeadline: new Date("2026-03-31"),
      status: "active", applicants: [],
      createdBy: teacherId, createdByUsername: teacherName,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      title: "Backend Developer Intern",
      company: "Swiggy",
      location: "Bangalore, India (Hybrid)",
      salaryMin: 50000,
      salaryMax: 70000,
      jobType: "Internship",
      description: "6-month internship with the platform engineering team. Work on real microservices that serve millions of users.",
      requirements: [
        "Pre-final or final year students",
        "Experience with Node.js / Go / Java",
        "Understanding of databases (SQL + NoSQL)",
        "Ability to write clean, testable code",
      ],
      applicationDeadline: new Date("2026-05-15"),
      status: "active", applicants: [],
      createdBy: teacherId, createdByUsername: teacherName,
      createdAt: new Date(), updatedAt: new Date(),
    },
  ];
  const pRes = await db.collection("placements").insertMany(placements);
  console.log(`✅ Inserted ${pRes.insertedCount} placements`);

  // ── 5 Prep Materials ─────────────────────────────────────────────────────
  const prepMaterials = [
    {
      title: "Arrays & Hashing — Complete Guide",
      category: "DSA",
      topic: "Arrays",
      type: "Notes",
      difficulty: "Easy",
      tags: ["arrays", "hashing", "two-pointers"],
      content: `# Arrays & Hashing

## Key Concepts
Arrays are the most fundamental data structure. Hashing gives O(1) lookup time.

## Common Patterns
- **Two Sum** pattern: Use a hashmap to store complement → index
- **Sliding Window**: Maintain a window of fixed or variable size
- **Prefix Sum**: Precompute cumulative sums for range queries

## Template: Two Pointer
\`\`\`python
left, right = 0, len(arr) - 1
while left < right:
    # process arr[left] and arr[right]
    left += 1
    right -= 1
\`\`\`

## Must-Know Problems
1. Two Sum
2. Contains Duplicate
3. Valid Anagram
4. Group Anagrams
5. Top K Frequent Elements
6. Product of Array Except Self

## Time Complexities
| Operation | Array | Hashmap |
|---|---|---|
| Access | O(1) | O(1) |
| Search | O(n) | O(1) |
| Insert | O(n) | O(1) |
| Delete | O(n) | O(1) |`,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
    {
      title: "Binary Search — Patterns & Templates",
      category: "DSA",
      topic: "Binary Search",
      type: "Notes",
      difficulty: "Medium",
      tags: ["binary-search", "divide-and-conquer", "arrays"],
      content: `# Binary Search

## When to Use
- Sorted array / answer space
- Find minimum / maximum satisfying a condition
- Rotated arrays

## Classic Template
\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\`

## Search on Answer Space
\`\`\`python
def solve(lo, hi):
    while lo < hi:
        mid = (lo + hi) // 2
        if condition(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo
\`\`\`

## Must-Know Problems
1. Binary Search
2. Find Minimum in Rotated Sorted Array
3. Search in Rotated Sorted Array
4. Koko Eating Bananas
5. Median of Two Sorted Arrays`,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
    {
      title: "Dynamic Programming — Beginner to Advanced",
      category: "DSA",
      topic: "Dynamic Programming",
      type: "Notes",
      difficulty: "Hard",
      tags: ["dp", "memoization", "tabulation", "optimization"],
      content: `# Dynamic Programming

## Core Idea
Break a problem into overlapping subproblems. Store results to avoid recomputation.

## Steps to Solve any DP Problem
1. Define state: what does dp[i] represent?
2. Base case
3. Transition (recurrence)
4. Answer

## 1D DP — Climbing Stairs
\`\`\`python
def climbStairs(n):
    dp = [0] * (n + 1)
    dp[0] = dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
\`\`\`

## 2D DP — Longest Common Subsequence
\`\`\`python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
\`\`\`

## Classic DP Problems
| Problem | Type |
|---|---|
| Fibonacci | 1D |
| Coin Change | 1D Unbounded Knapsack |
| 0/1 Knapsack | 2D |
| LCS | 2D |
| Edit Distance | 2D |
| Matrix Chain Multiplication | Interval DP |`,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
    {
      title: "System Design Interview — Crack It",
      category: "Interview",
      topic: "System Design",
      type: "Notes",
      difficulty: "Hard",
      tags: ["system-design", "scalability", "databases", "microservices"],
      content: `# System Design Interview Guide

## Framework (RADIO)
- **Requirements** — functional & non-functional
- **API Design** — endpoints & contracts
- **Data Model** — schema, storage choice
- **I**nfrastructure — components, services
- **O**ptimization — caching, CDN, load balancing

## Core Components
### Load Balancer
Distributes traffic. Types: Round-robin, Least connections, IP-hash.

### Caching
- **Redis** for session/rate-limit/leaderboard
- Cache-aside vs Write-through vs Write-behind
- Eviction: LRU, LFU, TTL

### Database Choice
| SQL | NoSQL |
|---|---|
| ACID transactions | High throughput writes |
| Complex joins | Flexible schema |
| Vertical scale | Horizontal scale |

### CDN
Static assets served from edge nodes close to users.

## Classic System Design Problems
1. Design URL Shortener
2. Design Twitter
3. Design Rate Limiter
4. Design Distributed Cache
5. Design Notification System

## Key Numbers to Remember
- 1ms = network round trip (same DC)
- 100ms = cross-continent round trip
- HDD read 10ms, SSD read 0.1ms, RAM read 100ns`,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
    {
      title: "HR Interview — Top 20 Questions & Answers",
      category: "Interview",
      topic: "HR Round",
      type: "Notes",
      difficulty: "Easy",
      tags: ["hr", "behavioral", "soft-skills", "interview"],
      content: `# HR Interview Preparation

## Golden Rule
Use the **STAR** method: **S**ituation · **T**ask · **A**ction · **R**esult

---

## Top 20 Questions

### 1. Tell me about yourself
*Structure: Education → Skills → Projects → Goal*
"I'm a final-year CS student from [college]. I've built [project] using React and Node.js, which taught me full-stack development. I'm passionate about solving algorithmic challenges and I'm looking for a role where I can contribute to real-world products."

### 2. Why do you want to join our company?
Research the company. Mention specific products, values, or initiatives.

### 3. Describe a challenging project
Use STAR. Focus on **your specific contribution**, not the team's.

### 4. Strengths & Weaknesses
- Strength: be specific and back with example
- Weakness: pick real one + show you're working on it

### 5. Where do you see yourself in 5 years?
Show ambition aligned with the role — growth within the company.

### 6. Why should we hire you?
Combine skills + attitude + culture fit.

### 7. Tell me about a conflict with a teammate
Show maturity. Focus on resolution, not blame.

### 8. Salary expectations
Research market rates. Give a range.

---

## Do's & Don'ts
✅ Research the company before the interview  
✅ Prepare 3–5 STAR stories  
✅ Ask thoughtful questions at the end  
❌ Never badmouth previous institution/colleagues  
❌ Don't say "I have no weakness"  
❌ Avoid vague answers — always give examples`,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
  ];
  const mRes = await db.collection("prep_materials").insertMany(prepMaterials);
  console.log(`✅ Inserted ${mRes.insertedCount} prep materials`);

  // ── 5 Problems ───────────────────────────────────────────────────────────
  const problems = [
    {
      title: "Find the Duplicate Number",
      slug: "find-duplicate-number-" + Date.now(),
      difficulty: "Medium",
      tags: ["arrays", "two-pointers", "bit-manipulation"],
      description: `Given an array \`nums\` containing \`n + 1\` integers where each integer is in the range \`[1, n]\` inclusive, there is only **one repeated number**. Return this repeated number without modifying the array and using only O(1) extra space.

**Example 1:**
\`\`\`
Input: nums = [1,3,4,2,2]
Output: 2
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,1,3,4,2]
Output: 3
\`\`\`

**Constraints:**
- \`1 <= n <= 10^5\`
- \`nums.length == n + 1\`
- All integers in nums appear **once** except exactly one integer which appears **two or more times**`,
      examples: [
        { input: "nums = [1,3,4,2,2]", output: "2" },
        { input: "nums = [3,1,3,4,2]", output: "3" },
      ],
      constraints: ["1 <= n <= 10^5", "nums.length == n + 1"],
      hints: ["Try Floyd's cycle detection algorithm", "Treat the array as a linked list where nums[i] is the next pointer"],
      editorial: "Use Floyd's tortoise and hare algorithm treating nums as a linked list. Time O(n), Space O(1).",
      testCases: [
        { input: "[1,3,4,2,2]", expectedOutput: "2", isHidden: false },
        { input: "[3,1,3,4,2]", expectedOutput: "3", isHidden: false },
        { input: "[1,1]", expectedOutput: "1", isHidden: true },
      ],
      category: "Arrays",
      acceptedCount: 0, submissionCount: 0,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
    {
      title: "Maximum Subarray",
      slug: "maximum-subarray-" + Date.now(),
      difficulty: "Medium",
      tags: ["arrays", "dynamic-programming", "divide-and-conquer"],
      description: `Given an integer array \`nums\`, find the **subarray** with the **largest sum** and return its sum (Kadane's Algorithm).

**Example 1:**
\`\`\`
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [1]
Output: 1
\`\`\`

**Constraints:**
- \`1 <= nums.length <= 10^5\`
- \`-10^4 <= nums[i] <= 10^4\``,
      examples: [
        { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6" },
        { input: "nums = [1]", output: "1" },
      ],
      constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
      hints: ["At each index, decide: continue the subarray or start fresh", "Track current sum and global maximum"],
      editorial: "Kadane's Algorithm: maxCurrent = max(nums[i], maxCurrent + nums[i]). Time O(n), Space O(1).",
      testCases: [
        { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6", isHidden: false },
        { input: "[1]", expectedOutput: "1", isHidden: false },
        { input: "[-1]", expectedOutput: "-1", isHidden: true },
        { input: "[5,4,-1,7,8]", expectedOutput: "23", isHidden: true },
      ],
      category: "Dynamic Programming",
      acceptedCount: 0, submissionCount: 0,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
    {
      title: "Balanced Binary Tree",
      slug: "balanced-binary-tree-" + Date.now(),
      difficulty: "Easy",
      tags: ["trees", "dfs", "recursion"],
      description: `Given a binary tree, determine if it is **height-balanced**.

A height-balanced binary tree is a binary tree in which the depth of the two subtrees of every node **never differs by more than one**.

**Example 1:**
\`\`\`
    3
   / \\
  9  20
    /  \\
   15   7
Input: root = [3,9,20,null,null,15,7]
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: root = [1,2,2,3,3,null,null,4,4]
Output: false
\`\`\``,
      examples: [
        { input: "root = [3,9,20,null,null,15,7]", output: "true" },
        { input: "root = [1,2,2,3,3,null,null,4,4]", output: "false" },
      ],
      constraints: ["Number of nodes in tree is in range [0, 5000]", "-10^4 <= Node.val <= 10^4"],
      hints: ["Use a helper that returns the height of a subtree or -1 if it is unbalanced"],
      editorial: "DFS helper returns height or -1. If at any node |left - right| > 1, return -1. Time O(n).",
      testCases: [
        { input: "[3,9,20,null,null,15,7]", expectedOutput: "true", isHidden: false },
        { input: "[1,2,2,3,3,null,null,4,4]", expectedOutput: "false", isHidden: false },
        { input: "[]", expectedOutput: "true", isHidden: true },
      ],
      category: "Trees",
      acceptedCount: 0, submissionCount: 0,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
    {
      title: "Longest Palindromic Substring",
      slug: "longest-palindromic-substring-" + Date.now(),
      difficulty: "Medium",
      tags: ["strings", "dynamic-programming", "two-pointers"],
      description: `Given a string \`s\`, return the **longest palindromic substring** in \`s\`.

**Example 1:**
\`\`\`
Input: s = "babad"
Output: "bab"
Explanation: "aba" is also a valid answer.
\`\`\`

**Example 2:**
\`\`\`
Input: s = "cbbd"
Output: "bb"
\`\`\`

**Constraints:**
- \`1 <= s.length <= 1000\`
- \`s\` consists of only digits and English letters`,
      examples: [
        { input: 's = "babad"', output: '"bab"' },
        { input: 's = "cbbd"', output: '"bb"' },
      ],
      constraints: ["1 <= s.length <= 1000"],
      hints: ["Expand Around Center: for each char, expand outward while s[l] == s[r]", "Handle odd-length and even-length palindromes separately"],
      editorial: "Expand Around Center — O(n^2) time, O(1) space. For each index, expand for odd and even length palindromes.",
      testCases: [
        { input: '"babad"', expectedOutput: '"bab"', isHidden: false },
        { input: '"cbbd"', expectedOutput: '"bb"', isHidden: false },
        { input: '"a"', expectedOutput: '"a"', isHidden: true },
        { input: '"racecar"', expectedOutput: '"racecar"', isHidden: true },
      ],
      category: "Strings",
      acceptedCount: 0, submissionCount: 0,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
    {
      title: "Number of Islands",
      slug: "number-of-islands-" + Date.now(),
      difficulty: "Medium",
      tags: ["graphs", "bfs", "dfs", "matrix"],
      description: `Given an \`m x n\` 2D binary grid which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the **number of islands**.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

**Example 1:**
\`\`\`
Input: grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
Output: 1
\`\`\`

**Example 2:**
\`\`\`
Input: grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
Output: 3
\`\`\``,
      examples: [
        { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: "1" },
        { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: "3" },
      ],
      constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300"],
      hints: ["Use DFS/BFS to sink each island as you count it", "Mark visited land as '0' to avoid revisiting"],
      editorial: "DFS from each unvisited '1', mark all connected land as visited. Count DFS calls. Time O(m*n).",
      testCases: [
        { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: "1", isHidden: false },
        { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: "3", isHidden: false },
        { input: '[["1"],["1"]]', expectedOutput: "1", isHidden: true },
      ],
      category: "Graphs",
      acceptedCount: 0, submissionCount: 0,
      createdBy: teacherId, createdByUsername: teacherName, createdAt: new Date(),
    },
  ];
  const prRes = await db.collection("problems").insertMany(problems);
  console.log(`✅ Inserted ${prRes.insertedCount} problems`);

  console.log("\n🎉 All done! Summary:");
  console.log(`   Teacher : ${teacher.email}`);
  console.log(`   Contests: ${cRes.insertedCount}`);
  console.log(`   Jobs    : ${pRes.insertedCount}`);
  console.log(`   Prep    : ${mRes.insertedCount}`);
  console.log(`   Problems: ${prRes.insertedCount}`);

  await client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
