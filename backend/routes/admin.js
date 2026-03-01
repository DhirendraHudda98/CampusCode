import express from "express";
import { getDb } from "../mongodb.js";
import { requireRole } from "../middleware.js";
import { ObjectId } from "mongodb";
import { hashPassword } from "../auth.js";

const router = express.Router();

// ─── Platform Stats ─────────────────────────────────────────────────────────
router.get("/stats", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const [totalUsers, totalProblems, totalSubmissions, totalContests, totalPlacements, acceptedSubs] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("problems").countDocuments(),
      db.collection("submissions").countDocuments(),
      db.collection("contests").countDocuments(),
      db.collection("placements").countDocuments(),
      db.collection("submissions").countDocuments({ verdict: "Accepted" }),
    ]);
    const roleCounts = await db.collection("users").aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]).toArray();
    const byRole = {};
    roleCounts.forEach(r => { byRole[r._id] = r.count; });
    res.json({ totalUsers, totalProblems, totalSubmissions, totalContests, totalPlacements, acceptedSubs, byRole });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─── Users: list all ────────────────────────────────────────────────────────
router.get("/users", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const users = await db.collection("users")
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ─── Users: change role ──────────────────────────────────────────────────────
router.patch("/users/:id/role", requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "teacher", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    if (req.params.id === req.user?.userId) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }
    const db = await getDb();
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { role, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

// ─── Users: suspend / activate ───────────────────────────────────────────────
router.patch("/users/:id/suspend", requireRole("admin"), async (req, res) => {
  try {
    if (req.params.id === req.user?.userId) {
      return res.status(400).json({ error: "Cannot suspend yourself" });
    }
    const db = await getDb();
    const user = await db.collection("users").findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ error: "User not found" });
    const suspended = !user.suspended;
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { suspended, updatedAt: new Date() } }
    );
    res.json({ success: true, suspended });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ─── Users: reset password ───────────────────────────────────────────────────
router.patch("/users/:id/reset-password", requireRole("admin"), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const db = await getDb();
    const hash = hashPassword(newPassword);
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { passwordHash: hash, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ─── Users: delete ───────────────────────────────────────────────────────────
router.delete("/users/:id", requireRole("admin"), async (req, res) => {
  try {
    if (req.params.id === req.user?.userId) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }
    const db = await getDb();
    await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
    // Also delete their submissions
    await db.collection("submissions").deleteMany({ userId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ─── Submissions: list all ───────────────────────────────────────────────────
router.get("/submissions", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const subs = await db.collection("submissions")
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();
    res.json({ submissions: subs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// ─── Contests: list & delete ─────────────────────────────────────────────────
router.get("/contests", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const contests = await db.collection("contests").find({}).sort({ createdAt: -1 }).toArray();
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contests" });
  }
});

router.patch("/contests/:id", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const { title, description, difficulty, startDate, endDate, prize, tags } = req.body;
    const update = {};
    if (title)       update.title       = title.trim();
    if (description) update.description = description.trim();
    if (difficulty)  update.difficulty  = difficulty;
    if (startDate)   update.startsAt    = new Date(startDate);
    if (endDate)     update.endsAt      = new Date(endDate);
    if (prize !== undefined) update.prize = prize;
    if (tags) update.tags = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim()).filter(Boolean);
    update.updatedAt = new Date();
    await db.collection("contests").updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

router.delete("/contests/:id", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    await db.collection("contests").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ─── Placements: list & delete ───────────────────────────────────────────────
router.get("/placements", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const placements = await db.collection("placements").find({}).sort({ createdAt: -1 }).toArray();
    res.json({ placements });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch placements" });
  }
});

router.patch("/placements/:id", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const { company, title, location, jobType, salaryMin, salaryMax, description, requirements, deadline } = req.body;
    const update = {};
    if (company)     update.company     = company.trim();
    if (title)       update.title       = title.trim();
    if (location)    update.location    = location.trim();
    if (jobType)     update.jobType     = jobType;
    if (salaryMin !== undefined) update.salaryMin = salaryMin ? Number(salaryMin) : null;
    if (salaryMax !== undefined) update.salaryMax = salaryMax ? Number(salaryMax) : null;
    if (description !== undefined) update.description = description?.trim() || "";
    if (requirements !== undefined) update.requirements = requirements.trim();
    if (deadline !== undefined) update.deadline = deadline ? new Date(deadline) : null;
    update.updatedAt = new Date();
    await db.collection("placements").updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

router.delete("/placements/:id", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    await db.collection("placements").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ─── Problems: list & delete ─────────────────────────────────────────────────
router.get("/problems", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const problems = await db.collection("problems").find({}).sort({ createdAt: -1 }).toArray();
    res.json({ problems });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

router.patch("/problems/:id", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const { title, difficulty, category, description } = req.body;
    const update = {};
    if (title)       update.title       = title.trim();
    if (difficulty)  update.difficulty  = difficulty;
    if (category)    update.category    = category;
    if (description !== undefined) update.description = description;
    update.updatedAt = new Date();
    await db.collection("problems").updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

router.delete("/problems/:id", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    await db.collection("problems").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ─── Discussions: list all & delete any ─────────────────────────────────────
router.get("/discussions", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const discussions = await db.collection("discussions").find({}).sort({ createdAt: -1 }).toArray();
    res.json({ discussions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch discussions" });
  }
});

router.delete("/discussions/:id", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    await db.collection("discussions").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ─── Broadcast notification to all students ──────────────────────────────────
router.post("/broadcast", requireRole("admin"), async (req, res) => {
  try {
    const { title, message, type = "announcement", link = "/" } = req.body;
    if (!title?.trim() || !message?.trim()) return res.status(400).json({ error: "Title and message required" });
    const db = await getDb();
    const targets = req.body.targetRole
      ? await db.collection("users").find({ role: req.body.targetRole }, { projection: { _id: 1 } }).toArray()
      : await db.collection("users").find({ role: { $in: ["student", "teacher"] } }, { projection: { _id: 1 } }).toArray();
    if (!targets.length) return res.status(400).json({ error: "No users to notify" });
    const notifDocs = targets.map(u => ({
      userId: u._id,
      title: title.trim(),
      message: message.trim(),
      type,
      link,
      read: false,
      createdAt: new Date(),
      sentByAdmin: req.user?.username,
    }));
    await db.collection("notifications").insertMany(notifDocs);
    res.json({ success: true, sent: notifDocs.length });
  } catch (err) {
    res.status(500).json({ error: "Broadcast failed" });
  }
});

// ─── Reports: list all ───────────────────────────────────────────────────────
router.get("/reports", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const reports = await db.collection("reports").find({}).sort({ createdAt: -1 }).toArray();
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// ─── Reports: dismiss a report ───────────────────────────────────────────────
router.delete("/reports/:id", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    await db.collection("reports").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to dismiss report" });
  }
});

// ─── Reports: delete reported student + all their reports ────────────────────
router.delete("/reports/:id/delete-user", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    const report = await db.collection("reports").findOne({ _id: new ObjectId(req.params.id) });
    if (!report) return res.status(404).json({ error: "Report not found" });
    // Delete the student user
    await db.collection("users").deleteOne({ _id: new ObjectId(report.studentId) });
    // Delete their submissions
    await db.collection("submissions").deleteMany({ userId: report.studentId });
    // Delete all reports for this student
    await db.collection("reports").deleteMany({ studentId: report.studentId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete student" });
  }
});

// ─── Charts data endpoint ────────────────────────────────────────────────────
router.get("/charts", requireRole("admin"), async (req, res) => {
  try {
    const db = await getDb();
    // Verdict distribution
    const verdictAgg = await db.collection("submissions").aggregate([
      { $group: { _id: "$verdict", count: { $sum: 1 } } }
    ]).toArray();
    const verdictsData = verdictAgg.map(v => ({ name: v._id || "Unknown", value: v.count }));

    // Top 8 users by score
    const topUsersRaw = await db.collection("users")
      .find({ "stats.score": { $gt: 0 } }, { projection: { username: 1, "stats.score": 1, "stats.solved": 1 } })
      .sort({ "stats.score": -1 })
      .limit(8)
      .toArray();
    const topUsers = topUsersRaw.map(u => ({ username: u.username, score: u.stats?.score || 0, solved: u.stats?.solved || 0 }));

    // Daily submissions: last 14 days
    const since14 = new Date(); since14.setDate(since14.getDate() - 14);
    const dailyRaw = await db.collection("submissions")
      .find({ createdAt: { $gte: since14 } }, { projection: { createdAt: 1, verdict: 1 } })
      .toArray();
    const dayMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = { date: key.slice(5), submissions: 0, accepted: 0 };
    }
    dailyRaw.forEach(s => {
      const key = new Date(s.createdAt).toISOString().slice(0, 10);
      if (dayMap[key]) {
        dayMap[key].submissions++;
        if (s.verdict === "Accepted") dayMap[key].accepted++;
      }
    });
    const dailyActivity = Object.values(dayMap);

    // Problem difficulty distribution
    const diffAgg = await db.collection("problems").aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } }
    ]).toArray();
    const solvedByDifficulty = diffAgg.map(d => ({ name: d._id, value: d.count }));

    // Map to frontend expected names
    const submissionsByDay = dailyActivity.map(d => ({ date: d.date, count: d.submissions }));
    const verdictDistribution = verdictAgg.map(v => ({ verdict: v._id || "Unknown", count: v.count }));

    res.json({ submissionsByDay, verdictDistribution, solvedByDifficulty, topUsers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

export default router;
