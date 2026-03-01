import express from "express";
import { getDb } from "../mongodb.js";
import { requireRole } from "../middleware.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// GET user's own applied placements (must be BEFORE /:id)
router.get("/mine", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Login required" });
  try {
    const db = await getDb();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { placementsApplied: 1 } }
    );
    res.json({ placements: user?.placementsApplied || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// GET all placements (full details)
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    const placements = await db.collection("placements")
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ placements });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch placements" });
  }
});

// POST create placement (teacher only)
router.post("/", requireRole("teacher"), async (req, res) => {
  const { title, company, location, salaryMin, salaryMax, jobType, description, requirements, deadline } = req.body;
  if (!title || !company || !location) return res.status(400).json({ error: "Missing required fields" });
  const db = await getDb();
  const placement = { title, company, location, salaryMin, salaryMax, jobType, description, requirements, deadline: deadline ? new Date(deadline) : null, applicants: [], createdAt: new Date() };
  await db.collection("placements").insertOne(placement);
  res.json({ success: true });
});

// POST apply to placement
router.post("/:id/apply", async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Login required" });
  if (user.role !== "student") return res.status(403).json({ error: "Only students can apply to placements" });
  const id = req.params.id;
  const db = await getDb();
  const placement = await db.collection("placements").findOne({ _id: new ObjectId(id) });
  if (!placement) return res.status(404).json({ error: "Not found" });

  const already = (placement.applicants || []).some(a => a.userId?.toString?.() === user.userId?.toString?.());
  if (already) return res.status(400).json({ error: "Already applied" });

  const applicant = { userId: user.userId, username: user.username, email: user.email, appliedAt: new Date() };
  // Update placement: add applicant
  await db.collection("placements").updateOne(
    { _id: new ObjectId(id) },
    { $push: { applicants: applicant }, $inc: { applicantsCount: 1 }, $set: { updatedAt: new Date() } }
  );

  // Update user: save this placement to their record
  await db.collection("users").updateOne(
    { _id: new ObjectId(user.userId) },
    {
      $push: {
        placementsApplied: {
          placementId: new ObjectId(id),
          company: placement.company,
          title: placement.title,
          appliedAt: new Date(),
        },
      },
    }
  );

  res.json({ success: true });
});

export default router;