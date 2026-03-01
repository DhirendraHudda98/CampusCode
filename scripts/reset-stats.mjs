/**
 * Reset script: sets realistic, modest stats for all real users.
 * Dhiru: 10 solved, 3-day streak. Others: varied but believable.
 */
import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  try {
    const txt = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1]] = m[2];
    }
  } catch {}
}
loadEnv();

const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/codearena";
const POINTS = { easy: 10, medium: 20, hard: 30 };

function daysAgo(n, hourOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + hourOffset, Math.floor(Math.random() * 59), 0, 0);
  return d;
}

// Real users and their target stats (solved, easy, medium, hard, streak, maxStreak)
const USER_TARGETS = [
  {
    email: "dhirendra.hudda23@lpu.in",
    solved: 10, easy: 6, medium: 3, hard: 1,
    streak: 3, maxStreak: 5,
    // last 3 days have activity, plus some scattered older ones
    activeDaysAgo: [0, 1, 2, 6, 9, 12, 18, 25],
  },
  {
    email: "kirtiahirwar608@gmail.com",
    solved: 7, easy: 5, medium: 2, hard: 0,
    streak: 2, maxStreak: 4,
    activeDaysAgo: [0, 1, 5, 10, 15, 22],
  },
  {
    email: "vivekdon@gmail.com",
    solved: 14, easy: 8, medium: 4, hard: 2,
    streak: 3, maxStreak: 7,
    activeDaysAgo: [0, 1, 2, 5, 8, 11, 15, 20, 25, 30],
  },
  {
    email: "dhirendrahudda@gmail.com",
    solved: 5, easy: 4, medium: 1, hard: 0,
    streak: 1, maxStreak: 3,
    activeDaysAgo: [0, 4, 10, 18],
  },
  {
    email: "vivek@gmail.com",
    solved: 9, easy: 6, medium: 2, hard: 1,
    streak: 2, maxStreak: 4,
    activeDaysAgo: [0, 1, 6, 12, 19, 26],
  },
];

async function main() {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db("codearena");
  console.log("✅ Connected to MongoDB\n");

  const allProblems = await db.collection("problems").find({}).limit(200).toArray();
  if (allProblems.length < 15) {
    console.error("❌ Not enough problems in DB.");
    await client.close(); process.exit(1);
  }
  const easy   = allProblems.filter(p => p.difficulty?.toLowerCase() === "easy");
  const medium = allProblems.filter(p => p.difficulty?.toLowerCase() === "medium");
  const hard   = allProblems.filter(p => p.difficulty?.toLowerCase() === "hard");

  for (const target of USER_TARGETS) {
    const user = await db.collection("users").findOne({ email: target.email });
    if (!user) { console.warn(`⚠️  Not found: ${target.email}`); continue; }

    const userId   = user._id.toString();
    const username = user.username;

    // Clear old submissions
    const del = await db.collection("submissions").deleteMany({ userId });

    // Pick the exact problems to solve
    const toSolve = [
      ...easy.slice(0, target.easy),
      ...medium.slice(0, target.medium),
      ...hard.slice(0, target.hard),
    ].slice(0, target.solved);

    // Build submissions — one accepted per problem spread across activeDaysAgo
    const docs = [];
    let score = 0;

    for (let i = 0; i < toSolve.length; i++) {
      const prob = toSolve[i];
      const diff = (prob.difficulty || "medium").toLowerCase();
      score += POINTS[diff] || 10;
      const dayAgo = target.activeDaysAgo[i % target.activeDaysAgo.length];

      // Wrong attempt first (for ~40% of problems)
      if (Math.random() > 0.6) {
        docs.push({
          problemId: prob._id, problemSlug: prob.slug, problemTitle: prob.title,
          difficulty: prob.difficulty,
          code: `// Attempt 1\nfunction solve() { return null; }`,
          language: "javascript", verdict: "Wrong Answer",
          passed: 0, total: prob.testCases?.length || 3,
          userId, username, createdAt: new Date(daysAgo(dayAgo, 0).getTime() - 30 * 60 * 1000),
        });
      }

      docs.push({
        problemId: prob._id, problemSlug: prob.slug, problemTitle: prob.title,
        difficulty: prob.difficulty,
        code: `// Accepted solution for ${prob.title}\nfunction solve() { return true; }`,
        language: "javascript", verdict: "Accepted",
        passed: prob.testCases?.length || 3, total: prob.testCases?.length || 3,
        userId, username, createdAt: daysAgo(dayAgo, i % 5),
      });
    }

    docs.sort((a, b) => a.createdAt - b.createdAt);
    if (docs.length) await db.collection("submissions").insertMany(docs);

    const totalSubs   = docs.length;
    const acceptedSubs = docs.filter(d => d.verdict === "Accepted").length;
    const lastSub     = docs.at(-1)?.createdAt || new Date();

    // Update user stats
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          lastActive: new Date(),
          bookmarks: toSolve.slice(0, 3).map(p => p.slug),
          "stats.solved":              target.solved,
          "stats.easy":                target.easy,
          "stats.medium":              target.medium,
          "stats.hard":                target.hard,
          "stats.score":               score,
          "stats.totalSubmissions":    totalSubs,
          "stats.acceptedSubmissions": acceptedSubs,
          "stats.streak":              target.streak,
          "stats.maxStreak":           target.maxStreak,
          "stats.lastSubmissionDate":  lastSub,
        },
      }
    );

    console.log(`✅ ${username.padEnd(14)} | solved=${target.solved} (${target.easy}E ${target.medium}M ${target.hard}H) | streak=${target.streak} | score=${score} | subs=${totalSubs}`);
  }

  console.log("\n🎉 All real users updated with realistic modest stats.");
  await client.close();
}

main().catch(e => { console.error(e); process.exit(1); });
