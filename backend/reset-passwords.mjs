// Dev script: reset all user passwords to known values
import { getDb } from "./mongodb.js";
import bcrypt from "bcryptjs";

const resets = [
  { email: "dhirendra.hudda23@lpu.in",  password: "Admin@123",   note: "Dhiru (admin)" },
  { email: "kirtiahirwar608@gmail.com", password: "Student@123", note: "kirit (student)" },
  { email: "shivi@gm",                  password: "Teacher@123", note: "shivi (teacher)" },
  { email: "dhirendrahudda@gmail.com",  password: "Student@123", note: "Dhirendra (student)" },
  { email: "test@test.com",             password: "test123",     note: "testuser (student)" },
  { email: "mrteacher@campuscode.com",   password: "Teacher@123", note: "mrteacher (teacher)" },
  { email: "admin@campuscode.com",       password: "Admin@123",   note: "adminuser (admin)" },
  { email: "vivekdon@gmail.com",        password: "Student@123", note: "Vivek (student)" },
  { email: "vivek@gmail.com",           password: "Student@123", note: "Vivek12 (student)" },
  { email: "shivangi@gmail.com",        password: "Teacher@123", note: "Shivangi12 (teacher)" },
];

const db = await getDb();
console.log("Resetting passwords...\n");

for (const r of resets) {
  const hash = bcrypt.hashSync(r.password, 10);
  const result = await db.collection("users").updateOne(
    { email: r.email },
    { $set: { passwordHash: hash } }
  );
  if (result.matchedCount) {
    console.log(`✅ ${r.note}  |  ${r.email}  →  ${r.password}`);
  } else {
    console.log(`❌ Not found: ${r.email}`);
  }
}

console.log("\nAll done! Login credentials above.");
process.exit(0);
