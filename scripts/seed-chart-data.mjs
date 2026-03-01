import fs from 'fs';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';

function loadEnv(envPath) {
  try {
    const txt = fs.readFileSync(envPath, 'utf8');
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
  const { fileURLToPath } = await import('url');
  const __filename = fileURLToPath(import.meta.url);
  const projectRoot = path.dirname(path.dirname(__filename));
  const env = loadEnv(path.join(projectRoot, '.env.local'));
  const uri = env.MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/codearena';

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('codearena');

    // Get existing users and problems
    const users = await db.collection('users').find({}).toArray();
    const problems = await db.collection('problems').find({}).toArray();

    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      return;
    }
    if (problems.length === 0) {
      console.log('No problems found. Please seed problems first.');
      return;
    }

    // Clear existing submissions for fresh chart data
    await db.collection('submissions').deleteMany({});
    console.log('Cleared existing submissions.');

    const verdicts = ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'];
    const submissions = [];

    // Generate submissions for the last 14 days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

      // Random number of submissions per day (5-25)
      const submissionsPerDay = 5 + Math.floor(Math.random() * 21);

      for (let i = 0; i < submissionsPerDay; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const problem = problems[Math.floor(Math.random() * problems.length)];
        
        // Weight verdicts: more Accepted and Wrong Answer
        let verdict;
        const r = Math.random();
        if (r < 0.45) verdict = 'Accepted';
        else if (r < 0.75) verdict = 'Wrong Answer';
        else if (r < 0.85) verdict = 'Time Limit Exceeded';
        else if (r < 0.95) verdict = 'Runtime Error';
        else verdict = 'Compilation Error';

        const subDate = new Date(date);
        subDate.setMinutes(subDate.getMinutes() + i * 2);

        submissions.push({
          userId: user._id,
          username: user.username,
          problemId: problem._id,
          problemSlug: problem.slug,
          problemTitle: problem.title,
          language: ['javascript', 'python', 'cpp', 'java'][Math.floor(Math.random() * 4)],
          code: '// Sample code',
          verdict,
          runtime: verdict === 'Accepted' ? Math.floor(Math.random() * 500) + 10 : null,
          memory: verdict === 'Accepted' ? Math.floor(Math.random() * 50) + 5 : null,
          createdAt: subDate
        });
      }
    }

    const res = await db.collection('submissions').insertMany(submissions);
    console.log(`Seeded ${res.insertedCount} submissions for charts.`);

    // Update user stats based on accepted submissions
    const acceptedByUser = {};
    submissions.forEach(s => {
      if (s.verdict === 'Accepted') {
        if (!acceptedByUser[s.userId.toString()]) {
          acceptedByUser[s.userId.toString()] = new Set();
        }
        acceptedByUser[s.userId.toString()].add(s.problemSlug);
      }
    });

    for (const [userId, problemSet] of Object.entries(acceptedByUser)) {
      const solved = problemSet.size;
      const score = solved * 10 + Math.floor(Math.random() * 50);
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { 'stats.solved': solved, 'stats.score': score } }
      );
    }
    console.log('Updated user stats.');

  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
