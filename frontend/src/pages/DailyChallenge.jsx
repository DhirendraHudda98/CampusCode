import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  CalendarDays, CheckCircle2, Code2, ChevronRight, Clock, Flame,
  Trophy, RefreshCw, Bookmark, BookMarked, Star,
} from "lucide-react";

function DiffBadge({ diff }) {
  const cls = diff === "Easy" ? "badge-easy" : diff === "Medium" ? "badge-medium" : "badge-hard";
  return <span className={`badge ${cls}`}>{diff}</span>;
}

function HistoryCard({ item }) {
  const isToday = item.isToday;
  const p = item.problem;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
      isToday ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:border-blue-200"
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isToday ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
      }`}>
        <CalendarDays size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-400">{item.date}</p>
          {isToday && <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-medium">Today</span>}
        </div>
        {p ? (
          <Link to={`/problems/${p.slug}`} className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1">
            {p.title}
          </Link>
        ) : (
          <p className="text-sm text-slate-400 italic">No problem available</p>
        )}
      </div>
      {p && <DiffBadge diff={p.difficulty} />}
    </div>
  );
}

export default function DailyChallenge() {
  const { user } = useAuth();
  const [daily, setDaily]     = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [bmLoading, setBmLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyRes, histRes] = await Promise.all([
          axios.get("/api/daily", { withCredentials: true }),
          axios.get("/api/daily/history"),
        ]);
        setDaily(dailyRes.data);
        setBookmarked(dailyRes.data.bookmarked || false);
        setHistory(histRes.data.history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleBookmark = async () => {
    if (!user || !daily?.problem) return;
    setBmLoading(true);
    try {
      const res = await axios.post(`/api/bookmarks/${daily.problem.slug}`, {}, { withCredentials: true });
      setBookmarked(res.data.bookmarked);
    } catch { /* ignore */ }
    finally { setBmLoading(false); }
  };

  const todayDate = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Flame size={26} className="text-orange-500" />
            Daily Challenge
          </h1>
          <p className="page-subtitle">{todayDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1">
            <Star size={12} /> Daily Pick
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <svg className="spinner" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      ) : !daily?.problem ? (
        <div className="empty-state">
          <div className="empty-icon"><Code2 size={24} /></div>
          <p className="text-slate-600 font-medium">No daily challenge available</p>
          <p className="text-sm text-slate-400 mt-1">Problems need to be added to the platform first</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main challenge card */}
          <div className="lg:col-span-2">
            <div className="ca-card p-6">
              {/* Status banner */}
              {daily.solved && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Challenge Completed!</p>
                    <p className="text-xs text-green-600">You've already solved today's problem. Come back tomorrow!</p>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-medium">Today's Problem</p>
                  <h2 className="text-xl font-bold text-slate-800">{daily.problem.title}</h2>
                  {daily.problem.category && (
                    <span className="badge-gray text-xs mt-1 inline-block">{daily.problem.category}</span>
                  )}
                </div>
                <DiffBadge diff={daily.problem.difficulty} />
              </div>

              {/* Tags */}
              {(daily.problem.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {daily.problem.tags.map(t => (
                    <span key={t} className="px-2 py-1 rounded-full text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 font-medium">{t}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  to={`/problems/${daily.problem.slug}`}
                  className="btn-primary flex items-center gap-2"
                >
                  <Code2 size={15} />
                  {daily.solved ? "View Problem" : "Solve Now"}
                  <ChevronRight size={15} />
                </Link>

                {user && (
                  <button
                    onClick={toggleBookmark}
                    disabled={bmLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      bookmarked
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-white border-slate-200 text-slate-600 hover:border-amber-300"
                    }`}
                  >
                    {bookmarked ? <BookMarked size={15} /> : <Bookmark size={15} />}
                    {bookmarked ? "Bookmarked" : "Bookmark"}
                  </button>
                )}
              </div>

              {/* Motivational tip */}
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">💡 Tip for today</p>
                <p className="text-sm text-blue-600">
                  {daily.problem.difficulty === "Easy"
                    ? "Focus on getting a clean, readable solution. Think about edge cases like empty inputs."
                    : daily.problem.difficulty === "Medium"
                    ? "Break the problem into smaller steps. Consider using a hash map or two-pointer approach."
                    : "Hard problems often need dynamic programming or graph algorithms. Start with brute-force and optimize."}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Streak card */}
            {user && (
              <div className="ca-card p-5 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Flame size={24} className="text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-slate-800">{user.stats?.streak || 0}</p>
                <p className="text-sm text-slate-500 font-medium">Day Streak</p>
                <p className="text-xs text-slate-400 mt-1">Keep solving daily to maintain your streak!</p>
              </div>
            )}

            {/* Stats card */}
            <div className="ca-card p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Your Progress</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Solved Total</span>
                  <span className="font-bold text-slate-800">{user?.stats?.solved || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Score</span>
                  <span className="font-bold text-slate-800">{user?.stats?.score || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Today's status</span>
                  <span className={`font-bold ${daily.solved ? "text-green-500" : "text-slate-400"}`}>
                    {daily.solved ? "✓ Solved" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last 7 days */}
      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            Recent Challenges (Last 7 Days)
          </h2>
          <div className="flex flex-col gap-2">
            {history.map((item, i) => <HistoryCard key={i} item={item} />)}
          </div>
        </div>
      )}
    </div>
  );
}
