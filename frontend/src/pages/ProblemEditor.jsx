import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BookPlus, Save, AlertCircle, CheckCircle } from "lucide-react";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function ProblemEditor() {
  const [title, setTitle]         = useState("");
  const [slug, setSlug]           = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [category, setCategory]   = useState("");
  const [description, setDescription] = useState("");
  const [starterCode, setStarterCode] = useState("function solution(input) {\n  // Write your solution here\n  \n}");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const navigate = useNavigate();

  // Auto-generate slug from title
  const handleTitleChange = (t) => {
    setTitle(t);
    setSlug(t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title.trim() || !slug.trim() || !description.trim()) {
      setError("Title, slug, and description are required.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/problems", { title, slug, difficulty, category, description, starterCode }, { withCredentials: true });
      setSuccess("Problem created successfully!");
      setTimeout(() => navigate("/problems"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create problem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title flex items-center gap-2">
          <BookPlus size={26} className="text-blue-600" />
          Create Problem
        </h1>
        <p className="page-subtitle">Add a new coding problem to the platform</p>
      </div>

      {error && (
        <div className="alert-error flex items-center gap-2 mb-6">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="alert-success flex items-center gap-2 mb-6">
          <CheckCircle size={16} className="shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        {/* Basic info */}
        <div className="ca-card p-6">
          <h2 className="section-title">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="ca-field sm:col-span-2">
              <label className="ca-label">Title <span className="text-red-500">*</span></label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Two Sum"
                required
                className="ca-input"
              />
            </div>
            <div className="ca-field">
              <label className="ca-label">Slug (URL) <span className="text-red-500">*</span></label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="two-sum"
                required
                className="ca-input font-mono text-sm"
              />
              <span className="text-xs text-slate-400 mt-1">Auto-generated from title</span>
            </div>
            <div className="ca-field">
              <label className="ca-label">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Arrays, Strings, DP..."
                className="ca-input"
              />
            </div>
            <div className="ca-field sm:col-span-2">
              <label className="ca-label">Difficulty</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                      difficulty === d
                        ? d === "Easy"   ? "bg-green-100 text-green-700 border-green-400"
                        : d === "Medium" ? "bg-amber-100 text-amber-700 border-amber-400"
                        :                  "bg-red-100 text-red-700 border-red-400"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="ca-card p-6">
          <h2 className="section-title">Problem Description <span className="text-red-500">*</span></h2>
          <p className="text-xs text-slate-400 mb-3">Supports HTML. Describe the problem, constraints, and examples clearly.</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
            required
            className="ca-textarea font-mono text-sm"
          />
        </div>

        {/* Starter code */}
        <div className="ca-card p-6">
          <h2 className="section-title">Starter Code</h2>
          <p className="text-xs text-slate-400 mb-3">The initial code template shown to users.</p>
          <textarea
            value={starterCode}
            onChange={(e) => setStarterCode(e.target.value)}
            rows={8}
            className="ca-textarea font-mono text-sm bg-slate-50"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/problems")} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <Save size={16} />
            )}
            {loading ? "Creating..." : "Create Problem"}
          </button>
        </div>
      </form>
    </div>
  );
}

