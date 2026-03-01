import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";

function loadEnv(envPath) {
  try {
    const txt = fs.readFileSync(envPath, "utf8");
    const lines = txt.split(/\r?\n/);
    const obj = {};
    for (const l of lines) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) obj[m[1]] = m[2];
    }
    return obj;
  } catch (e) {
    return {};
  }
}

async function main() {
  const { fileURLToPath } = await import("url");
  const __filename = fileURLToPath(import.meta.url);
  const projectRoot = path.dirname(path.dirname(__filename));
  const env = loadEnv(path.join(projectRoot, ".env.local"));
  const uri = env.MONGODB_URI || "mongodb://localhost:27017/codearena";

  const placements = [
    {
      title: "Frontend Developer",
      company: "Meta",
      location: "Remote",
      salaryMin: 140000,
      salaryMax: 180000,
      jobType: "Full-time",
      description: "Join the React team and help build the future of the web.",
      requirements: [
        "3+ years of React experience",
        "Strong JavaScript fundamentals",
        "Experience with TypeScript",
        "Understanding of web performance",
      ],
      applicationDeadline: new Date("2026-03-31"),
      status: "active",
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Software Engineer",
      company: "Google",
      location: "Mountain View, CA",
      salaryMin: 150000,
      salaryMax: 200000,
      jobType: "Full-time",
      description: "We are looking for talented engineers to join our core infrastructure team.",
      requirements: [
        "BS in Computer Science or equivalent",
        "Strong problem-solving skills",
        "Experience with system design",
        "Proficiency in C++ or Java",
      ],
      applicationDeadline: new Date("2026-04-15"),
      status: "active",
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Frontend Developer",
      company: "Meta",
      location: "Remote",
      salaryMin: 140000,
      salaryMax: 180000,
      jobType: "Full-time",
      description: "Join the React team and help build the future of the web.",
      requirements: [
        "3+ years of React experience",
        "Strong JavaScript fundamentals",
        "Experience with TypeScript",
      ],
      applicationDeadline: new Date("2026-03-31"),
      status: "active",
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Backend Engineer",
      company: "Amazon",
      location: "Seattle, WA",
      salaryMin: 160000,
      salaryMax: 210000,
      jobType: "Full-time",
      description: "Build scalable infrastructure for millions of customers worldwide.",
      requirements: [
        "5+ years of backend development",
        "Experience with AWS",
        "Proficiency in Java, Go, or Python",
        "Knowledge of distributed systems",
      ],
      applicationDeadline: new Date("2026-04-30"),
      status: "active",
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Product Engineer",
      company: "Apple",
      location: "Cupertino, CA",
      salaryMin: 170000,
      salaryMax: 220000,
      jobType: "Full-time",
      description: "Create innovative experiences that delight millions of users.",
      requirements: [
        "4+ years of software engineering",
        "Experience with Swift or Objective-C",
        "Strong unit testing practices",
        "Passion for user experience",
      ],
      applicationDeadline: new Date("2026-05-15"),
      status: "active",
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Data Engineer",
      company: "Microsoft",
      location: "Remote",
      salaryMin: 140000,
      salaryMax: 190000,
      jobType: "Full-time",
      description: "Build data pipelines and analytics infrastructure at scale.",
      requirements: [
        "3+ years of data engineering",
        "SQL and Python expertise",
        "Experience with Apache Spark",
        "Cloud data warehouse knowledge",
      ],
      applicationDeadline: new Date("2026-04-20"),
      status: "active",
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("codearena");
    const collection = db.collection("placements");

    const count = await collection.countDocuments({});
    if (count > 0) {
      console.log(`Database already has ${count} placements. Aborting to avoid duplicates.`);
      return;
    }

    const result = await collection.insertMany(placements);
    console.log(`✅ Seeded ${result.insertedCount} placement opportunities:`);
    placements.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title} at ${p.company}`);
    });
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
