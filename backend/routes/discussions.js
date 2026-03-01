import express from "express";
import { getDb } from "../mongodb.js";
import { requireAuth } from "../middleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    const items = await db.collection("discussions").find({}).sort({ createdAt: -1 }).toArray();
    res.json({ discussions: items });
  } catch (err) { res.status(500).json({ error: "Failed to fetch discussions" }); }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title?.trim() || !content?.trim()) return res.status(400).json({ error: "Title and content required" });
    const db = await getDb();
    const result = await db.collection("discussions").insertOne({ title: title.trim(), content: content.trim(), author: req.user.username, userId: req.user.userId, likes: 0, likedBy: [], replies: [], createdAt: new Date() });
    res.json({ success: true, id: result.insertedId });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to create discussion" }); }
});

router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const { ObjectId } = await import("mongodb");
    const db = await getDb();
    const disc = await db.collection("discussions").findOne({ _id: new ObjectId(req.params.id) });
    if (!disc) return res.status(404).json({ error: "Not found" });
    const liked = disc.likedBy?.includes(req.user.userId);
    const update = liked
      ? { $inc: { likes: -1 }, $pull: { likedBy: req.user.userId } }
      : { $inc: { likes: 1 }, $addToSet: { likedBy: req.user.userId } };
    await db.collection("discussions").updateOne({ _id: new ObjectId(req.params.id) }, update);
    res.json({ success: true, liked: !liked });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.post("/:id/reply", requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Content required" });
    const { ObjectId } = await import("mongodb");
    const db = await getDb();
    await db.collection("discussions").updateOne({ _id: new ObjectId(req.params.id) }, { $push: { replies: { content: content.trim(), author: req.user.username, userId: req.user.userId, createdAt: new Date() } } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { ObjectId } = await import("mongodb");
    const db = await getDb();
    const disc = await db.collection("discussions").findOne({ _id: new ObjectId(req.params.id) });
    if (!disc) return res.status(404).json({ error: "Not found" });
    if (disc.userId !== req.user.userId && req.user.role !== "admin" && req.user.role !== "teacher") return res.status(403).json({ error: "Not authorized" });
    await db.collection("discussions").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

export default router;
