import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, LogIn, Code2, AlertCircle, Eye, EyeOff, CheckCircle, ShieldOff } from "lucide-react";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [suspended, setSuspended] = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const registered = new URLSearchParams(location.search).get("registered");

  // Redirect helper based on role
  const redirectByRole = (role) => {
    if (role === "admin")   { navigate("/admin");   return; }
    if (role === "teacher") { navigate("/teacher"); return; }
    navigate("/");
  };

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setSuspended(false);
    setLoading(true);
    try {
      const data = await login(email, password);
      redirectByRole(data?.user?.role);
    } catch (err) {
      if (err.response?.data?.error === "SUSPENDED") {
        setSuspended(true);
      } else {
        setError(err.response?.data?.error || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Code2 size={26} className="text-white" />
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your CampusCode account</p>
        </div>

        {registered && (
          <div className="alert-success flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="shrink-0" />
            Account created! Please sign in.
          </div>
        )}

        {suspended && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldOff size={18} className="text-red-600 shrink-0" />
              <span className="font-bold text-red-700 text-sm">Account Suspended</span>
            </div>
            <p className="text-red-600 text-sm">
              Your account has been suspended by an administrator.<br />
              You cannot log in until the suspension is lifted.<br />
              Please contact support if you believe this is a mistake.
            </p>
          </div>
        )}

        {error && (
          <div className="alert-error flex items-center gap-2 mb-6">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handle} className="space-y-5">
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

          <div className="ca-field">
            <label className="ca-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
              <LogIn size={18} />
            )}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

