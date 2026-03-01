import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  User,
  Trophy,
  Target,
  Flame,
  Calendar,
  Code2,
  BarChart3,
  Loader2,
  CheckCircle2,
  Zap,
  Building2,
  Award,
  Bookmark,
  Star,
  Medal,
  TrendingUp,
  ShieldCheck,
  Layers,
  Briefcase,
  CheckCircle,
  Clock,
} from "lucide-react";

// ─── Badge definitions ────────────────────────────────────────────────────────
const BADGE_DEFS = [
  { id: "first_solve",   label: "First Steps",      icon: "🎯", desc: "Solved your first problem",          check: s => s.solved >= 1 },
  { id: "solved_10",     label: "Problem Solver",   icon: "🔟", desc: "Solved 10 problems",                 check: s => s.solved >= 10 },
  { id: "solved_50",     label: "Code Enthusiast",  icon: "🔥", desc: "Solved 50 problems",                 check: s => s.solved >= 50 },
  { id: "solved_100",    label: "Code Champion",    icon: "🏆", desc: "Solved 100 problems",                check: s => s.solved >= 100 },
  { id: "streak_3",      label: "On Fire",          icon: "⚡", desc: "Maintained a 3-day streak",          check: s => s.streak >= 3 },
  { id: "streak_7",      label: "Week Warrior",     icon: "🗓️", desc: "Maintained a 7-day streak",          check: s => s.streak >= 7 },
  { id: "streak_30",     label: "Streak Legend",    icon: "🌟", desc: "Maintained a 30-day streak",         check: s => s.streak >= 30 },
  { id: "easy_10",       label: "Easy Expert",      icon: "💚", desc: "Solved 10 Easy problems",            check: s => s.easy >= 10 },
  { id: "medium_5",      label: "Medium Master",    icon: "🟡", desc: "Solved 5 Medium problems",           check: s => s.medium >= 5 },
  { id: "hard_1",        label: "Hard Hitter",      icon: "🔴", desc: "Solved 1 Hard problem",              check: s => s.hard >= 1 },
  { id: "score_500",     label: "High Scorer",      icon: "💯", desc: "Earned 500+ score",                  check: s => s.score >= 500 },
  { id: "submitter_50",  label: "Active Coder",     icon: "📬", desc: "Made 50 submissions",                check: s => s.totalSubmissions >= 50 },
];

