import express from "express";
import { getDb } from "../mongodb.js";
import { requireRole } from "../middleware.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ─── GET /api/prep — public list of all prep materials ──────────────────────
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    const { category, type } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    const materials = await db.collection("prep_materials")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ materials });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

// ─── POST /api/prep — teacher creates a material ────────────────────────────
router.post("/", requireRole("teacher"), async (req, res) => {
  try {
    const { title, category, topic, type, content, tags, difficulty } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ error: "Title, category and content are required" });
    }
    const db = await getDb();
    const doc = {
      title: title.trim(),
      category,
      topic: topic?.trim() || "",
      type: type || "Notes",
      content: content.trim(),
      difficulty: difficulty || "Medium",
      tags: Array.isArray(tags) ? tags : (tags || "").split(",").map(t => t.trim()).filter(Boolean),
      createdBy: req.user.userId,
      createdByUsername: req.user.username,
      createdAt: new Date(),
    };
    const result = await db.collection("prep_materials").insertOne(doc);
    res.json({ success: true, materialId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create material" });
  }
});

// ─── DELETE /api/prep/:id — teacher deletes own material ────────────────────
router.delete("/:id", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection("prep_materials").deleteOne({
      _id: new ObjectId(req.params.id),
      createdBy: req.user.userId,
    });
    if (!result.deletedCount) return res.status(404).json({ error: "Not found or not yours" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ─── GET /api/prep/my — teacher's own materials ─────────────────────────────
router.get("/my", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const materials = await db.collection("prep_materials")
      .find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ materials });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your materials" });
  }
});

export default router;
