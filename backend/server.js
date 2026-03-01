import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authMiddleware } from "./middleware.js";
import authRoutes from "./routes/auth.js";
import problemRoutes from "./routes/problems.js";
import submissionRoutes from "./routes/submissions.js";
import discussionRoutes from "./routes/discussions.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import contestRoutes from "./routes/contests.js";
import aiRoutes from "./routes/ai.js";
import runRoutes from "./routes/run.js";
import placementRoutes from "./routes/placements.js";
import problemSlugRoutes from "./routes/problems_slug.js";
import adminRoutes from "./routes/admin.js";
import teacherRoutes from "./routes/teacher.js";
import bookmarkRoutes from "./routes/bookmarks.js";
import dailyRoutes from "./routes/daily.js";
import prepRoutes from "./routes/prep.js";
import notificationRoutes from "./routes/notifications.js";
import { isMemoryMode, getDb } from "./mongodb.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .concat(["http://localhost:5174", "http://localhost:5175"]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(authMiddleware);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/problems", problemSlugRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/run", runRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/daily", dailyRoutes);
app.use("/api/prep", prepRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/health", async (req, res) => {
  const dbMode = isMemoryMode ? "in-memory" : "mongodb";
  let dbStatus = "connected";
  if (!isMemoryMode) {
    try {
      const db = await getDb();
      await db.collection("_health").findOne({});
    } catch {
      dbStatus = "error";
    }
  }
  res.json({ status: "ok", db: dbMode, dbStatus, timestamp: new Date() });
});

app.listen(PORT, async () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`🔌 CORS enabled for ${process.env.FRONTEND_URL || "http://localhost:5173"}`);

  if (isMemoryMode) {
    console.log("⚠️  MongoDB URI not set — running with in-memory store (data resets on restart)");
  } else {
    try {
      const db = await getDb();
      await db.collection("_health").findOne({});
      console.log(`🍃 MongoDB connected → ${process.env.MONGODB_URI}`);
    } catch (err) {
      console.error(`❌ MongoDB connection failed: ${err.message}`);
      console.error("   Check that mongod is running and MONGODB_URI is correct in backend/.env");
    }
  }
  console.log("");
});
