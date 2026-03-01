import express from "express";
import { getDb } from "../mongodb.js";
import { requireAuth } from "../middleware.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ─── GET /api/bookmarks — list bookmarked problems ───────────────────────────
router.get("/", requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.collection("users").findOne({ _id: new ObjectId(req.user.userId) });
    const slugs = user?.bookmarks || [];
    if (!slugs.length) return res.json({ problems: [] });
    const problems = await db.collection("problems")
      .find(
        { slug: { $in: slugs } },
        { projection: { title: 1, slug: 1, difficulty: 1, category: 1, tags: 1 } }
      )
      .toArray();
    // preserve bookmark order
    const map = Object.fromEntries(problems.map(p => [p.slug, p]));
    res.json({ problems: slugs.map(s => map[s]).filter(Boolean) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// ─── POST /api/bookmarks/:slug — toggle bookmark ─────────────────────────────
router.post("/:slug", requireAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const db = await getDb();
    const uid = new ObjectId(req.user.userId);
    const user = await db.collection("users").findOne({ _id: uid });
    const bookmarks = user?.bookmarks || [];
    const exists = bookmarks.includes(slug);
    const update = exists
      ? { $pull: { bookmarks: slug } }
      : { $addToSet: { bookmarks: slug } };
    await db.collection("users").updateOne({ _id: uid }, update);
    res.json({ bookmarked: !exists, slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});

export default router;
