import express from "express";
import { getDb } from "../mongodb.js";

const router = express.Router();

// GET /api/leaderboard — dynamically ranked from users collection
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    const users = await db
      .collection("users")
      .find(
        { "stats.score": { $gt: 0 } },
        {
          projection: {
            username: 1,
            email: 1,
            role: 1,
            "stats.score": 1,
            "stats.solved": 1,
            "stats.streak": 1,
            "stats.easy": 1,
            "stats.medium": 1,
            "stats.hard": 1,
            "stats.totalSubmissions": 1,
            "stats.acceptedSubmissions": 1,
            createdAt: 1,
          },
        }
      )
      .sort({ "stats.score": -1 })
      .limit(100)
      .toArray();

    const leaderboard = users.map((u, i) => ({
      _id: u._id,
      rank: i + 1,
      username: u.username,
      email: u.email,
      role: u.role || "student",
      score: u.stats?.score || 0,
      solved: u.stats?.solved || 0,
      streak: u.stats?.streak || 0,
      easy: u.stats?.easy || 0,
      medium: u.stats?.medium || 0,
      hard: u.stats?.hard || 0,
      totalSubmissions: u.stats?.totalSubmissions || 0,
      acceptedSubmissions: u.stats?.acceptedSubmissions || 0,
    }));

    res.json({ leaderboard });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard", leaderboard: [] });
  }
});

export default router;