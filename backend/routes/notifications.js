import express from "express";
import { getDb } from "../mongodb.js";
import { requireAuth } from "../middleware.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// GET /api/notifications — user's notifications (newest first)
router.get("/", requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const notes = await db.collection("notifications")
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();
    const unread = notes.filter(n => !n.read).length;
    res.json({ notifications: notes, unread });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    await db.collection("notifications").updateMany(
      { userId: req.user.userId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    await db.collection("notifications").updateOne(
      { _id: new ObjectId(req.params.id), userId: req.user.userId },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// DELETE /api/notifications/clear — delete all read notifications
router.delete("/clear", requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    await db.collection("notifications").deleteMany({ userId: req.user.userId, read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear" });
  }
});

// ── Helper: broadcast a notification to all users of given roles ─────────────
// Called internally from other routes (placements, contests, prep)
export async function broadcastNotification(db, { roles = ["student"], title, message, link = "/" }) {
  try {
    const users = await db.collection("users")
      .find({ role: { $in: roles } }, { projection: { _id: 1 } })
      .toArray();
    if (!users.length) return;
    const docs = users.map(u => ({
      userId: u._id.toString(),
      title,
      message,
      link,
      read: false,
      createdAt: new Date(),
    }));
    await db.collection("notifications").insertMany(docs);
  } catch (e) {
    console.error("Broadcast notification failed:", e.message);
  }
}

export default router;
