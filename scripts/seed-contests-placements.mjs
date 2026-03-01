/**
 * Seed script: Inserts sample contests and placements into MongoDB.
 * Run with: node scripts/seed-contests-placements.mjs
 */

import { MongoClient } from "mongodb";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Load dotenv from backend's node_modules
try {
  const dotenv = require(path.join(__dirname, "../backend/node_modules/dotenv"));
  dotenv.config({ path: path.join(__dirname, "../backend/.env") });
} catch {
  // fallback: try reading .env manually
  const fs = await import("fs");
  const envPath = path.join(__dirname, "../backend/.env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const [k, ...rest] = line.split("=");
      if (k && rest.length) process.env[k.trim()] = rest.join("=").trim();
    }
  }
}

const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/codearena";
const client = new MongoClient(URI);

const now = new Date();
const d  = (days)  => new Date(now.getTime() + days  * 86_400_000);

// ─── CONTESTS ────────────────────────────────────────────────────────────────
const CONTESTS = [
  {
    title: "Weekly Code Sprint #42",
    description:
      "Solve 4 algorithmic challenges ranging from easy to hard. Earn XP, climb the weekly leaderboard, and compete for exclusive badges.",
    startsAt: d(-1),           // Active right now
    endsAt:   d(1),
    duration: "48 hours",
    difficulty: "Mixed",
    prizes: ["🥇 500 XP + Gold Badge", "🥈 300 XP + Silver Badge", "🥉 150 XP + Bronze Badge"],
    problems: 4,
    participants: 312,
    tags: ["Algorithms", "Data Structures"],
    createdAt: d(-3),
  },
  {
    title: "Dynamic Programming Blitz",
    description:
      "A focused contest dedicated entirely to Dynamic Programming. Problems cover classic patterns: knapsack, LCS, coin change, matrix chain multiplication, and more.",
    startsAt: d(2),
    endsAt:   d(3),
    duration: "24 hours",
    difficulty: "Hard",
    prizes: ["🥇 800 XP + DP Master Badge", "🥈 500 XP", "🥉 250 XP"],
    problems: 6,
    participants: 0,
    tags: ["Dynamic Programming", "Optimization"],
    createdAt: d(-1),
  },
  {
    title: "Graph Algorithms Challenge",
    description:
      "Dive deep into graphs — BFS, DFS, Dijkstra, Floyd-Warshall, topological sort, and strongly connected components. Aimed at intermediate to advanced coders.",
    startsAt: d(5),
    endsAt:   d(6),
    duration: "24 hours",
    difficulty: "Hard",
    prizes: ["🥇 700 XP + Graph Expert Badge", "🥈 450 XP", "🥉 200 XP"],
    problems: 5,
    participants: 0,
    tags: ["Graphs", "BFS/DFS", "Shortest Path"],
    createdAt: d(-2),
  },
  {
    title: "Beginner Friendly Marathon",
    description:
      "Brand new to competitive programming? This 3-day marathon is perfect for beginners. Problems focus on arrays, strings, basic math and loops — no prior CP experience needed!",
    startsAt: d(7),
    endsAt:   d(10),
    duration: "72 hours",
    difficulty: "Easy",
    prizes: ["🥇 200 XP + Newcomer Badge", "🥈 120 XP", "🥉 60 XP"],
    problems: 8,
    participants: 0,
    tags: ["Beginner", "Arrays", "Strings"],
    createdAt: d(-1),
  },
  {
    title: "Sorting & Searching Classic",
    description:
      "Master sorting algorithms and binary search. Problems test your understanding of merge sort, quick sort, binary search variants, and their real-world applications.",
    startsAt: d(12),
    endsAt:   d(13),
    duration: "24 hours",
    difficulty: "Medium",
    prizes: ["🥇 400 XP + Sort Wizard Badge", "🥈 250 XP", "🥉 100 XP"],
    problems: 5,
    participants: 0,
    tags: ["Sorting", "Binary Search"],
    createdAt: d(0),
  },
  {
    title: "String Manipulation Sprint",
    description:
      "A 12-hour sprint focusing on string algorithms — KMP, Rabin-Karp, Z-algorithm, trie operations, and palindrome problems. Fast paced and highly competitive.",
    startsAt: d(14),
    endsAt:   d(14.5),
    duration: "12 hours",
    difficulty: "Medium",
    prizes: ["🥇 350 XP", "🥈 200 XP", "🥉 80 XP"],
    problems: 4,
    participants: 0,
    tags: ["Strings", "Pattern Matching"],
    createdAt: d(0),
  },
  {
    title: "Monthly Grand Championship",
    description:
      "The biggest contest of the month! 8 problems spanning all difficulty levels — from straightforward warmups to expert-level challenges. Top performers receive certificates.",
    startsAt: d(20),
    endsAt:   d(21),
    duration: "24 hours",
    difficulty: "Mixed",
    prizes: [
      "🥇 2000 XP + Champion Badge + Certificate",
      "🥈 1200 XP + Certificate",
      "🥉 600 XP + Certificate",
    ],
    problems: 8,
    participants: 0,
    tags: ["All Topics", "Championship"],
    createdAt: d(0),
  },
  {
    title: "Tree & Recursion Mastery",
    description:
      "From binary trees and BSTs to segment trees and Fenwick trees — this contest covers everything. Expect recursion-heavy problems that require clean, efficient solutions.",
    startsAt: d(25),
    endsAt:   d(26),
    duration: "24 hours",
    difficulty: "Hard",
    prizes: ["🥇 600 XP + Tree Ninja Badge", "🥈 380 XP", "🥉 180 XP"],
    problems: 5,
    participants: 0,
    tags: ["Trees", "Recursion", "Segment Trees"],
    createdAt: d(0),
  },
  // Ended contests
  {
    title: "Greedy Algorithms Cup",
    description:
      "A concluded contest focused on greedy algorithms. Problems included interval scheduling, activity selection, Huffman coding, and more.",
    startsAt: d(-10),
    endsAt:   d(-9),
    duration: "24 hours",
    difficulty: "Medium",
    prizes: ["🥇 400 XP", "🥈 250 XP", "🥉 100 XP"],
    problems: 5,
    participants: 287,
    tags: ["Greedy", "Algorithms"],
    createdAt: d(-12),
  },
  {
    title: "Bit Manipulation Blitz",
    description:
      "A past sprint dedicated to bit manipulation tricks — XOR games, bitmask DP, popcount and more. One of our most popular contests!",
    startsAt: d(-7),
    endsAt:   d(-6),
    duration: "24 hours",
    difficulty: "Medium",
    prizes: ["🥇 400 XP", "🥈 250 XP", "🥉 100 XP"],
    problems: 5,
    participants: 198,
    tags: ["Bit Manipulation", "Math"],
    createdAt: d(-9),
  },
];

