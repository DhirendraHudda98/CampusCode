import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env.local');

function loadEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const env = {};
    content.split('\n').forEach((line) => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv(envPath);
const MONGODB_URI = env.MONGODB_URI || 'mongodb://localhost:27017/codearena';

const contests = [
  {
    title: 'Weekly Contest 1',
    slug: 'weekly-1',
    description: 'Easy to Medium problems - Perfect for beginners',
    duration: 120,
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
    problemSlugs: ['two-sum', 'reverse-string', 'valid-parentheses', 'palindrome-number'],
    difficulty: 'Easy',
    tags: ['arrays', 'strings', 'stack'],
    participants: [],
    leaderboard: [],
    status: 'upcoming',
    isPublic: true,
    createdAt: new Date(),
  },
  {
    title: 'Average Rating Challenge',
    slug: 'rating-challenge',
    description: 'Medium difficulty contests to boost your rating',
    duration: 180,
    startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 180 * 60 * 1000),
    problemSlugs: ['longest-substring-without-repeating-characters', 'container-with-most-water', '3sum'],
    difficulty: 'Medium',
    tags: ['sliding-window', 'two-pointers', 'sorting'],
    participants: [],
    leaderboard: [],
    status: 'upcoming',
    isPublic: true,
    createdAt: new Date(),
  },
  {
    title: 'Biweekly Contest 1',
    slug: 'biweekly-1',
    description: 'Mix of Easy and Medium problems',
    duration: 150,
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 150 * 60 * 1000),
    problemSlugs: ['fizzbuzz', 'valid-parentheses', 'longest-substring-without-repeating-characters'],
    difficulty: 'Easy-Medium',
    tags: ['strings', 'stack', 'simulation'],
    participants: [],
    leaderboard: [],
    status: 'upcoming',
    isPublic: true,
    createdAt: new Date(),
  },
  {
    title: 'Code Sprint 2025',
    slug: 'sprint-2025',
    description: 'High-intensity programming sprint with varied problems',
    duration: 240,
    startTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    endTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 240 * 60 * 1000),
    problemSlugs: ['two-sum', 'fizzbuzz', 'longest-substring-without-repeating-characters', 'container-with-most-water', '3sum'],
    difficulty: 'Mixed',
    tags: ['arrays', 'strings', 'algorithms'],
    participants: [],
    leaderboard: [],
    status: 'upcoming',
    isPublic: true,
    createdAt: new Date(),
  },
  {
    title: 'Quick Fire - 30 Min Challenge',
    slug: 'quickfire-30',
    description: 'Fast-paced 30 minute challenge with 2 easy problems',
    duration: 30,
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    problemSlugs: ['palindrome-number', 'reverse-string'],
    difficulty: 'Easy',
    tags: ['strings', 'math'],
    participants: [],
    leaderboard: [],
    status: 'upcoming',
    isPublic: true,
    createdAt: new Date(),
  },
];

async function seedContests() {
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('codearena');
    const contestsCollection = db.collection('contests');

    // Check if contests already exist
    const existingCount = await contestsCollection.countDocuments({});
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} contests. Aborting to avoid duplicates.`);
      return;
    }

    // Insert contests
    const result = await contestsCollection.insertMany(contests);
    console.log(`Successfully seeded ${result.insertedIds.length} contests:`);
    contests.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.title} (${c.slug})`);
    });
  } catch (error) {
    console.error('Error seeding contests:', error);
  } finally {
    if (client) await client.close();
  }
}

seedContests();