export default function Profile() {
  const { user, loading, refreshUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [problems, setProblems] = useState({ easy: 0, medium: 0, hard: 0, all: [] });
  const [bookmarkedProblems, setBookmarkedProblems] = useState([]);
  const [appliedPlacements, setAppliedPlacements] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Always re-fetch from DB so stats are fresh after submissions
      await refreshUser();
      if (!mounted) return;
      try {
        const [subRes, probRes, bmRes, appRes] = await Promise.all([
          axios.get("/api/submissions", { withCredentials: true }),
          axios.get("/api/problems"),
          axios.get("/api/bookmarks", { withCredentials: true }).catch(() => ({ data: { problems: [] } })),
          axios.get("/api/placements/mine", { withCredentials: true }).catch(() => ({ data: { placements: [] } })),
        ]);
        if (mounted) {
          setSubmissions(subRes.data.submissions || []);
          const probs = probRes.data.problems || [];
          const easy   = probs.filter(p => p.difficulty?.toLowerCase() === "easy").length;
          const medium = probs.filter(p => p.difficulty?.toLowerCase() === "medium").length;
          const hard   = probs.filter(p => p.difficulty?.toLowerCase() === "hard").length;
          setProblems({ easy, medium, hard, all: probs });
          setBookmarkedProblems(bmRes.data.problems || []);
          setAppliedPlacements(appRes.data.placements || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setStatsLoading(false);
      }
    })();
    return () => (mounted = false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || statsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <User className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">Please login to view your profile</p>
      </div>
    );
  }

  const stats = user.stats || {
    solved: 0, easy: 0, medium: 0, hard: 0, streak: 0,
    totalSubmissions: 0, acceptedSubmissions: 0, score: 0,
  };

  // ── Compute earned badges ──────────────────────────────────────────────────
  const earnedBadges = BADGE_DEFS.filter(b => b.check(stats));

  // ── Topic-wise progress from submissions + problems ────────────────────────
  const solvedByCategory = {};
  const totalByCategory = {};
  const acceptedSlugs = new Set(
    submissions.filter(s => s.verdict === "Accepted").map(s => s.problemSlug)
  );
  (problems.all || []).forEach(p => {
    const cat = p.category || "Other";
    totalByCategory[cat] = (totalByCategory[cat] || 0) + 1;
    if (acceptedSlugs.has(p.slug)) solvedByCategory[cat] = (solvedByCategory[cat] || 0) + 1;
  });
  const topicProgress = Object.entries(totalByCategory)
    .map(([cat, total]) => ({ cat, total, solved: solvedByCategory[cat] || 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const heatmapData = generateHeatmap(submissions);
  const acceptanceRate =
    stats.totalSubmissions > 0
      ? ((stats.acceptedSubmissions / stats.totalSubmissions) * 100).toFixed(1)
      : "0.0";

  const contestsJoined   = user.contestsJoined   || [];
  const placementsApplied = user.placementsApplied || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Profile header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
          {user.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user.username}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">{user.role}</span>
            {user.createdAt && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard icon={CheckCircle2} label="Problems Solved" value={stats.solved} color="text-primary" />
        <StatsCard icon={Trophy} label="Total Score" value={stats.score} color="text-medium" />
        <StatsCard icon={Target} label="Acceptance Rate" value={`${acceptanceRate}%`} color="text-easy" />
        <StatsCard icon={Zap} label="Current Streak" value={`${stats.streak}d`} color="text-orange-500" />
        <StatsCard icon={Code2} label="Total Submissions" value={stats.totalSubmissions} color="text-muted-foreground" />
      </div>

      {/* Difficulty breakdown */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Difficulty Breakdown</h2>
        <div className="flex flex-col gap-3">
          <DifficultyBar label="Easy"   count={stats.easy}   total={problems.easy   || 1} color="bg-easy" />
          <DifficultyBar label="Medium" count={stats.medium} total={problems.medium || 1} color="bg-medium" />
          <DifficultyBar label="Hard"   count={stats.hard}   total={problems.hard   || 1} color="bg-hard" />
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Flame className="h-4 w-4 text-medium" /> Activity
        </h2>
        <div className="overflow-x-auto">
          <div className="flex gap-0.5">
            {heatmapData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`h-2.5 w-2.5 rounded-sm ${getHeatmapColor(day.count)}`}
                    title={`${day.date}: ${day.count} submissions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 className="h-4 w-4" /> Recent Submissions
        </h2>
        {submissions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No submissions yet. Start solving problems!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {submissions.slice(0, 10).map((s) => (
              <div key={s._id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{(s.problemSlug || s.problemTitle || "Unknown").replace(/-/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()} &middot; {s.passed ?? 0}/{s.total ?? 0} tests &middot; {s.language || "js"}
                  </p>
                </div>
                <span className={`text-xs font-semibold ${
                  s.verdict === "Accepted" ? "text-easy" : "text-hard"
                }`}>{s.verdict || s.status || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contests Joined */}
      {contestsJoined.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Award className="h-4 w-4 text-yellow-500" /> Contests Joined ({contestsJoined.length})
          </h2>
          <div className="flex flex-col gap-2">
            {contestsJoined.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <p className="text-sm font-medium text-foreground">{c.contestTitle || "Contest"}</p>
                <p className="text-xs text-muted-foreground">{new Date(c.joinedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placements Applied */}
      {placementsApplied.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Building2 className="h-4 w-4 text-blue-500" /> Placements Applied ({placementsApplied.length})
          </h2>
          <div className="flex flex-col gap-2">
            {placementsApplied.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.company}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(p.appliedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic-wise Progress */}
      {topicProgress.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="h-4 w-4 text-indigo-500" /> Topic-wise Progress
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {topicProgress.map(({ cat, total, solved }) => {
              const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{cat}</span>
                    <span className="text-muted-foreground">{solved}/{total} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievement Badges */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Medal className="h-4 w-4 text-yellow-500" /> Achievements
          <span className="ml-auto text-xs text-muted-foreground">{earnedBadges.length}/{BADGE_DEFS.length} earned</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {BADGE_DEFS.map(badge => {
            const earned = earnedBadges.some(b => b.id === badge.id);
            return (
              <div
                key={badge.id}
                title={badge.desc}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  earned
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                    : "bg-muted/30 border-border text-muted-foreground opacity-50 grayscale"
                }`}
              >
                <span className="text-lg leading-none">{badge.icon}</span>
                <div>
                  <div className="font-semibold">{badge.label}</div>
                  {earned && <div className="text-[10px] text-yellow-600 mt-0.5">Unlocked</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Applications */}
      {appliedPlacements.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Briefcase className="h-4 w-4 text-blue-500" /> My Applications ({appliedPlacements.length})
          </h2>
          <div className="flex flex-col gap-2">
            {appliedPlacements.map((a, i) => (
              <Link
                key={i}
                to="/placements"
                className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">{(a.company || "?").slice(0, 3)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle size={10} /> Applied
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarked Problems */}
      {bookmarkedProblems.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Bookmark className="h-4 w-4 text-amber-500" /> Bookmarked Problems ({bookmarkedProblems.length})
          </h2>
          <div className="flex flex-col gap-2">
            {bookmarkedProblems.map(p => (
              <Link
                key={p.slug}
                to={`/problems/${p.slug}`}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 hover:bg-muted/40 transition-colors"
              >
                <p className="text-sm font-medium text-foreground">{p.title}</p>
                <span className={`text-xs font-semibold ${
                  p.difficulty === "Easy" ? "text-easy" : p.difficulty === "Medium" ? "text-medium" : "text-hard"
                }`}>{p.difficulty}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function DifficultyBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex-1">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-xs font-semibold text-foreground">{count}/{total}</span>
    </div>
  );
}

function generateHeatmap(submissions) {
  const now = new Date();
  const weeks = [];
  const submissionCounts = {};

  submissions.forEach((s) => {
    const date = new Date(s.createdAt).toISOString().split("T")[0];
    submissionCounts[date] = (submissionCounts[date] || 0) + 1;
  });

  for (let w = 51; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      const dateStr = date.toISOString().split("T")[0];
      week.push({ date: dateStr, count: submissionCounts[dateStr] || 0 });
    }
    weeks.push(week);
  }

  return weeks;
}

function getHeatmapColor(count) {
  if (count === 0) return "bg-muted";
  if (count === 1) return "bg-primary/20";
  if (count === 2) return "bg-primary/40";
  if (count <= 4) return "bg-primary/70";
  return "bg-primary";
}