// ─── PLACEMENTS ───────────────────────────────────────────────────────────────
const PLACEMENTS = [
  {
    title: "Software Development Engineer I",
    company: "Amazon",
    companyLogo: "AMZN",
    location: "Bangalore, India",
    jobType: "Full-time",
    salaryMin: 2000000,
    salaryMax: 3200000,
    description:
      "Join Amazon's world-class engineering teams to build and maintain services that handle millions of transactions daily. You'll work on high-traffic distributed systems, design RESTful APIs, and collaborate with cross-functional teams across the globe.",
    responsibilities: [
      "Design, develop, test, and deploy software solutions at scale",
      "Participate in code reviews and maintain high code quality standards",
      "Collaborate with product managers and designers to shape feature requirements",
      "Debug production issues and improve system observability",
      "Mentor junior developers in best practices",
    ],
    requirements: [
      "B.Tech/M.Tech in Computer Science or related field",
      "Strong proficiency in at least one OOP language (Java, Python, or C++)",
      "Solid understanding of data structures and algorithms",
      "Experience with REST APIs and microservices architecture",
      "Familiarity with AWS services (EC2, S3, Lambda)",
    ],
    niceToHave: ["System design experience", "Knowledge of CI/CD pipelines", "Open-source contributions"],
    skills: ["Java", "Python", "AWS", "REST APIs", "DSA", "Microservices"],
    bond: "None",
    openings: 15,
    deadline: d(20),
    applicants: [],
    createdAt: d(-5),
  },
  {
    title: "Frontend Engineer (React)",
    company: "Google",
    companyLogo: "GOOG",
    location: "Hyderabad, India",
    jobType: "Full-time",
    salaryMin: 2500000,
    salaryMax: 4000000,
    description:
      "Build the next generation of Google's web products used by billions. You'll work on large-scale web applications, define UI architecture, optimize performance, and ensure accessibility across diverse devices and screen sizes.",
    responsibilities: [
      "Build performant, accessible, and scalable React applications",
      "Lead frontend architecture decisions for new products",
      "Work with UX designers to implement pixel-perfect interfaces",
      "Write comprehensive unit and integration tests",
      "Optimize Core Web Vitals and page load performance",
    ],
    requirements: [
      "3+ years of experience building production React applications",
      "Strong knowledge of JavaScript (ES2022+), TypeScript, and CSS",
      "Experience with state management (Redux, Zustand, or similar)",
      "Understanding of browser rendering, performance optimization",
      "Excellent communication and collaboration skills",
    ],
    niceToHave: ["Experience with GraphQL", "Web accessibility (WCAG)", "Contributions to open-source UI libraries"],
    skills: ["React", "TypeScript", "CSS", "GraphQL", "Testing", "Web Performance"],
    bond: "None",
    openings: 8,
    deadline: d(15),
    applicants: [],
    createdAt: d(-8),
  },
  {
    title: "Backend Engineer – Python",
    company: "Flipkart",
    companyLogo: "FK",
    location: "Bangalore, India (Hybrid)",
    jobType: "Full-time",
    salaryMin: 1600000,
    salaryMax: 2600000,
    description:
      "Flipkart's platform processes millions of orders a day. As a backend engineer, you'll work on high-throughput services in the payments, search, or recommendations domain — building reliable, fault-tolerant, and scalable systems.",
    responsibilities: [
      "Develop and maintain Python-based backend services",
      "Design scalable APIs consumed by mobile and web clients",
      "Optimize database queries and manage large-scale data pipelines",
      "Participate in on-call rotations and incident response",
      "Write well-documented, testable code",
    ],
    requirements: [
      "B.Tech/M.Tech in CS/IT with 1–3 years experience",
      "Strong Python skills; Django or FastAPI preferred",
      "Experience with SQL and NoSQL databases (MySQL, MongoDB, Redis)",
      "Knowledge of message queues (Kafka, RabbitMQ)",
      "Good problem-solving and analytical skills",
    ],
    niceToHave: ["Experience with data engineering", "Machine learning model serving", "Kubernetes/Docker"],
    skills: ["Python", "Django/FastAPI", "MySQL", "Redis", "Kafka", "Docker"],
    bond: "None",
    openings: 12,
    deadline: d(25),
    applicants: [],
    createdAt: d(-3),
  },
  {
    title: "Full Stack Developer Intern",
    company: "Razorpay",
    companyLogo: "RPY",
    location: "Remote",
    jobType: "Internship",
    salaryMin: 50000,
    salaryMax: 80000,
    description:
      "Get hands-on experience at one of India's fastest-growing fintech companies. As a full-stack intern, you'll work on real features shipped to production — from React frontends to Node.js microservices — alongside experienced engineers.",
    responsibilities: [
      "Build features for Razorpay's dashboard and payment flows",
      "Write backend APIs using Node.js and Express",
      "Integrate with internal and third-party services",
      "Participate in design and code reviews",
      "Contribute to documentation and testing",
    ],
    requirements: [
      "Currently in 3rd or 4th year of B.Tech/B.E. in CS/IT",
      "Good knowledge of JavaScript (Node.js and React)",
      "Basic understanding of REST APIs and HTTP",
      "Familiarity with Git and collaborative workflows",
      "Eagerness to learn and ability to take ownership",
    ],
    niceToHave: ["Previous internship or project experience", "Knowledge of payment systems", "Side projects / GitHub profile"],
    skills: ["Node.js", "React", "JavaScript", "REST APIs", "Git"],
    bond: "None",
    duration: "6 months",
    openings: 5,
    deadline: d(10),
    applicants: [],
    createdAt: d(-2),
  },
  {
    title: "Data Engineer",
    company: "Microsoft",
    companyLogo: "MSFT",
    location: "Noida, India",
    jobType: "Full-time",
    salaryMin: 1800000,
    salaryMax: 3000000,
    description:
      "Microsoft's Azure data team is looking for skilled Data Engineers to design and maintain robust data pipelines that power analytics and AI products. You'll handle petabytes of data and ensure data quality, reliability, and governance.",
    responsibilities: [
      "Design and build ETL/ELT pipelines using Azure Data Factory and Spark",
      "Model and maintain data warehouses in Azure Synapse",
      "Ensure data quality through monitoring and automated tests",
      "Collaborate with data scientists to provide clean, reliable datasets",
      "Document data lineage and maintain data governance standards",
    ],
    requirements: [
      "2–4 years of experience in data engineering",
      "Strong SQL skills and experience with columnar databases",
      "Proficiency in Python or Scala for data processing",
      "Experience with Azure or equivalent cloud data services",
      "Knowledge of distributed computing frameworks (Spark, Hadoop)",
    ],
    niceToHave: ["Azure certifications (DP-203)", "Experience with streaming data (Kafka, Event Hubs)", "dbt or similar transformation tools"],
    skills: ["Python", "SQL", "Apache Spark", "Azure", "ETL", "Data Warehousing"],
    bond: "None",
    openings: 6,
    deadline: d(18),
    applicants: [],
    createdAt: d(-6),
  },
  {
    title: "DevOps / SRE Engineer",
    company: "Zomato",
    companyLogo: "ZMT",
    location: "Gurugram, India",
    jobType: "Full-time",
    salaryMin: 1500000,
    salaryMax: 2500000,
    description:
      "Zomato's infrastructure powers food delivery for 20+ million orders/month. As a DevOps/SRE engineer you'll ensure the reliability, scalability, and performance of the platform — managing Kubernetes clusters, CI/CD pipelines, and monitoring stacks.",
    responsibilities: [
      "Manage and optimize Kubernetes-based microservices in production",
      "Design and maintain CI/CD pipelines using GitHub Actions and ArgoCD",
      "Set up monitoring and alerting with Prometheus, Grafana, and PagerDuty",
      "Conduct load testing and capacity planning",
      "Respond to and resolve production incidents, perform post-mortems",
    ],
    requirements: [
      "2+ years of DevOps/SRE experience",
      "Strong knowledge of Kubernetes, Docker, and Helm charts",
      "Experience with CI/CD tools (GitHub Actions, Jenkins, ArgoCD)",
      "Solid Linux administration skills and scripting (Bash/Python)",
      "Familiarity with GCP or AWS infrastructure",
    ],
    niceToHave: ["CKA/CKS certification", "Experience with service meshes (Istio)", "Database administration (MySQL, Redis at scale)"],
    skills: ["Kubernetes", "Docker", "CI/CD", "GCP/AWS", "Linux", "Prometheus"],
    bond: "None",
    openings: 4,
    deadline: d(22),
    applicants: [],
    createdAt: d(-4),
  },
  {
    title: "Machine Learning Engineer",
    company: "PhonePe",
    companyLogo: "PPE",
    location: "Bangalore, India",
    jobType: "Full-time",
    salaryMin: 2200000,
    salaryMax: 3800000,
    description:
      "PhonePe processes 5+ billion transactions annually. The ML team builds fraud detection models, personalization engines, and credit scoring systems. You'll work on the full ML lifecycle — from data exploration to model deployment and monitoring in production.",
    responsibilities: [
      "Build, train, and evaluate ML/DL models for fraud and risk",
      "Deploy models using MLflow and internal serving infrastructure",
      "Design feature engineering pipelines at scale",
      "Collaborate with data analysts to identify business opportunities",
      "Monitor model drift and retrain as needed",
    ],
    requirements: [
      "M.Tech/M.S. in CS, Statistics, or related quantitative field (or equivalent experience)",
      "Strong Python skills with ML libraries (scikit-learn, PyTorch, XGBoost)",
      "Experience deploying models to production environments",
      "Understanding of statistics, probability, and feature engineering",
      "Familiarity with big data tools (Spark, Hive)",
    ],
    niceToHave: ["Experience with real-time ML serving", "Knowledge of financial fraud patterns", "Publications or Kaggle achievements"],
    skills: ["Python", "PyTorch", "scikit-learn", "Feature Engineering", "MLflow", "Spark"],
    bond: "None",
    openings: 3,
    deadline: d(30),
    applicants: [],
    createdAt: d(-7),
  },
  {
    title: "Android Developer",
    company: "CRED",
    companyLogo: "CRED",
    location: "Bangalore, India",
    jobType: "Full-time",
    salaryMin: 1400000,
    salaryMax: 2200000,
    description:
      "CRED's Android app is used by 10M+ premium users. You'll work on highly polished, performance-critical UI, implement new product features, and ensure the app provides a best-in-class experience across a wide range of Android devices.",
    responsibilities: [
      "Develop new features and maintain existing ones in CRED's Android app",
      "Ensure high performance and smooth animations across device variants",
      "Collaborate with designers to implement delightful micro-interactions",
      "Write unit and UI tests using JUnit and Espresso",
      "Optimize app size, startup time, and memory usage",
    ],
    requirements: [
      "2–4 years of Android development experience",
      "Strong Kotlin skills and familiarity with Jetpack Compose",
      "Experience with MVVM, Clean Architecture, and Dependency Injection (Hilt/Dagger)",
      "Knowledge of REST API integration and offline-first architecture",
      "Proficiency with Android Studio, profiler tools, and Play Console",
    ],
    niceToHave: ["Experience with custom animations and MotionLayout", "App performance optimization experience", "Knowledge of payment SDK integration"],
    skills: ["Kotlin", "Jetpack Compose", "MVVM", "Hilt", "REST APIs", "Android Studio"],
    bond: "None",
    openings: 5,
    deadline: d(12),
    applicants: [],
    createdAt: d(-5),
  },
];

async function seed() {
  await client.connect();
  const db = client.db();

  // Contests
  const contestsCol = db.collection("contests");
  const existingContests = await contestsCol.countDocuments();
  if (existingContests > 0) {
    console.log(`⚠️  Contests collection already has ${existingContests} documents. Dropping and re-seeding...`);
    await contestsCol.deleteMany({});
  }
  await contestsCol.insertMany(CONTESTS);
  console.log(`✅ Seeded ${CONTESTS.length} contests`);

  // Placements
  const placementsCol = db.collection("placements");
  const existingPlacements = await placementsCol.countDocuments();
  if (existingPlacements > 0) {
    console.log(`⚠️  Placements collection already has ${existingPlacements} documents. Dropping and re-seeding...`);
    await placementsCol.deleteMany({});
  }
  await placementsCol.insertMany(PLACEMENTS);
  console.log(`✅ Seeded ${PLACEMENTS.length} placements`);

  await client.close();
  console.log("\n🎉 All done! Restart your backend server to see the new data.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
