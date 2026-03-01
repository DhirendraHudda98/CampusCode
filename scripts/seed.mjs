import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

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
  const { fileURLToPath, pathToFileURL } = await import('url');
  const __filename = fileURLToPath(import.meta.url);
  const projectRoot = path.dirname(path.dirname(__filename));
  const env = loadEnv(path.join(projectRoot, '.env.local'));
  const uri = env.MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/codearena';

  // Import seed data (ES module)
  const seedModule = await import(pathToFileURL(path.join(projectRoot, 'lib', 'seed-data.js')).href);
  const seedProblems = seedModule.seedProblems || seedModule.default;
  if (!seedProblems || !Array.isArray(seedProblems)) {
    console.error('No seedProblems found in lib/seed-data.js');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('codearena');
    const problems = db.collection('problems');

    const count = await problems.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} problems. Aborting to avoid duplicates.`);
      return;
    }

    const docs = seedProblems.map((p) => ({ ...p, createdAt: new Date() }));
    const res = await problems.insertMany(docs);
    console.log(`Seeded ${res.insertedCount} problems.`);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
