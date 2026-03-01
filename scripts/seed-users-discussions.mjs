import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGO_URI = "mongodb://127.0.0.1:27017/codearena";

function hash(pw) {
  return bcrypt.hashSync(pw, 12);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────
const students = [
  {
    username: "arjun_sharma",
    email: "arjun.sharma@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(120),
    lastActive: daysAgo(1),
    stats: { score: 1450, solved: 62, streak: 14, easy: 30, medium: 24, hard: 8, totalSubmissions: 120, acceptedSubmissions: 95 },
  },
  {
    username: "priya_patel",
    email: "priya.patel@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(100),
    lastActive: daysAgo(0),
    stats: { score: 1280, solved: 54, streak: 21, easy: 28, medium: 20, hard: 6, totalSubmissions: 98, acceptedSubmissions: 78 },
  },
  {
    username: "rahul_verma",
    email: "rahul.verma@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(90),
    lastActive: daysAgo(2),
    stats: { score: 980, solved: 41, streak: 7, easy: 22, medium: 16, hard: 3, totalSubmissions: 75, acceptedSubmissions: 56 },
  },
  {
    username: "sneha_iyer",
    email: "sneha.iyer@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(80),
    lastActive: daysAgo(1),
    stats: { score: 860, solved: 35, streak: 5, easy: 20, medium: 12, hard: 3, totalSubmissions: 60, acceptedSubmissions: 44 },
  },
  {
    username: "karan_mehta",
    email: "karan.mehta@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(70),
    lastActive: daysAgo(3),
    stats: { score: 720, solved: 28, streak: 3, easy: 18, medium: 9, hard: 1, totalSubmissions: 50, acceptedSubmissions: 35 },
  },
  {
    username: "divya_nair",
    email: "divya.nair@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(65),
    lastActive: daysAgo(1),
    stats: { score: 640, solved: 24, streak: 10, easy: 15, medium: 8, hard: 1, totalSubmissions: 42, acceptedSubmissions: 30 },
  },
  {
    username: "amit_joshi",
    email: "amit.joshi@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(55),
    lastActive: daysAgo(0),
    stats: { score: 560, solved: 20, streak: 8, easy: 14, medium: 6, hard: 0, totalSubmissions: 35, acceptedSubmissions: 24 },
  },
  {
    username: "pooja_gupta",
    email: "pooja.gupta@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(50),
    lastActive: daysAgo(4),
    stats: { score: 420, solved: 16, streak: 2, easy: 12, medium: 4, hard: 0, totalSubmissions: 28, acceptedSubmissions: 18 },
  },
  {
    username: "vikram_das",
    email: "vikram.das@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(40),
    lastActive: daysAgo(2),
    stats: { score: 300, solved: 11, streak: 1, easy: 9, medium: 2, hard: 0, totalSubmissions: 20, acceptedSubmissions: 13 },
  },
  {
    username: "ananya_krishna",
    email: "ananya.krishna@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(30),
    lastActive: daysAgo(1),
    stats: { score: 180, solved: 7, streak: 4, easy: 6, medium: 1, hard: 0, totalSubmissions: 12, acceptedSubmissions: 8 },
  },
  {
    username: "rohit_singh",
    email: "rohit.singh@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(25),
    lastActive: daysAgo(0),
    stats: { score: 100, solved: 4, streak: 2, easy: 4, medium: 0, hard: 0, totalSubmissions: 7, acceptedSubmissions: 4 },
  },
  {
    username: "meera_bose",
    email: "meera.bose@student.com",
    passwordHash: hash("password123"),
    role: "student",
    createdAt: daysAgo(15),
    lastActive: daysAgo(0),
    stats: { score: 50, solved: 2, streak: 1, easy: 2, medium: 0, hard: 0, totalSubmissions: 4, acceptedSubmissions: 2 },
  },
];

// ─── TEACHERS ────────────────────────────────────────────────────────────────
const teachers = [
  {
    username: "prof_ramesh",
    email: "ramesh.kumar@college.edu",
    passwordHash: hash("teacher123"),
    role: "teacher",
    createdAt: daysAgo(200),
    lastActive: daysAgo(1),
    stats: { score: 0, solved: 0, streak: 0, easy: 0, medium: 0, hard: 0, totalSubmissions: 0, acceptedSubmissions: 0 },
    profile: { department: "Computer Science", designation: "Associate Professor", expertise: ["Data Structures", "Algorithms", "Database Systems"] },
  },
  {
    username: "dr_sunita",
    email: "sunita.rao@college.edu",
    passwordHash: hash("teacher123"),
    role: "teacher",
    createdAt: daysAgo(180),
    lastActive: daysAgo(2),
    stats: { score: 0, solved: 0, streak: 0, easy: 0, medium: 0, hard: 0, totalSubmissions: 0, acceptedSubmissions: 0 },
    profile: { department: "Information Technology", designation: "Professor", expertise: ["Machine Learning", "Python", "Web Development"] },
  },
  {
    username: "prof_krishnan",
    email: "krishnan.v@college.edu",
    passwordHash: hash("teacher123"),
    role: "teacher",
    createdAt: daysAgo(160),
    lastActive: daysAgo(0),
    stats: { score: 0, solved: 0, streak: 0, easy: 0, medium: 0, hard: 0, totalSubmissions: 0, acceptedSubmissions: 0 },
    profile: { department: "Computer Science", designation: "Assistant Professor", expertise: ["Competitive Programming", "Graph Theory", "Dynamic Programming"] },
  },
  {
    username: "ms_anjali",
    email: "anjali.sharma@college.edu",
    passwordHash: hash("teacher123"),
    role: "teacher",
    createdAt: daysAgo(140),
    lastActive: daysAgo(1),
    stats: { score: 0, solved: 0, streak: 0, easy: 0, medium: 0, hard: 0, totalSubmissions: 0, acceptedSubmissions: 0 },
    profile: { department: "Information Technology", designation: "Lecturer", expertise: ["JavaScript", "React", "Node.js", "System Design"] },
  },
];

// ─── DISCUSSIONS ──────────────────────────────────────────────────────────────
const discussions = [
  {
    title: "How to approach Dynamic Programming problems?",
    content: "I've been struggling with DP problems for a while. Every time I see one I get confused about where to start. Should I think about it recursively first? Or directly go bottom-up? Any tips from people who've cracked this topic would be really helpful!",
    author: "arjun_sharma",
    likes: 18,
    likedBy: ["priya_patel", "rahul_verma", "sneha_iyer", "karan_mehta", "amit_joshi"],
    createdAt: daysAgo(30),
    replies: [
      {
        content: "Start with recursion + memoization (top-down). Once you understand the recurrence relation, converting to bottom-up is mechanical. The key insight is: what decisions do I make at each step, and what state do I need to remember?",
        author: "prof_krishnan",
        createdAt: daysAgo(29),
      },
      {
        content: "I second that! I always draw the recursion tree first. It makes visualizing the overlapping subproblems much easier. Then I just cache the results.",
        author: "priya_patel",
        createdAt: daysAgo(28),
      },
      {
        content: "One more tip: identify the state variables carefully. Usually it's the changing parameters in your recursive function. Start with small examples and build up.",
        author: "dr_sunita",
        createdAt: daysAgo(27),
      },
    ],
  },
  {
    title: "Best resources for System Design preparation?",
    content: "I have campus placements coming up in 3 months and I've been told system design is a major part of the interview. I have decent DSA skills but no idea where to start with system design. Books? YouTube? Any structured roadmap?",
    author: "sneha_iyer",
    likes: 24,
    likedBy: ["arjun_sharma", "karan_mehta", "divya_nair", "rohit_singh", "pooja_gupta", "vikram_das"],
    createdAt: daysAgo(25),
    replies: [
      {
        content: "Start with 'Designing Data-Intensive Applications' by Martin Kleppmann — it's the bible for this. Also check out the System Design Primer on GitHub (Donnemartin). For videos, Gaurav Sen on YouTube is excellent.",
        author: "ms_anjali",
        createdAt: daysAgo(24),
      },
      {
        content: "For placements specifically, focus on: Load Balancers, Caching (Redis), Databases (SQL vs NoSQL), Message Queues, and API Design. These come up in almost every interview.",
        author: "prof_ramesh",
        createdAt: daysAgo(23),
      },
      {
        content: "Also practice drawing architecture diagrams. Being able to explain your design clearly is just as important as the design itself!",
        author: "arjun_sharma",
        createdAt: daysAgo(22),
      },
      {
        content: "ByteByteGo newsletter and Alex Xu's System Design Interview book are also great for structured preparation.",
        author: "priya_patel",
        createdAt: daysAgo(21),
      },
    ],
  },
  {
    title: "Two Sum vs Three Sum — understanding the pattern",
    content: "I solved Two Sum easily using a hashmap. But Three Sum is confusing me — I tried the same approach but it's not working well. Is there a general pattern to these 'K-Sum' problems?",
    author: "rahul_verma",
    likes: 15,
    likedBy: ["ananya_krishna", "amit_joshi", "divya_nair", "meera_bose"],
    createdAt: daysAgo(20),
    replies: [
      {
        content: "Great question! Two Sum uses O(n) hashmap. Three Sum uses sort + two pointers — O(n²). The trick: fix one element, then reduce it to Two Sum on the remaining array. For K-Sum, you recursively reduce to Two Sum.",
        author: "prof_krishnan",
        createdAt: daysAgo(19),
      },
      {
        content: "Sort the array first for Three Sum — that's the key step most people miss. Sorting lets you use two pointers and also makes duplicate handling easy.",
        author: "arjun_sharma",
        createdAt: daysAgo(18),
      },
    ],
  },
  {
    title: "Graph traversal: BFS vs DFS — when to use which?",
    content: "I know both BFS (queue) and DFS (stack/recursion), but I never know which one to pick for a problem. Any rule of thumb?",
    author: "karan_mehta",
    likes: 20,
    likedBy: ["arjun_sharma", "priya_patel", "sneha_iyer", "rohit_singh", "vikram_das"],
    createdAt: daysAgo(18),
    replies: [
      {
        content: "Simple rule: BFS for shortest path, level order, or finding MINIMUM steps. DFS for exploring all paths, cycle detection, or topological sort. BFS guarantees shortest path in unweighted graphs.",
        author: "prof_ramesh",
        createdAt: daysAgo(17),
      },
      {
        content: "Also: DFS uses less memory when the tree/graph is wide. BFS uses less memory when the tree is deep. Stack overflow is a risk with deep recursion + DFS.",
        author: "ms_anjali",
        createdAt: daysAgo(16),
      },
      {
        content: "Excellent answers above. I'd add: for island counting or connected components problems, both work — pick DFS since it's simpler to code recursively.",
        author: "priya_patel",
        createdAt: daysAgo(15),
      },
    ],
  },
  {
    title: "Tips for avoiding Time Limit Exceeded (TLE)?",
    content: "I keep getting TLE on problems even when my logic is correct. How do I know if my solution will be fast enough before submitting?",
    author: "divya_nair",
    likes: 31,
    likedBy: ["arjun_sharma", "priya_patel", "rahul_verma", "sneha_iyer", "karan_mehta", "amit_joshi", "rohit_singh"],
    createdAt: daysAgo(15),
    replies: [
      {
        content: "Rule of thumb: if n ≤ 10^8, you need O(n) or O(n log n). If n ≤ 10^6, O(n log n) is fine. If n ≤ 10^4, O(n²) works. If n ≤ 500, O(n³) might work. Always estimate before coding.",
        author: "prof_krishnan",
        createdAt: daysAgo(14),
      },
      {
        content: "Avoid nested loops when possible. Look for hashmap replacements for inner loops. Precompute prefix sums for range queries instead of recomputing every time.",
        author: "arjun_sharma",
        createdAt: daysAgo(13),
      },
      {
        content: "Also avoid JavaScript's built-in sort inside loops — it's O(n log n) each call. Sort once outside the loop.",
        author: "ms_anjali",
        createdAt: daysAgo(13),
      },
    ],
  },
  {
    title: "How to stay consistent with DSA practice?",
    content: "I start strong every semester but then lose motivation after 2-3 weeks. How do you all stay consistent? Any strategies or routines that work?",
    author: "amit_joshi",
    likes: 42,
    likedBy: ["priya_patel", "sneha_iyer", "divya_nair", "pooja_gupta", "ananya_krishna", "meera_bose", "rohit_singh", "vikram_das"],
    createdAt: daysAgo(12),
    replies: [
      {
        content: "Set a minimum — even 1 problem a day. Don't aim for 5 problems when you're busy. Streaks build habits. This platform shows streaks so use that motivation!",
        author: "dr_sunita",
        createdAt: daysAgo(11),
      },
      {
        content: "Study with a friend or form a study group. Having accountability partners makes a huge difference. We have a WhatsApp group where we share our daily solve.",
        author: "arjun_sharma",
        createdAt: daysAgo(10),
      },
      {
        content: "Track which topics you're weak at and do focused practice. Random problem solving is less effective than targeted practice on weak areas.",
        author: "prof_ramesh",
        createdAt: daysAgo(10),
      },
      {
        content: "Also celebrate small wins. Solved a hard problem? That's worth acknowledging. Progress motivation > fear motivation.",
        author: "priya_patel",
        createdAt: daysAgo(9),
      },
    ],
  },
  {
    title: "Understanding Big-O notation practically",
    content: "I understand Big-O theoretically but when I look at code I can't immediately tell its complexity. Any tricks to spot it quickly?",
    author: "pooja_gupta",
    likes: 19,
    likedBy: ["ananya_krishna", "vikram_das", "meera_bose", "rohit_singh"],
    createdAt: daysAgo(10),
    replies: [
      {
        content: "Count the number of loops and how they nest. One loop = O(n). Two nested loops = O(n²). Halving the input each time (like binary search) = O(log n). Recursion that branches = O(2^n) or O(n!) typically.",
        author: "prof_ramesh",
        createdAt: daysAgo(9),
      },
      {
        content: "For space complexity: count extra data structures. An array of size n = O(n). Recursion depth = O(depth). Constant variables regardless of input = O(1).",
        author: "ms_anjali",
        createdAt: daysAgo(8),
      },
    ],
  },
  {
    title: "Sliding Window technique — complete guide needed!",
    content: "I've seen 'use sliding window' in editorial hints but I don't fully understand the mechanics. When to expand? When to shrink? How to track the window?",
    author: "ananya_krishna",
    likes: 27,
    likedBy: ["arjun_sharma", "priya_patel", "sneha_iyer", "rahul_verma", "divya_nair", "amit_joshi"],
    createdAt: daysAgo(8),
    replies: [
      {
        content: "Sliding window has two types: Fixed size (e.g., max sum of k elements) and Variable size (e.g., longest substring without repeating chars). Fixed: just move both pointers together. Variable: expand right until invalid, shrink left until valid again.",
        author: "prof_krishnan",
        createdAt: daysAgo(7),
      },
      {
        content: "The pattern: right pointer always moves forward. Left pointer only moves when the window is invalid. Use a hashmap or frequency array to track window contents. Works great for substring/subarray problems.",
        author: "arjun_sharma",
        createdAt: daysAgo(7),
      },
      {
        content: "Good practice problems: Longest Substring Without Repeating Characters, Minimum Window Substring, Permutation in String. Start with those!",
        author: "dr_sunita",
        createdAt: daysAgo(6),
      },
    ],
  },
  {
    title: "Recursion vs Iteration — which to choose?",
    content: "Sometimes recursion makes code cleaner but it can cause stack overflow. When should I use recursion and when should I stick to iteration?",
    author: "vikram_das",
    likes: 13,
    likedBy: ["meera_bose", "rohit_singh", "pooja_gupta"],
    createdAt: daysAgo(6),
    replies: [
      {
        content: "Use recursion when the problem is naturally recursive (trees, graphs, divide & conquer). Convert to iteration when: depth > 10,000, or you need to optimize memory, or you're implementing in a system without call stack guarantees.",
        author: "prof_ramesh",
        createdAt: daysAgo(5),
      },
      {
        content: "Tail recursion can sometimes be optimized by compilers, but JavaScript doesn't guarantee TCO. When in doubt for large inputs, use an explicit stack with iteration.",
        author: "ms_anjali",
        createdAt: daysAgo(4),
      },
    ],
  },
  {
    title: "Mock interview tips — how to handle pressure?",
    content: "I know the concepts but freeze up in mock interviews. My mind goes blank even on problems I've solved before. How do you all manage interview anxiety?",
    author: "meera_bose",
    likes: 35,
    likedBy: ["arjun_sharma", "priya_patel", "rahul_verma", "sneha_iyer", "karan_mehta", "divya_nair", "amit_joshi", "pooja_gupta"],
    createdAt: daysAgo(4),
    replies: [
      {
        content: "Think out loud! Interviewers want to see your thought process, not just the final solution. When you're stuck, narrate what you're thinking. It shows communication skills and the interviewer may give hints.",
        author: "dr_sunita",
        createdAt: daysAgo(3),
      },
      {
        content: "Always clarify the problem first. Ask about edge cases and constraints. This buys you time to think and shows thoroughness. Never jump straight to coding.",
        author: "prof_krishnan",
        createdAt: daysAgo(3),
      },
      {
        content: "Do peer mock interviews — platforms like Pramp (free). The more you simulate the environment, the more comfortable you get. Pressure resistance is a skill you can build.",
        author: "arjun_sharma",
        createdAt: daysAgo(2),
      },
      {
        content: "Start with a brute force solution first, mention the complexity, then optimize. Interviewers appreciate iterative improvement over trying to jump to the perfect solution.",
        author: "priya_patel",
        createdAt: daysAgo(2),
      },
    ],
  },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db("codearena");

    // ── Insert Students ──
    let studentsAdded = 0;
    for (const s of students) {
      const exists = await db.collection("users").findOne({ email: s.email });
      if (!exists) {
        await db.collection("users").insertOne(s);
        studentsAdded++;
        console.log(`✅ Student: ${s.username}`);
      } else {
        console.log(`⚠️  Skipped (exists): ${s.username}`);
      }
    }

    // ── Insert Teachers ──
    let teachersAdded = 0;
    for (const t of teachers) {
      const exists = await db.collection("users").findOne({ email: t.email });
      if (!exists) {
        await db.collection("users").insertOne(t);
        teachersAdded++;
        console.log(`✅ Teacher: ${t.username}`);
      } else {
        console.log(`⚠️  Skipped (exists): ${t.username}`);
      }
    }

    // ── Insert Discussions ──
    let discussionsAdded = 0;
    for (const d of discussions) {
      const exists = await db.collection("discussions").findOne({ title: d.title });
      if (!exists) {
        await db.collection("discussions").insertOne(d);
        discussionsAdded++;
        console.log(`✅ Discussion: "${d.title.slice(0, 50)}..."`);
      } else {
        console.log(`⚠️  Skipped (exists): "${d.title.slice(0, 40)}..."`);
      }
    }

    console.log("\n─────────────────────────────────");
    console.log(`📊 Summary:`);
    console.log(`   👨‍🎓 Students added : ${studentsAdded}/${students.length}`);
    console.log(`   👨‍🏫 Teachers added : ${teachersAdded}/${teachers.length}`);
    console.log(`   💬 Discussions added: ${discussionsAdded}/${discussions.length}`);
    console.log("─────────────────────────────────");
    console.log("\n🔑 Login credentials:");
    console.log("   Students  → password: password123");
    console.log("   Teachers  → password: teacher123");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
