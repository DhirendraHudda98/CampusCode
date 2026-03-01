import express from "express";
import { getDb } from "../mongodb.js";
import { comparePassword, signToken, hashPassword, createAuthCookie } from "../auth.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const db = await getDb();
  const users = db.collection("users");

  const user = await users.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = comparePassword(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  if (user.suspended) {
    return res.status(403).json({
      error: "SUSPENDED",
      message: "Your account has been suspended by an administrator. Please contact support.",
    });
  }

  await users.updateOne({ _id: user._id }, { $set: { lastActive: new Date() } });

  const token = signToken({ userId: user._id.toString(), username: user.username, email: user.email, role: user.role || "student" });
  res.setHeader("Set-Cookie", createAuthCookie(token));
  res.json({ success: true, user: { username: user.username, email: user.email, role: user.role || "student" } });
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email and password are required." });
    }
    if (username.trim().length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const VALID_ROLES = ["student", "teacher", "admin"];
    const assignedRole = VALID_ROLES.includes(role) ? role : "student";

    const db = await getDb();
    const users = db.collection("users");

    const exists = await users.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: "An account with this email already exists." });

    const usernameExists = await users.findOne({ username: username.trim() });
    if (usernameExists) return res.status(400).json({ error: "Username is already taken." });

    const passwordHash = hashPassword(password);
    const newUser = {
      username: username.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: assignedRole,
      createdAt: new Date(),
      lastActive: new Date(),
    };
    const result = await users.insertOne(newUser);

    const token = signToken({
      userId: result.insertedId.toString(),
      username: newUser.username,
      email: newUser.email,
      role: assignedRole,
    });
    res.setHeader("Set-Cookie", createAuthCookie(token));
    res.json({ success: true, user: { username: newUser.username, email: newUser.email, role: assignedRole } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration. Please try again." });
  }
});

router.post("/logout", (req, res) => {
  res.setHeader("Set-Cookie", "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  res.json({ success: true });
});

router.get("/me", async (req, res) => {
  // req.user is attached by authMiddleware
  if (!req.user) return res.status(200).json({ user: null });
  const db = await getDb();
  const users = db.collection("users");
  try {
    const userId = req.user.userId || req.user._id;
    const { ObjectId } = await import("mongodb");
    const user = await users.findOne({ _id: typeof userId === "string" ? new ObjectId(userId) : userId });
    if (!user) return res.status(200).json({ user: null });
    // If account was suspended after login, force them out
    if (user.suspended) {
      res.setHeader("Set-Cookie", "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
      return res.status(403).json({ error: "SUSPENDED", message: "Your account has been suspended." });
    }
    // Return full user data including stats for profile page
    const defaultStats = { solved: 0, easy: 0, medium: 0, hard: 0, streak: 0, totalSubmissions: 0, acceptedSubmissions: 0, score: 0 };
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "student",
        createdAt: user.createdAt,
        lastActive: user.lastActive,
        stats: { ...defaultStats, ...(user.stats || {}) },
        contestsJoined: user.contestsJoined || [],
        placementsApplied: user.placementsApplied || [],
      },
    });
  } catch (err) {
    console.error("/me error", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
