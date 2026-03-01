/**
 * Seed script: adds rich activity, submissions, achievements & streak
 * for the user dhirendra.huddda23@lpu.in
 */
import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

// Load .env.local
function loadEnv() {
  try {
    const txt = fs.readFileSync(path.join(projectRoot, ".env.local"), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1]] = m[2];
    }
  } catch {}
}
loadEnv();

const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/codearena";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 8) + 10, Math.floor(Math.random() * 59), 0, 0);
  return d;
}

async function main() {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db("codearena");
  console.log("✅ Connected to MongoDB");

  // ── 1. Find the user ──────────────────────────────────────────
  const user = await db.collection("users").findOne({ email: "dhirendra.hudda23@lpu.in" });
  if (!user) {
    console.error("❌  User dhirendra.hudda23@lpu.in not found. Make sure they are registered first.");
    await client.close();
    process.exit(1);
  }
  const userId   = user._id.toString();
  const username = user.username || "dhirendra";
  console.log(`👤 Found user: ${username} (${userId})`);

  // ── 2. Pull problems from DB ──────────────────────────────────
  const allProblems = await db.collection("problems").find({}).limit(200).toArray();
  if (allProblems.length < 10) {
    console.error("❌  Not enough problems in DB (need at least 10). Run seed.mjs first.");
    await client.close();
    process.exit(1);
  }

  const easy   = allProblems.filter(p => p.difficulty?.toLowerCase() === "easy");
  const medium = allProblems.filter(p => p.difficulty?.toLowerCase() === "medium");
  const hard   = allProblems.filter(p => p.difficulty?.toLowerCase() === "hard");

  // Pick problems to solve
  const toSolve = [
    ...easy.slice(0, 18),
    ...medium.slice(0, 22),
    ...hard.slice(0, 8),
  ];

  console.log(`📚 Will add ${toSolve.length} solved problems across 30 days…`);

  // ── 3. Remove existing submissions for this user (clean slate) ─
  const deleted = await db.collection("submissions").deleteMany({ userId });
  console.log(`🗑️  Removed ${deleted.deletedCount} old submissions`);

  // ── 4. Build submission documents ────────────────────────────
  const POINTS = { easy: 10, medium: 20, hard: 30 };
  // Spread solves across last 30 days (some days have 2-3 solves)
  const daySlots = [
    0,0,1,1,2,3,4,4,5,6,
    7,7,8,9,10,11,11,12,13,14,
    15,16,16,17,18,19,19,20,21,22,
    23,24,25,26,27,28,29,
    0,1,3,5,7,9,11,13,15,17,
  ].slice(0, toSolve.length);

  const submissionDocs = [];
  let totalScore = 0;
  let easyCount = 0, mediumCount = 0, hardCount = 0;

  for (let i = 0; i < toSolve.length; i++) {
    const prob = toSolve[i];
    const diff = (prob.difficulty || "medium").toLowerCase();
    const pts  = POINTS[diff] || 10;
    const day  = daySlots[i] ?? Math.floor(Math.random() * 30);

    totalScore += pts;
    if (diff === "easy")   easyCount++;
    else if (diff === "medium") mediumCount++;
    else if (diff === "hard")   hardCount++;

    // Add one accepted submission
    submissionDocs.push({
      problemId:   prob._id,
      problemSlug: prob.slug,
      problemTitle: prob.title,
      difficulty:  prob.difficulty,
      code: `// Solution for ${prob.title}\nfunction solution() {\n  // Optimized approach\n  return true;\n}\nconsole.log(solution());`,
      language:    "javascript",
      verdict:     "Accepted",
      passed:      prob.testCases?.length || 3,
      total:       prob.testCases?.length || 3,
      userId,
      username,
      createdAt:   daysAgo(day),
    });

    // Some problems also have a wrong attempt before the accepted one
    if (Math.random() > 0.55) {
      submissionDocs.push({
        problemId:   prob._id,
        problemSlug: prob.slug,
        problemTitle: prob.title,
        difficulty:  prob.difficulty,
        code: `// Wrong attempt\nfunction solution() { return null; }`,
        language:    "javascript",
        verdict:     "Wrong Answer",
        passed:      0,
        total:       prob.testCases?.length || 3,
        userId,
        username,
        createdAt:   new Date(daysAgo(day).getTime() - 1000 * 60 * 15), // 15 min before
      });
    }
  }

  // Sort by date so streak logic is consistent
  submissionDocs.sort((a, b) => a.createdAt - b.createdAt);

  await db.collection("submissions").insertMany(submissionDocs);
  console.log(`✅ Inserted ${submissionDocs.length} submissions`);

  // ── 5. Update problem acceptance counts ──────────────────────
  for (const prob of toSolve) {
    await db.collection("problems").updateOne(
      { _id: prob._id },
      { $inc: { totalSubmissions: 2, totalAccepted: 1 } }
    );
  }

  // ── 6. Compute streak (check which days have at least one accepted sub) ──
  const acceptedDocs = submissionDocs.filter(s => s.verdict === "Accepted");
  const daySet = new Set();
  for (const s of acceptedDocs) {
    const d = s.createdAt;
    daySet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  // Find max consecutive streak ending today
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (daySet.has(key)) streak++;
    else if (i > 0) break; // streak broken
  }

  // Max streak
  let maxStreak = 0, cur = 0;
  const sortedDays = [...daySet].sort();
  for (let i = 0; i < sortedDays.length; i++) {
    cur++;
    maxStreak = Math.max(maxStreak, cur);
  }

  const totalSubmissionsCount = submissionDocs.length;
  const acceptedCount = acceptedDocs.length;
  const lastSub = submissionDocs[submissionDocs.length - 1].createdAt;

  // ── 7. Add bookmarks for some problems ───────────────────────
  const bookmarkSlugs = toSolve.slice(0, 8).map(p => p.slug);
  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { bookmarks: bookmarkSlugs } }
  );

  // ── 8. Update user stats ──────────────────────────────────────
  const statsUpdate = {
    $set: {
      lastActive: new Date(),
      "stats.solved":              toSolve.length,
      "stats.easy":                easyCount,
      "stats.medium":              mediumCount,
      "stats.hard":                hardCount,
      "stats.score":               totalScore,
      "stats.totalSubmissions":    totalSubmissionsCount,
      "stats.acceptedSubmissions": acceptedCount,
      "stats.streak":              streak,
      "stats.maxStreak":           maxStreak,
      "stats.lastSubmissionDate":  lastSub,
      // Category breakdown (based on problem tags/categories)
      "stats.categoryBreakdown": {
        Arrays:           Math.floor(toSolve.length * 0.25),
        "Dynamic Programming": Math.floor(toSolve.length * 0.18),
        "Graphs":         Math.floor(toSolve.length * 0.12),
        "Trees":          Math.floor(toSolve.length * 0.15),
        "Strings":        Math.floor(toSolve.length * 0.14),
        "Sorting":        Math.floor(toSolve.length * 0.10),
        "Recursion":      Math.floor(toSolve.length * 0.06),
      },
    },
  };
  await db.collection("users").updateOne({ _id: user._id }, statsUpdate);
  console.log(`✅ Updated user stats`);

  // ── 9. Summary ────────────────────────────────────────────────
  console.log("\n🎉 Done! Account is now loaded with:");
  console.log(`   • ${toSolve.length} solved problems  (${easyCount} easy, ${mediumCount} medium, ${hardCount} hard)`);
  console.log(`   • ${totalSubmissionsCount} total submissions (${acceptedCount} accepted)`);
  console.log(`   • ${totalScore} total points / score`);
  console.log(`   • ${streak}-day current streak  (max: ${maxStreak})`);
  console.log(`   • ${bookmarkSlugs.length} bookmarked problems`);
  console.log(`   • Activity spread across last 30 days`);

  await client.close();
}

main().catch(e => { console.error(e); process.exit(1); });
