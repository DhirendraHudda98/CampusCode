import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Lock, UserPlus, Code2, AlertCircle,
  Eye, EyeOff, CheckCircle, GraduationCap, BookOpen, ShieldCheck,
} from "lucide-react";

const ROLES = [
  {
    value: "student",
    label: "Student",
    icon: GraduationCap,
    desc: "Learn & solve problems",
    color: "blue",
  },
  {
    value: "teacher",
    label: "Teacher",
    icon: BookOpen,
    desc: "Create & manage content",
    color: "emerald",
  },
  {
    value: "admin",
    label: "Admin",
    icon: ShieldCheck,
    desc: "Full platform access",
    color: "purple",
  },
];

const colorMap = {
  blue:    { border: "border-blue-500",   bg: "bg-blue-50",   icon: "text-blue-600",   badge: "bg-blue-100 text-blue-700" },
  emerald: { border: "border-emerald-500", bg: "bg-emerald-50", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  purple:  { border: "border-purple-500", bg: "bg-purple-50", icon: "text-purple-600",  badge: "bg-purple-100 text-purple-700" },
};

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("student");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/auth/register", { username, email, password, role }, { withCredentials: true });
      // Registration succeeded — redirect by role
      if (role === "admin")   { navigate("/admin");   return; }
      if (role === "teacher") { navigate("/teacher"); return; }
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors   = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"];
  const pwLabels   = ["", "Weak", "Fair", "Strong"];

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide-up" style={{ maxWidth: 460 }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Code2 size={26} className="text-white" />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join thousands of coders on CampusCode</p>
        </div>

        {error && (
          <div className="alert-error flex items-center gap-2 mb-5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handle} className="space-y-5">

          {/* Role Selection */}
          <div className="ca-field">
            <label className="ca-label">I am a…</label>
            <div className="grid grid-cols-3 gap-2.5 mt-1">
              {ROLES.map(({ value, label, icon: Icon, desc, color }) => {
                const active = role === value;
                const c = colorMap[color];
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-150 cursor-pointer
                      ${active ? `${c.border} ${c.bg}` : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <Icon size={22} className={active ? c.icon : "text-slate-400"} />
                    <span className={`text-xs font-semibold ${active ? c.icon : "text-slate-600"}`}>{label}</span>
                    <span className="text-[10px] text-slate-400 leading-tight">{desc}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Selected role:{" "}
              <span className={`font-semibold px-1.5 py-0.5 rounded ${colorMap[ROLES.find(r => r.value === role)?.color || "blue"].badge}`}>
                {ROLES.find(r => r.value === role)?.label}
              </span>
            </p>
          </div>

          {/* Username */}
          <div className="ca-field">
            <label className="ca-label">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                className="ca-input pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div className="ca-field">
            <label className="ca-label">Email address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="ca-input pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="ca-field">
            <label className="ca-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="ca-input pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        n <= pwStrength ? pwColors[pwStrength] : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-500">{pwLabels[pwStrength]}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center btn-lg mt-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <UserPlus size={18} />
            )}
            {loading ? "Creating Account..." : `Create ${ROLES.find(r => r.value === role)?.label} Account`}
          </button>
        </form>

        {/* Benefits */}
        <div className="mt-5 flex flex-col gap-2">
          {[
            "Free forever — no credit card needed",
            "Access 1000+ coding problems",
            "AI-powered problem generation",
          ].map((b) => (
            <div key={b} className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle size={13} className="text-green-500 shrink-0" />
              {b}
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

