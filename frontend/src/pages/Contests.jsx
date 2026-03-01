import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Trophy, Calendar, Clock, Users, Zap, Tag,
  CheckCircle, Lock, ChevronDown, ChevronUp,
  Star, BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function getStatus(c) {
  const now = Date.now();
  const start = c.startsAt ? new Date(c.startsAt).getTime() : null;
  const end   = c.endsAt   ? new Date(c.endsAt).getTime()   : null;
  if (!start) return { label: "Unknown", cls: "badge-gray" };
  if (now < start) return { label: "Upcoming", cls: "badge-blue" };
  if (!end || now < end) return { label: "Live Now", cls: "badge-easy" };
  return { label: "Ended", cls: "badge-gray" };
}

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function diffColor(d) {
  const m = { Easy: "badge-easy", Medium: "badge-medium", Hard: "badge-hard", Mixed: "badge-blue" };
  return m[d] || "badge-gray";
}

function ContestCard({ c, highlight, muted, onJoin }) {
  const [open, setOpen]       = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined]   = useState(false);
  const [msg, setMsg]         = useState("");
  const { user } = useAuth();
  const status = getStatus(c);
  const canJoin = status.label !== "Ended";

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (!user) { setMsg("login"); return; }
    if (user.role !== "student") { setMsg("notStudent"); return; }
    if (joined) return;
    setJoining(true);
    setMsg("");
    try {
      await axios.post(`/api/contests/${c._id}/join`, {}, { withCredentials: true });
      setJoined(true);
      setMsg("success");
      if (onJoin) onJoin(c._id);
    } catch (err) {
      const e2 = err.response?.data?.error || "Failed to join";
      if (e2.toLowerCase().includes("already")) { setJoined(true); setMsg("already"); }
      else setMsg(e2);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className={`ca-card transition-all duration-200 ${highlight ? "ring-2 ring-green-400 ring-offset-2" : ""} ${muted ? "opacity-60" : ""}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`badge ${status.cls}`}>{status.label}</span>
              {c.difficulty && <span className={`badge ${diffColor(c.difficulty)}`}>{c.difficulty}</span>}
              {(c.tags || []).map((t) => (
                <span key={t} className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  <Tag size={9} />{t}
                </span>
              ))}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">{c.title || "Untitled Contest"}</h3>
            {c.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.description}</p>}
          </div>
          {!muted && (
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <button
                onClick={handleJoin}
                disabled={joining || joined || !canJoin || (user && user.role !== "student")}
                className={`btn-sm font-semibold px-5 transition-all ${
                  joined ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
                  : (user && user.role !== "student") ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : canJoin ? "btn-primary"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                }`}
              >
                {joining ? (
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : joined ? <><CheckCircle size={13} /> Joined</>
                  : !canJoin ? "Ended"
                  : "Join Contest"}
              </button>
              {msg === "login" && (
                <p className="text-[11px] text-amber-600 flex items-center gap-1">
                  <Lock size={10} /> <a href="/login" className="underline">Login to join</a>
                </p>
              )}
              {msg === "notStudent" && (
                <p className="text-[11px] text-red-500">Only students can join contests</p>
              )}
              {msg === "success" && <p className="text-[11px] text-green-600 flex items-center gap-1"><CheckCircle size={10} /> Joined!</p>}
              {msg === "already" && <p className="text-[11px] text-blue-600">Already registered</p>}
              {msg && !["login","success","already"].includes(msg) && (
                <p className="text-[11px] text-red-500 max-w-[140px] text-right">{msg}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-400" />Starts: <strong className="text-slate-600">{fmt(c.startsAt)}</strong></span>
          {c.endsAt && <span className="flex items-center gap-1.5"><Clock size={12} className="text-red-400" />Ends: <strong className="text-slate-600">{fmt(c.endsAt)}</strong></span>}
          {c.duration && <span className="flex items-center gap-1.5"><Zap size={12} className="text-yellow-500" />{c.duration}</span>}
          {c.problems && <span className="flex items-center gap-1.5"><BookOpen size={12} className="text-purple-400" />{c.problems} Problems</span>}
          <span className="flex items-center gap-1.5"><Users size={12} className="text-emerald-400" />{(c.participants || 0).toLocaleString()} Participants</span>
        </div>
      </div>
      {c.prizes && c.prizes.length > 0 && (
        <>
          <div className="border-t border-slate-100">
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span className="flex items-center gap-2"><Trophy size={14} className="text-yellow-500" />Prizes &amp; Rewards</span>
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          {open && (
            <div className="px-5 pb-4 bg-amber-50 border-t border-amber-100">
              <ul className="mt-3 space-y-1.5">
                {c.prizes.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Star size={13} className="text-yellow-500 shrink-0" /><span className="text-slate-700">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    axios.get("/api/contests")
      .then((r) => setContests(r.data.contests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const live     = contests.filter((c) => getStatus(c).label === "Live Now");
  const upcoming = contests.filter((c) => getStatus(c).label === "Upcoming");
  const ended    = contests.filter((c) => getStatus(c).label === "Ended");
  const total    = contests.reduce((s, c) => s + (c.participants || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Trophy size={26} className="text-yellow-500" />Contests</h1>
        <p className="page-subtitle">Compete, improve, and climb the leaderboard</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Contests",     value: contests.length,             icon: Trophy,   cls: "text-yellow-500 bg-yellow-50" },
          { label: "Live Now",           value: live.length,                 icon: Zap,      cls: "text-green-600 bg-green-50"  },
          { label: "Upcoming",           value: upcoming.length,             icon: Calendar, cls: "text-blue-600 bg-blue-50"    },
          { label: "Total Participants", value: total.toLocaleString(),      icon: Users,    cls: "text-purple-600 bg-purple-50" },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="ca-card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cls}`}><Icon size={18} /></div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-none">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <svg className="spinner" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      ) : contests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Trophy size={24} /></div>
          <p className="text-slate-600 font-medium">No contests yet</p>
          <p className="text-sm text-slate-400 mt-1">Check back soon for upcoming contests</p>
        </div>
      ) : (
        <div className="space-y-10">
          {live.length > 0 && (
            <section>
              <h2 className="section-title flex items-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"/>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"/>
                </span>
                Live Now ({live.length})
              </h2>
              <div className="grid gap-4">{live.map((c) => <ContestCard key={c._id} c={c} highlight />)}</div>
            </section>
          )}
          {upcoming.length > 0 && (
            <section>
              <h2 className="section-title flex items-center gap-2 mb-4"><Calendar size={16} className="text-blue-500" />Upcoming ({upcoming.length})</h2>
              <div className="grid gap-4">{upcoming.map((c) => <ContestCard key={c._id} c={c} />)}</div>
            </section>
          )}
          {ended.length > 0 && (
            <section>
              <h2 className="section-title text-slate-400 mb-4">Past Contests ({ended.length})</h2>
              <div className="grid gap-3">{ended.map((c) => <ContestCard key={c._id} c={c} muted />)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
