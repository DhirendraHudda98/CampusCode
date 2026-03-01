import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Code2, Search, ChevronRight, Filter, Bookmark, BookMarked, Zap } from "lucide-react";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

function DiffBadge({ diff }) {
  const map = { Easy: "badge-easy", Medium: "badge-medium", Hard: "badge-hard" };
  return <span className={`badge ${map[diff] || "badge-gray"}`}>{diff}</span>;
}

export default function Problems() {
  const { user } = useAuth();
  const [problems, setProblems]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [diff, setDiff]             = useState("All");
  const [tagFilter, setTagFilter]   = useState("All");
  const [bookmarks, setBookmarks]   = useState(new Set());
  const [bmLoading, setBmLoading]   = useState({});
  const [showBookmarked, setShowBookmarked] = useState(false);

  const fetchProblems = useCallback(() => {
    axios.get("/api/problems")
      .then((r) => setProblems(r.data.problems || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get("/api/bookmarks", { withCredentials: true });
      setBookmarks(new Set((res.data.problems || []).map(p => p.slug)));
    } catch { /* not logged in */ }
  }, [user]);

  useEffect(() => {
    fetchProblems();
    fetchBookmarks();
  }, [fetchProblems, fetchBookmarks]);

  const toggleBookmark = async (e, slug) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setBmLoading(p => ({ ...p, [slug]: true }));
    try {
      const res = await axios.post(`/api/bookmarks/${slug}`, {}, { withCredentials: true });
      setBookmarks(prev => {
        const next = new Set(prev);
        res.data.bookmarked ? next.add(slug) : next.delete(slug);
        return next;
      });
    } catch { /* ignore */ }
    finally { setBmLoading(p => ({ ...p, [slug]: false })); }
  };

  // All unique tags across problems
  const allTags = ["All", ...new Set(problems.flatMap(p => p.tags || []).filter(Boolean))].slice(0, 20);

  const filtered = problems.filter((p) => {
    const matchDiff   = diff === "All" || p.difficulty === diff;
    const matchTag    = tagFilter === "All" || (p.tags || []).includes(tagFilter);
    const matchBm     = !showBookmarked || bookmarks.has(p.slug);
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
                        (p.category || "").toLowerCase().includes(search.toLowerCase());
    return matchDiff && matchSearch && matchTag && matchBm;
  });

  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  problems.forEach((p) => { if (counts[p.difficulty] !== undefined) counts[p.difficulty]++; });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Code2 size={26} className="text-blue-600" />
            Problems
          </h1>
          <p className="page-subtitle">{problems.length} problems available to practice</p>
        </div>
        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(counts).map(([d, n]) => (
            <span key={d} className={`badge ${d === "Easy" ? "badge-easy" : d === "Medium" ? "badge-medium" : "badge-hard"}`}>
              {d}: {n}
            </span>
          ))}
          {user && (
            <button
              onClick={() => setShowBookmarked(b => !b)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                showBookmarked ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
              }`}
            >
              {showBookmarked ? <BookMarked size={13} /> : <Bookmark size={13} />}
              Bookmarked ({bookmarks.size})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="ca-card p-4 mb-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems by title or category..."
              className="ca-input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <div className="flex gap-1">
              {DIFFICULTIES.map((d) => (
                <button key={d} onClick={() => setDiff(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    diff === d
                      ? d === "Easy"   ? "bg-green-100 text-green-700 border-green-300"
                      : d === "Medium" ? "bg-amber-100 text-amber-700 border-amber-300"
                      : d === "Hard"   ? "bg-red-100 text-red-700 border-red-300"
                      :                  "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}
                >{d}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Tag filter chips */}
        {allTags.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Zap size={13} className="text-slate-400 shrink-0" />
            {allTags.map(tag => (
              <button key={tag} onClick={() => setTagFilter(tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  tagFilter === tag
                    ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                }`}
              >{tag}</button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-container">
          <svg className="spinner" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Code2 size={24} /></div>
          <p className="text-slate-600 font-medium">No problems found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting the filters</p>
        </div>
      ) : (
        <div className="ca-card overflow-hidden">
          <table className="ca-table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Title</th>
                <th className="hidden sm:table-cell">Category</th>
                <th className="hidden md:table-cell">Tags</th>
                <th>Difficulty</th>
                <th className="hidden md:table-cell text-right">Acceptance</th>
                {user && <th className="w-10 text-center">Save</th>}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.slug} className="group cursor-pointer">
                  <td className="text-slate-400 text-xs font-medium">{i + 1}</td>
                  <td>
                    <Link
                      to={`/problems/${p.slug}`}
                      className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="badge-gray text-xs">{p.category || "—"}</span>
                  </td>
                  <td className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(p.tags || []).slice(0, 3).map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td><DiffBadge diff={p.difficulty} /></td>
                  <td className="hidden md:table-cell text-right text-slate-500 text-xs">
                    {p.acceptance != null ? `${p.acceptance}%` : "—"}
                  </td>
                  {user && (
                    <td className="text-center">
                      <button
                        onClick={(e) => toggleBookmark(e, p.slug)}
                        disabled={bmLoading[p.slug]}
                        title={bookmarks.has(p.slug) ? "Remove bookmark" : "Bookmark this problem"}
                        className="p-1 rounded hover:bg-amber-50 transition-colors"
                      >
                        {bookmarks.has(p.slug)
                          ? <BookMarked size={15} className="text-amber-500" />
                          : <Bookmark size={15} className="text-slate-300 group-hover:text-amber-400 transition-colors" />
                        }
                      </button>
                    </td>
                  )}
                  <td>
                    <ChevronRight size={15} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
