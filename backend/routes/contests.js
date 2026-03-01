import express from "express";
import { getDb } from "../mongodb.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// GET all contests
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    const contests = await db.collection("contests").find({}).sort({ startsAt: 1 }).toArray();
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contests" });
  }
});

// GET single contest
router.get("/:id", async (req, res) => {
  try {
    const db = await getDb();
    const contest = await db.collection("contests").findOne({ _id: new ObjectId(req.params.id) });
    if (!contest) return res.status(404).json({ error: "Contest not found" });
    res.json({ contest });
  } catch {
    res.status(400).json({ error: "Invalid contest ID" });
  }
});

// POST join a contest
router.post("/:id/join", async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Login required to join a contest" });
  if (user.role !== "student") return res.status(403).json({ error: "Only students can join contests" });
  try {
    const db = await getDb();
    const contest = await db.collection("contests").findOne({ _id: new ObjectId(req.params.id) });
    if (!contest) return res.status(404).json({ error: "Contest not found" });

    const already = (contest.participants_list || []).some(
      (p) => p.userId?.toString() === user.userId?.toString()
    );
    if (already) return res.status(400).json({ error: "You have already joined this contest" });

    // Update contest: add user to participants_list
    await db.collection("contests").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $push: { participants_list: { userId: user.userId, username: user.username, joinedAt: new Date() } },
        $inc:  { participants: 1 },
      }
    );

    // Update user: save this contest to their record
    const { ObjectId: ObjId } = await import("mongodb");
    await db.collection("users").updateOne(
      { _id: new ObjId(user.userId) },
      {
        $push: {
          contestsJoined: {
            contestId: new ObjectId(req.params.id),
            contestTitle: contest.title,
            joinedAt: new Date(),
          },
        },
      }
    );

    res.json({ success: true, message: "Successfully joined the contest!" });
  } catch (err) {
    console.error("Join contest error:", err);
    res.status(500).json({ error: "Failed to join contest" });
  }
});

export default router;