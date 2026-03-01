import express from "express";
import { getDb } from "../mongodb.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const db = await getDb();
    const problem = await db.collection("problems").findOne({ slug });
    if (!problem) return res.status(404).json({ error: "Not found" });
    res.json({ problem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

export default router;
