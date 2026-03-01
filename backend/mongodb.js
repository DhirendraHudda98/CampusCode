import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// ============================================================
// IN-MEMORY FALLBACK DATABASE
// ============================================================

const memoryStore = {};

function getMemoryCollection(name) {
  if (!memoryStore[name]) memoryStore[name] = [];
  const docs = memoryStore[name];

  return {
    findOne(filter, options) {
      const doc = docs.find((d) => matchFilter(d, filter));
      if (!doc) return Promise.resolve(null);
      if (options?.projection) {
        const result = {};
        for (const key of Object.keys(doc)) {
          if (options.projection[key] === 0) continue;
          result[key] = doc[key];
        }
        return Promise.resolve(result);
      }
      return Promise.resolve({ ...doc });
    },
    find(filter, options) {
      let results = filter && Object.keys(filter).length
        ? docs.filter((d) => matchFilter(d, filter))
        : [...docs];
      if (options?.projection) {
        results = results.map((doc) => {
          const out = {};
          for (const key of Object.keys(doc)) {
            if (options.projection[key] === 0) continue;
            out[key] = doc[key];
          }
          return out;
        });
      }
      let _sortBy = null;
      let _limitN = 0;
      const chain = {
        sort(s) { _sortBy = s; return chain; },
        limit(n) { _limitN = n; return chain; },
        toArray() {
          if (_sortBy) {
            const key = Object.keys(_sortBy)[0];
            const dir = _sortBy[key];
            results.sort((a, b) => {
              const av = getNestedValue(a, key);
              const bv = getNestedValue(b, key);
              if (av < bv) return -1 * dir;
              if (av > bv) return 1 * dir;
              return 0;
            });
          }
          if (_limitN > 0) results = results.slice(0, _limitN);
          return Promise.resolve(results);
        },
      };
      return chain;
    },
    async insertOne(doc) {
      const _id = new ObjectId();
      const newDoc = { _id, ...doc };
      docs.push(newDoc);
      return { insertedId: _id };
    },
    async insertMany(arr) {
      const ids = [];
      for (const doc of arr) {
        const _id = new ObjectId();
        docs.push({ _id, ...doc });
        ids.push(_id);
      }
      return { insertedIds: ids };
    },
    async updateOne(filter, update) {
      const idx = docs.findIndex((d) => matchFilter(d, filter));
      if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };
      if (update.$set) Object.assign(docs[idx], update.$set);
      if (update.$inc) {
        for (const [key, val] of Object.entries(update.$inc)) {
          setNestedValue(docs[idx], key, (getNestedValue(docs[idx], key) || 0) + val);
        }
      }
      if (update.$push) {
        for (const [key, val] of Object.entries(update.$push)) {
          const arr = getNestedValue(docs[idx], key) || [];
          arr.push(val);
          setNestedValue(docs[idx], key, arr);
        }
      }
      return { matchedCount: 1, modifiedCount: 1 };
    },
    async deleteOne(filter) {
      const idx = docs.findIndex((d) => matchFilter(d, filter));
      if (idx === -1) return { deletedCount: 0 };
      docs.splice(idx, 1);
      return { deletedCount: 1 };
    },
    async deleteMany(filter) {
      if (!filter || Object.keys(filter).length === 0) {
        const count = docs.length;
        docs.length = 0;
        return { deletedCount: count };
      }
      let count = 0;
      for (let i = docs.length - 1; i >= 0; i--) {
        if (matchFilter(docs[i], filter)) {
          docs.splice(i, 1);
          count++;
        }
      }
      return { deletedCount: count };
    },
    async countDocuments(filter) {
      if (!filter || Object.keys(filter).length === 0) return docs.length;
      return docs.filter((d) => matchFilter(d, filter)).length;
    },
  };
}

function matchFilter(doc, filter) {
  if (!filter) return true;
  for (const [key, condition] of Object.entries(filter)) {
    if (key === "$or") {
      if (!condition.some((sub) => matchFilter(doc, sub))) return false;
      continue;
    }
    if (key === "$and") {
      if (!condition.every((sub) => matchFilter(doc, sub))) return false;
      continue;
    }
    const docVal = getNestedValue(doc, key);
    if (condition && typeof condition === "object" && !(condition instanceof ObjectId) && !(condition instanceof Date)) {
      if ("$gt" in condition && !(docVal > condition.$gt)) return false;
      if ("$gte" in condition && !(docVal >= condition.$gte)) return false;
      if ("$lt" in condition && !(docVal < condition.$lt)) return false;
      if ("$lte" in condition && !(docVal <= condition.$lte)) return false;
      if ("$ne" in condition) {
        const a = condition.$ne?.toString?.() ?? condition.$ne;
        const b = docVal?.toString?.() ?? docVal;
        if (a === b) return false;
      }
      if ("$in" in condition) {
        const vals = condition.$in.map((v) => v?.toString?.() ?? v);
        if (!vals.includes(docVal?.toString?.() ?? docVal)) return false;
      }
      if ("$regex" in condition) {
        const re = new RegExp(condition.$regex, condition.$options || "");
        if (!re.test(docVal)) return false;
      }
    } else {
      const a = condition?.toString?.() ?? condition;
      const b = docVal?.toString?.() ?? docVal;
      if (a !== b) return false;
    }
  }
  return true;
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  let target = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!target[keys[i]]) target[keys[i]] = {};
    target = target[keys[i]];
  }
  target[keys[keys.length - 1]] = value;
}

// ============================================================
// REAL OR MEMORY DB
// ============================================================

let clientPromise = null;

if (MONGODB_URI) {
  let cached = global._mongoClientPromise;
  if (!cached) {
    const client = new MongoClient(MONGODB_URI);
    cached = global._mongoClientPromise = client.connect();
  }
  clientPromise = cached;
}

export const isMemoryMode = !MONGODB_URI;
export { ObjectId };

export default clientPromise;

export async function getDb() {
  if (!MONGODB_URI) {
    return {
      collection(name) {
        return getMemoryCollection(name);
      },
    };
  }
  const client = await clientPromise;
  return client.db("codearena");
}
