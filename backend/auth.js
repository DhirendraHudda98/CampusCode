import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

export function hashPassword(password) {
  return bcrypt.hashSync(password, 12);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Build a Set-Cookie header string for the auth token
export function createAuthCookie(token) {
  const isProd = process.env.NODE_ENV === "production";
  return `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${isProd ? "; Secure" : ""}`;
}

// For Express: Extract token from cookies
export function extractTokenFromCookies(req) {
  const cookies = req.headers.cookie?.split(";") || [];
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "token") return value;
  }
  return null;
}

export function getCurrentUser(req) {
  const token = extractTokenFromCookies(req);
  if (!token) return null;
  return verifyToken(token);
}

export function createClearCookie() {
  return "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}
