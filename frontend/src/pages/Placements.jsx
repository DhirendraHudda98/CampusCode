import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Briefcase, MapPin, Clock, Search, Building2, DollarSign,
  CheckCircle, ChevronDown, ChevronUp, Users, Lock,
  Star, BookOpen, Zap, AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const JOB_TYPES = ["All", "Full-time", "Internship", "Remote", "Contract", "Part-time"];

function typeCls(t) {
  const m = {
    "Full-time":  "bg-blue-100 text-blue-700 border-blue-200",
    "Internship": "bg-purple-100 text-purple-700 border-purple-200",
    "Remote":     "bg-green-100 text-green-700 border-green-200",
    "Part-time":  "bg-amber-100 text-amber-700 border-amber-200",
    "Contract":   "bg-orange-100 text-orange-700 border-orange-200",
  };
  return m[t] || "bg-slate-100 text-slate-600 border-slate-200";
}

function fmtSalary(min, max) {
  const f = (n) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${(n / 1000).toFixed(0)}K`;
  if (min && max) return `₹${f(min)} – ₹${f(max)} / yr`;
  if (min) return `From ₹${f(min)} / yr`;
  if (max) return `Up to ₹${f(max)} / yr`;
  return null;
}

const LOGO_COLORS = [
  "from-blue-500 to-indigo-600","from-emerald-500 to-teal-600",
  "from-purple-500 to-violet-600","from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600","from-cyan-500 to-sky-600",
  "from-yellow-500 to-orange-500","from-lime-500 to-green-600",
];
function logoColor(name) {
  let h = 0;
  for (const c of (name || "")) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return LOGO_COLORS[Math.abs(h) % LOGO_COLORS.length];
}

function PlacementCard({ p, initApplied }) {
  const [open, setOpen]      = useState(false);
  const [applying, setAppl]  = useState(false);
  const [applied, setApplied]= useState(!!initApplied);
  const [msg, setMsg]        = useState("");
  const { user } = useAuth();

  // Sync when parent re-fetches applied IDs
  useEffect(() => { setApplied(!!initApplied); }, [initApplied]);

  const handleApply = async () => {
    if (!user) { setMsg("login"); return; }
    if (user.role !== "student") { setMsg("notStudent"); return; }
    if (applied) return;
    setAppl(true); setMsg("");
    try {
      await axios.post(`/api/placements/${p._id}/apply`, {}, { withCredentials: true });
      setApplied(true); setMsg("success");
    } catch (err) {
      const e = err.response?.data?.error || "Failed to apply";
      if (e.toLowerCase().includes("already")) { setApplied(true); setMsg("already"); }
      else setMsg(e);
    } finally { setAppl(false); }
  };

  const salary = fmtSalary(p.salaryMin, p.salaryMax);
  const deadlinePast = p.deadline && new Date(p.deadline) < new Date();
  const daysLeft = p.deadline
    ? Math.max(0, Math.ceil((new Date(p.deadline) - new Date()) / 86400000))
    : null;

  return (
    <div className="ca-card overflow-hidden">
      {/* Main section */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Company logo */}
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${logoColor(p.company)} flex items-center justify-center shrink-0 shadow-sm`}>
            <span className="text-white font-bold text-sm tracking-wide">
              {(p.companyLogo || p.company || "?").slice(0, 4)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{p.title}</h3>
                <p className="text-sm font-semibold text-blue-600 mt-0.5">{p.company}</p>
              </div>
              <span className={`badge border shrink-0 ${typeCls(p.jobType)}`}>{p.jobType || "Job"}</span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
              {p.location && (
                <span className="flex items-center gap-1"><MapPin size={11} />{p.location}</span>
              )}
              {salary && (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <DollarSign size={11} />{salary}
                </span>
              )}
              {p.openings && (
                <span className="flex items-center gap-1"><Users size={11} />{p.openings} openings</span>
              )}
              {p.duration && (
                <span className="flex items-center gap-1"><Clock size={11} />{p.duration}</span>
              )}
              {daysLeft !== null && (
                <span className={`flex items-center gap-1 font-medium ${deadlinePast ? "text-red-500" : daysLeft <= 7 ? "text-amber-600" : "text-slate-400"}`}>
                  <Clock size={11} />
                  {deadlinePast ? "Deadline passed"
                    : daysLeft === 0 ? "Closes today"
                    : `${daysLeft}d left`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {p.description && (
          <p className="mt-4 text-sm text-slate-600 leading-relaxed line-clamp-3">{p.description}</p>
        )}

        {/* Skills */}
        {p.skills && p.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.skills.map((s) => (
              <span key={s} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">{s}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={handleApply}
            disabled={applying || applied || deadlinePast || (user && user.role !== "student")}
            className={`btn-sm font-semibold px-6 transition-all ${
              applied ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
              : deadlinePast ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              : "btn-primary"
            }`}
          >
            {applying ? (
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : applied ? <><CheckCircle size={13} /> Applied</>
              : deadlinePast ? "Closed"
              : <><Briefcase size={13} /> Apply Now</>}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="btn-sm btn-outline gap-1.5"
          >
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {open ? "Hide Details" : "View Details"}
          </button>

          {msg === "login" && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Lock size={11} /> <a href="/login" className="underline">Login to apply</a>
            </p>
          )}
          {msg === "notStudent" && (
            <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} /> Only students can apply to placements</p>
          )}
          {msg === "success" && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={11} /> Application submitted!</p>}
          {msg === "already" && <p className="text-xs text-blue-600">Already applied</p>}
          {msg && !["login","success","already"].includes(msg) && (
            <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{msg}</p>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 grid sm:grid-cols-2 gap-6">
          {/* Responsibilities */}
          {p.responsibilities && p.responsibilities.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Zap size={14} className="text-blue-500" /> Responsibilities
              </h4>
              <ul className="space-y-1.5">
                {p.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5" />{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {p.requirements && p.requirements.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-purple-500" /> Requirements
              </h4>
              <ul className="space-y-1.5">
                {p.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <Star size={12} className="text-amber-500 shrink-0 mt-0.5" />{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nice to have */}
          {p.niceToHave && p.niceToHave.length > 0 && (
            <div className="sm:col-span-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Star size={14} className="text-yellow-500" /> Nice to Have
              </h4>
              <div className="flex flex-wrap gap-2">
                {p.niceToHave.map((n, i) => (
                  <span key={i} className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1 rounded-full">{n}</span>
                ))}
              </div>
            </div>
          )}

          {/* Details summary */}
          <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
            {[
              { label: "Job Type",   value: p.jobType      },
              { label: "Location",   value: p.location     },
              { label: "Openings",   value: p.openings ? `${p.openings} positions` : "—" },
              { label: "Deadline",   value: p.deadline ? new Date(p.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Open" },
              { label: "Bond",       value: p.bond || "None" },
              { label: "Salary",     value: salary || "As per industry" },
              { label: "Applicants", value: `${(p.applicants || []).length} applied` },
              p.duration ? { label: "Duration", value: p.duration } : null,
            ].filter(Boolean).map(({ label, value }) => (
              <div key={label} className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Placements() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [appliedIds, setAppliedIds] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    const fetches = [
      axios.get("/api/placements").then(r => setPlacements(r.data.placements || [])),
    ];
    if (user) {
      fetches.push(
        axios.get("/api/placements/mine", { withCredentials: true })
          .then(r => {
            const ids = (r.data.placements || []).map(a => a.placementId?.toString?.());
            setAppliedIds(new Set(ids.filter(Boolean)));
          })
          .catch(() => {})
      );
    }
    Promise.all(fetches).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const filtered = placements.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [p.title, p.company, p.location].some((f) => f?.toLowerCase().includes(q));
    const matchType   = typeFilter === "All" || p.jobType === typeFilter;
    return matchSearch && matchType;
  });

  const totalOpenings = placements.reduce((s, p) => s + (p.openings || 1), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Briefcase size={26} className="text-blue-600" />Placements</h1>
        <p className="page-subtitle">{placements.length} opportunities · {totalOpenings}+ openings available</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Companies",    value: new Set(placements.map((p) => p.company)).size, cls: "text-blue-600 bg-blue-50" },
          { label: "Full-time",    value: placements.filter((p) => p.jobType === "Full-time").length,  cls: "text-emerald-600 bg-emerald-50" },
          { label: "Internships",  value: placements.filter((p) => p.jobType === "Internship").length, cls: "text-purple-600 bg-purple-50" },
          { label: "Remote Jobs",  value: placements.filter((p) => p.jobType === "Remote" || p.location?.toLowerCase().includes("remote")).length, cls: "text-amber-600 bg-amber-50" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="ca-card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cls}`}><Briefcase size={17} /></div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-none">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="ca-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, company, skill or location..."
            className="ca-input pl-10"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {JOB_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                typeFilter === t
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <svg className="spinner" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Briefcase size={24} /></div>
          <p className="text-slate-600 font-medium">No placements found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting the search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => <PlacementCard key={p._id} p={p} initApplied={appliedIds.has(p._id?.toString())} />)}
        </div>
      )}
    </div>
  );
}
