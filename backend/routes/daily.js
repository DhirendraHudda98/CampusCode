import express from "express";
import { getDb } from "../mongodb.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ─── GET /api/daily — returns today's daily challenge (deterministic) ─────────
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    const problems = await db
      .collection("problems")
      .find({}, { projection: { title: 1, slug: 1, difficulty: 1, category: 1, tags: 1, acceptance: 1 } })
      .toArray();

    if (!problems.length) return res.status(404).json({ error: "No problems found" });

    // Pick deterministically by day-of-year so everyone gets the same problem each day
    const now = new Date();
    const dayOfYear = Math.floor(
      (now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    const todayProblem = problems[dayOfYear % problems.length];

    // Check if logged-in user has already solved / bookmarked it
    let solved = false;
    let bookmarked = false;
    const user = req.user;
    if (user) {
      const userDoc = await db.collection("users").findOne(
        { _id: new ObjectId(user.userId) },
        { projection: { bookmarks: 1 } }
      );
      bookmarked = (userDoc?.bookmarks || []).includes(todayProblem.slug);
      const sub = await db.collection("submissions").findOne({
        userId: user.userId,
        problemSlug: todayProblem.slug,
        verdict: "Accepted",
      });
      solved = !!sub;
    }

    const dateStr = now.toISOString().split("T")[0];
    res.json({ problem: todayProblem, date: dateStr, solved, bookmarked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch daily challenge" });
  }
});

// ─── GET /api/daily/history — last 7 days challenges ──────────────────────────
router.get("/history", async (req, res) => {
  try {
    const db = await getDb();
    const problems = await db
      .collection("problems")
      .find({}, { projection: { title: 1, slug: 1, difficulty: 1, category: 1 } })
      .toArray();

    if (!problems.length) return res.json({ history: [] });

    const history = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayOfYear = Math.floor(
        (d - new Date(d.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
      );
      const problem = problems[dayOfYear % problems.length];
      history.push({ date: d.toISOString().split("T")[0], problem, isToday: i === 0 });
    }
    res.json({ history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch challenge history" });
  }
});

export default router;
