import express from "express";
import { getDb } from "../mongodb.js";
import { requireRole } from "../middleware.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ─── Problems ───────────────────────────────────────────────────────────────
router.get("/problems", requireRole("teacher"), async (req, res) => {
  const db = await getDb();
  const problems = await db.collection("problems")
    .find({ createdBy: req.user?.userId })
    .sort({ createdAt: -1 })
    .toArray();
  res.json({ problems });
});

// ─── Problem: update teacher's own ─────────────────────────────────────────
router.patch("/problems/:id", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const { title, difficulty, category, description, starterCode, tags } = req.body;
    const update = {};
    if (title)                update.title       = title.trim();
    if (difficulty)           update.difficulty  = difficulty;
    if (category)             update.category    = category;
    if (description !== undefined) update.description = description;
    if (starterCode !== undefined) update.starterCode  = starterCode;
    if (tags)                 update.tags        = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim()).filter(Boolean);
    update.updatedAt = new Date();
    const result = await db.collection("problems").updateOne(
      { _id: new ObjectId(req.params.id), createdBy: req.user?.userId },
      { $set: update }
    );
    if (!result.matchedCount) return res.status(404).json({ error: "Problem not found or not yours" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// ─── Students ───────────────────────────────────────────────────────────────
router.get("/students", requireRole("teacher"), async (req, res) => {
  const db = await getDb();
  const students = await db.collection("users")
    .find({ role: "student" }, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  res.json({ students });
});

// ─── Teacher Stats ──────────────────────────────────────────────────────────
router.get("/stats", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.user?.userId;
    const [problemCount, contestCount, placementCount, studentCount] = await Promise.all([
      db.collection("problems").countDocuments({ createdBy: userId }),
      db.collection("contests").countDocuments({ createdBy: userId }),
      db.collection("placements").countDocuments({ createdBy: userId }),
      db.collection("users").countDocuments({ role: "student" }),
    ]);
    res.json({ problemCount, contestCount, placementCount, studentCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─── Contests: list teacher's own ──────────────────────────────────────────
router.get("/contests", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const contests = await db.collection("contests")
      .find({ createdBy: req.user?.userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contests" });
  }
});

// ─── Contest: create ────────────────────────────────────────────────────────
router.post("/contests", requireRole("teacher"), async (req, res) => {
  try {
    const {
      title, description, difficulty = "medium",
      startDate, endDate, duration, prize, tags = [],
    } = req.body;
    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({ error: "Title, description, start date and end date are required" });
    }
    const db = await getDb();
    const now = new Date();
    const start = new Date(startDate);
    const end   = new Date(endDate);
    let status = "upcoming";
    if (now >= start && now <= end) status = "active";
    if (now > end)                  status = "ended";

    const contest = {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      startsAt: start,
      endsAt:   end,
      duration:  duration ? Number(duration) : Math.round((end - start) / 60000),
      prize:     prize || "",
      tags:      Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim()).filter(Boolean),
      participants: 0,
      participants_list: [],
      status,
      createdBy: req.user?.userId,
      createdByUsername: req.user?.username,
      createdAt: now,
    };
    const result = await db.collection("contests").insertOne(contest);

    // Broadcast notification to all students
    try {
      const students = await db.collection("users").find({ role: "student" }, { projection: { _id: 1 } }).toArray();
      if (students.length > 0) {
        const notifDocs = students.map(s => ({
          userId: s._id,
          title: `New Contest: ${contest.title}`,
          message: `A new ${contest.difficulty} contest has started! Join now.`,
          type: "contest",
          link: "/contests",
          read: false,
          createdAt: new Date(),
        }));
        await db.collection("notifications").insertMany(notifDocs);
      }
    } catch (_) {}

    res.json({ success: true, contestId: result.insertedId });
  } catch (err) {
    console.error("Create contest error:", err);
    res.status(500).json({ error: "Failed to create contest: " + err.message });
  }
});

// ─── Contest: update teacher's own ─────────────────────────────────────────
router.patch("/contests/:id", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const { title, description, difficulty, startDate, endDate, duration, prize, tags } = req.body;
    const update = {};
    if (title)       update.title       = title.trim();
    if (description) update.description = description.trim();
    if (difficulty)  update.difficulty  = difficulty;
    if (startDate)   update.startsAt    = new Date(startDate);
    if (endDate)     update.endsAt      = new Date(endDate);
    if (duration)    update.duration    = Number(duration);
    if (prize !== undefined) update.prize = prize;
    if (tags) update.tags = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim()).filter(Boolean);
    update.updatedAt = new Date();
    const result = await db.collection("contests").updateOne(
      { _id: new ObjectId(req.params.id), createdBy: req.user?.userId },
      { $set: update }
    );
    if (!result.matchedCount) return res.status(404).json({ error: "Contest not found or not yours" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// ─── Contest: delete teacher's own ─────────────────────────────────────────
router.delete("/contests/:id", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection("contests").deleteOne({
      _id: new ObjectId(req.params.id),
      createdBy: req.user?.userId,
    });
    if (!result.deletedCount) return res.status(404).json({ error: "Contest not found or not yours" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ─── Placements: list teacher's own ────────────────────────────────────────
router.get("/placements", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const placements = await db.collection("placements")
      .find({ createdBy: req.user?.userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ placements });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch placements" });
  }
});

// ─── Placement: create ──────────────────────────────────────────────────────
router.post("/placements", requireRole("teacher"), async (req, res) => {
  try {
    const {
      company, title, location, jobType = "Full-time",
      salaryMin, salaryMax, description, requirements = "",
      responsibilities = "", skills = "", openings = 1, deadline,
    } = req.body;
    if (!company || !title || !location) {
      return res.status(400).json({ error: "Company, title and location are required" });
    }
    const db = await getDb();
    const placement = {
      company: company.trim(),
      title:   title.trim(),
      location: location.trim(),
      jobType,
      salaryMin:  salaryMin  ? Number(salaryMin)  : null,
      salaryMax:  salaryMax  ? Number(salaryMax)  : null,
      description: description?.trim() || "",
      requirements: requirements.trim(),
      responsibilities: responsibilities.trim(),
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map(s => s.trim()).filter(Boolean),
      openings:   Number(openings) || 1,
      deadline:   deadline ? new Date(deadline) : null,
      applicants: [],
      applicantsCount: 0,
      createdBy: req.user?.userId,
      createdByUsername: req.user?.username,
      createdAt: new Date(),
    };
    const result = await db.collection("placements").insertOne(placement);

    // Broadcast notification to all students
    try {
      const students = await db.collection("users").find({ role: "student" }, { projection: { _id: 1 } }).toArray();
      if (students.length > 0) {
        const notifDocs = students.map(s => ({
          userId: s._id,
          title: `New Job: ${placement.company}`,
          message: `${placement.title} at ${placement.company} (${placement.location}). Apply now!`,
          type: "placement",
          link: "/placements",
          read: false,
          createdAt: new Date(),
        }));
        await db.collection("notifications").insertMany(notifDocs);
      }
    } catch (_) {}

    res.json({ success: true, placementId: result.insertedId });
  } catch (err) {
    console.error("Create placement error:", err);
    res.status(500).json({ error: "Failed to create placement: " + err.message });
  }
});

// ─── Placement: update teacher's own ───────────────────────────────────────
router.patch("/placements/:id", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const { company, title, location, jobType, salaryMin, salaryMax, description, requirements, responsibilities, skills, openings, deadline } = req.body;
    const update = {};
    if (company)         update.company         = company.trim();
    if (title)           update.title           = title.trim();
    if (location)        update.location        = location.trim();
    if (jobType)         update.jobType         = jobType;
    if (salaryMin !== undefined) update.salaryMin = salaryMin ? Number(salaryMin) : null;
    if (salaryMax !== undefined) update.salaryMax = salaryMax ? Number(salaryMax) : null;
    if (description !== undefined) update.description = description?.trim() || "";
    if (requirements !== undefined) update.requirements = requirements.trim();
    if (responsibilities !== undefined) update.responsibilities = responsibilities.trim();
    if (skills !== undefined) update.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()).filter(Boolean);
    if (openings)        update.openings        = Number(openings) || 1;
    if (deadline !== undefined) update.deadline = deadline ? new Date(deadline) : null;
    update.updatedAt = new Date();
    const result = await db.collection("placements").updateOne(
      { _id: new ObjectId(req.params.id), createdBy: req.user?.userId },
      { $set: update }
    );
    if (!result.matchedCount) return res.status(404).json({ error: "Placement not found or not yours" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// ─── Placement: view applicants for teacher's own ───────────────────────────
router.get("/placements/:id/applicants", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const placement = await db.collection("placements").findOne({
      _id: new ObjectId(req.params.id),
      createdBy: req.user?.userId,
    });
    if (!placement) return res.status(404).json({ error: "Placement not found or not yours" });
    res.json({ applicants: placement.applicants || [], total: placement.applicantsCount || 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applicants" });
  }
});

// ─── Placement: delete teacher's own ───────────────────────────────────────
router.delete("/placements/:id", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection("placements").deleteOne({
      _id: new ObjectId(req.params.id),
      createdBy: req.user?.userId,
    });
    if (!result.deletedCount) return res.status(404).json({ error: "Placement not found or not yours" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});
// ─── Student submissions (with code) ───────────────────────────────────────────────────────────
router.get("/student-submissions", requireRole("teacher"), async (req, res) => {
  try {
    const db = await getDb();
    const { studentId, limit = 50 } = req.query;
    const query = studentId ? { userId: studentId } : {};
    const subs = await db.collection("submissions")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .toArray();
    res.json({ submissions: subs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// ─── Report a student ────────────────────────────────────────────────────────
router.post("/report/:studentId", requireRole("teacher"), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ error: "Reason is required" });
    const db = await getDb();
    const student = await db.collection("users").findOne({
      _id: new ObjectId(req.params.studentId),
      role: "student",
    });
    if (!student) return res.status(404).json({ error: "Student not found" });
    // Prevent duplicate open reports from same teacher for same student
    const existing = await db.collection("reports").findOne({
      studentId: student._id.toString(),
      teacherId: req.user.userId,
      status: "pending",
    });
    if (existing) return res.status(409).json({ error: "You already have an open report for this student" });
    const report = {
      studentId:       student._id.toString(),
      studentUsername: student.username,
      studentEmail:    student.email,
      teacherId:       req.user.userId,
      teacherUsername: req.user.username,
      reason:          reason.trim(),
      status:          "pending",
      createdAt:       new Date(),
    };
    await db.collection("reports").insertOne(report);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

export default router;
