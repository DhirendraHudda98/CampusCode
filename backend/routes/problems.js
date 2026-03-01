import express from "express";
import { getDb } from "../mongodb.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { difficulty, category, search, tag } = req.query;
    const db = await getDb();
    const filter = {};
    if (difficulty && difficulty !== "all") filter.difficulty = difficulty;
    if (category && category !== "all") filter.category = category;
    if (tag) filter.tags = tag;
    if (search) filter.title = { $regex: search, $options: "i" };
    const problems = await db.collection("problems").find(filter, {
      projection: { title: 1, slug: 1, difficulty: 1, category: 1, tags: 1, acceptance: 1, totalSubmissions: 1, totalAccepted: 1, companies: 1 }
    }).toArray();
    res.json({ problems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

// Seed endpoint used by existing script
router.post("/seed", async (req, res) => {
  try {
    const db = await getDb();
    const problems = require("../../scripts/problems.json");
    await db.collection("problems").insertMany(problems);
    res.json({ success: true, count: problems.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Seed failed" });
  }
});

// Create a new problem (teacher only)
router.post("/", async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "teacher") return res.status(403).json({ error: "Forbidden" });
    const { title, slug, difficulty, category, description, starterCode } = req.body;
    if (!title || !slug) return res.status(400).json({ error: "Missing fields" });
    const db = await getDb();
    const doc = { title, slug, difficulty, category, description, starterCode, createdBy: user.userId, createdAt: new Date() };
    await db.collection("problems").insertOne(doc);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create problem" });
  }
});

export default router;
