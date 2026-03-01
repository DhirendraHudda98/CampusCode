import express from "express";
import { getDb } from "../mongodb.js";
import { exec } from "child_process";
import { ObjectId } from "mongodb";

const router = express.Router();

function runCode(code, timeoutMs = 5000) {
  return new Promise(async (resolve) => {
    const fs   = await import("fs/promises");
    const os   = await import("os");
    const path = await import("path");
    const fname = path.join(os.tmpdir(), `ca-sub-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
    try {
      await fs.writeFile(fname, code, "utf8");
      exec(`node "${fname}"`, { timeout: timeoutMs }, (err, stdout, stderr) => {
        fs.unlink(fname).catch(() => {});
        if (err) resolve({ stdout: "", error: stderr || err.message });
        else resolve({ stdout: stdout.trim(), error: stderr ? stderr.trim() : null });
      });
    } catch (e) {
      resolve({ stdout: "", error: e.message });
    }
  });
}

// Score by difficulty
const POINTS = { easy: 10, medium: 20, hard: 30 };

// POST /api/submissions — submit code, run all test cases, save result + update user stats
router.post("/", async (req, res) => {
  const { problemSlug, problemId, code, language = "javascript" } = req.body;
  if (!code) return res.status(400).json({ error: "Code required" });
  if (req.user && req.user.role !== "student") return res.status(403).json({ error: "Only students can submit solutions" });
  if (!problemSlug && !problemId) return res.status(400).json({ error: "Problem required" });

  try {
    const db = await getDb();

    // Fetch problem and its test cases
    let problem;
    if (problemSlug) {
      problem = await db.collection("problems").findOne({ slug: problemSlug });
    } else {
      problem = await db.collection("problems").findOne({ _id: new ObjectId(problemId) });
    }
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const testCases = problem.testCases || [];
    if (!testCases.length) {
      // No test cases — save as pending, do not award points
      await db.collection("submissions").insertOne({
        problemId: problem._id, problemSlug: problem.slug, code, language,
        verdict: "No Test Cases", passed: 0, total: 0,
        userId: req.user?.userId || null, username: req.user?.username || null,
        createdAt: new Date(),
      });
      return res.json({ success: true, verdict: "No Test Cases", passed: 0, total: 0, results: [],
        message: "This problem has no test cases configured yet. Your code was saved." });
    }

    // Find function name and parameter count from user code
    const fnMatch = code.match(/^\s*(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/m)
                  || code.match(/^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/m)
                  || code.match(/^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(\w+)\s*=>/m);
    const fnName   = fnMatch?.[1];
    const fnParams = fnMatch?.[2] ? fnMatch[2].split(',').map(p => p.trim()).filter(Boolean) : [];
    const multiArg = fnParams.length > 1;

    const results = [];
    let passed = 0;

    for (const tc of testCases) {
      const callExpr = multiArg ? `${fnName}(...__args)` : `${fnName}(__args)`;
      const harness = fnName
        ? `${code}\nconst __args = JSON.parse(${JSON.stringify(tc.input)});\nconst __result = ${callExpr};\nprocess.stdout.write(JSON.stringify(__result));`
        : code;

      const { stdout, error } = await runCode(harness);
      let ok = false;
      try {
        ok = JSON.stringify(JSON.parse(stdout)) === JSON.stringify(JSON.parse(tc.expectedOutput?.trim()));
      } catch {
        ok = stdout === tc.expectedOutput?.trim();
      }
      if (ok) passed++;
      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: error ? `Runtime Error: ${error}` : stdout,
        passed: ok,
        hidden: tc.isHidden || false,
      });
    }

    const verdict = passed === testCases.length ? "Accepted" : "Wrong Answer";

    // Save submission
    await db.collection("submissions").insertOne({
      problemId: problem._id, problemSlug: problem.slug, code, language, verdict,
      passed, total: testCases.length,
      userId: req.user?.userId || null, username: req.user?.username || null,
      createdAt: new Date(),
    });

    // Update problem acceptance stats
    await db.collection("problems").updateOne(
      { _id: problem._id },
      { $inc: { totalSubmissions: 1, ...(verdict === "Accepted" ? { totalAccepted: 1 } : {}) } }
    );

    // Update user stats if logged in
    if (req.user?.userId) {
      // Check if user already solved this problem before (avoid double-counting)
      const alreadySolved = await db.collection("submissions").findOne({
        userId: req.user.userId,
        problemSlug: problem.slug,
        verdict: "Accepted",
        _id: { $ne: (await db.collection("submissions").findOne({ userId: req.user.userId, problemSlug: problem.slug, verdict: "Accepted", createdAt: { $lt: new Date() } }, { sort: { createdAt: -1 } }))?.new_id || new ObjectId() }
      });
      // Simpler check: count existing Accepted submissions for this user+problem
      const prevAccepted = await db.collection("submissions").countDocuments({
        userId: req.user.userId,
        problemSlug: problem.slug,
        verdict: "Accepted",
      });
      const firstTimeSolve = verdict === "Accepted" && prevAccepted <= 1; // <=1 because we just inserted
      await _updateUserStats(db, req.user.userId, problem, verdict === "Accepted", firstTimeSolve);
    }

    res.json({ success: true, verdict, passed, total: testCases.length, results });
  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ error: "Submission failed: " + err.message });
  }
});

// Helper: update user stats in users collection
async function _updateUserStats(db, userId, problem, isAccepted, firstTimeSolve) {
  try {
    const difficulty = (problem.difficulty || "medium").toLowerCase();
    const points = POINTS[difficulty] || 10;
    const userObjId = typeof userId === "string" ? new ObjectId(userId) : userId;

    const incFields = { "stats.totalSubmissions": 1 };
    if (isAccepted) {
      incFields["stats.acceptedSubmissions"] = 1;
    }
    if (firstTimeSolve) {
      incFields["stats.solved"] = 1;
      incFields["stats.score"] = points;
      if (difficulty === "easy")   incFields["stats.easy"] = 1;
      if (difficulty === "medium") incFields["stats.medium"] = 1;
      if (difficulty === "hard")   incFields["stats.hard"] = 1;
    }

    // Update streak: if last submission was yesterday or today, continue it
    const user = await db.collection("users").findOne({ _id: userObjId });
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = user?.stats?.lastSubmissionDate ? new Date(user.stats.lastSubmissionDate) : null;
    const lastDay  = lastDate ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()) : null;
    const diffDays = lastDay ? Math.floor((today - lastDay) / 86400000) : null;

    let streakInc = 0;
    if (isAccepted) {
      if (diffDays === null || diffDays > 1) streakInc = 1;       // first ever or streak broken → set to 1
      else if (diffDays === 1)              streakInc = 1;         // consecutive day
      // if diffDays === 0, already submitted today → no streak change
    }

    const updateOp = {
      $inc: incFields,
      $set: { lastActive: now },
    };
    if (isAccepted && diffDays !== 0) {
      if (diffDays === null || diffDays > 1) {
        updateOp.$set["stats.streak"] = 1; // reset streak
      } else {
        updateOp.$inc["stats.streak"] = streakInc;
      }
      updateOp.$set["stats.lastSubmissionDate"] = now;
    }

    await db.collection("users").updateOne({ _id: userObjId }, updateOp);
  } catch (e) {
    console.error("Failed to update user stats:", e);
  }
}

// GET /api/submissions — user's own submissions
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    const query = req.user ? { userId: req.user.userId } : {};
    const submissions = await db.collection("submissions").find(query).sort({ createdAt: -1 }).limit(50).toArray();
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

export default router;