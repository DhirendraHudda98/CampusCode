import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Shield, Users, UserCheck, UserX, RefreshCw, Search, Trash2,
  Ban, CheckCircle2, ChevronDown, Trophy, Briefcase, Code2,
  BarChart3, FileText, AlertCircle, Pencil, X, Bell, MessageCircle, Send,
  Flag, AlertTriangle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
  LineChart, Line, ResponsiveContainer, Legend,
} from "recharts";

const ROLES = ["All", "student", "teacher", "admin"];
const TABS  = ["Users", "Platform Stats", "Charts", "Submissions", "Contests", "Problems", "Placements", "Discussions", "Reports", "Broadcast"];

function RoleBadge({ role }) {
  const map = {
    admin:   "bg-red-100 text-red-700 border-red-200",
    teacher: "bg-yellow-100 text-yellow-700 border-yellow-200",
    student: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return <span className={`badge border capitalize ${map[role] || "badge-gray"}`}>{role}</span>;
}

function VerdictBadge({ verdict }) {
  const map = {
    Accepted: "badge-easy",
    "Wrong Answer": "badge-hard",
    "Time Limit Exceeded": "badge-medium",
    "Runtime Error": "badge-hard",
    "Compilation Error": "badge-medium",
  };
  return <span className={`badge ${map[verdict] || "badge-medium"}`}>{verdict || "—"}</span>;
}

function Spinner() {
  return (
    <div className="loading-container min-h-[120px]">
      <svg className="spinner h-6 w-6" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );
}

// ─── Users Tab ───────────────────────────────────────────────────────────────
const PIE_COLORS = { Accepted: "#22c55e", "Wrong Answer": "#ef4444", "Time Limit Exceeded": "#f59e0b", "Runtime Error": "#8b5cf6" };

function ChartsTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    axios.get("/api/admin/charts", { withCredentials: true })
      .then(r => setData(r.data))
      .catch(() => setError("Failed to load chart data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (error)   return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!data)   return null;

  // Ensure arrays are defined with defaults
  const submissionsByDay = data.submissionsByDay || [];
  const verdictDistribution = data.verdictDistribution || [];
  const solvedByDifficulty = data.solvedByDifficulty || [];
  const topUsers = data.topUsers || [];

  return (
    <div className="space-y-6">

      {/* Submissions over last 7 days */}
      <div className="ca-card p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Submissions — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={submissionsByDay} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie + Bar side by side */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Verdict pie */}
        <div className="ca-card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Verdict Distribution</h3>
          {verdictDistribution.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No submissions yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={verdictDistribution}
                  dataKey="count" nameKey="verdict"
                  cx="50%" cy="50%" outerRadius={75}
                  label={({ verdict, percent }) => `${verdict} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {verdictDistribution.map(entry => (
                    <Cell key={entry.verdict} fill={PIE_COLORS[entry.verdict] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Difficulty bar */}
        <div className="ca-card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Problems Solved by Difficulty</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={solvedByDifficulty} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {solvedByDifficulty.map(entry => (
                  <Cell key={entry.name}
                    fill={entry.name === "Easy" ? "#22c55e" : entry.name === "Medium" ? "#f59e0b" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top users */}
      <div className="ca-card p-5">
        <h3 className="font-semibold text-slate-800 mb-4">🏆 Top 5 Users by Score</h3>
        {topUsers.length === 0 ? (
          <p className="text-slate-400 text-sm">No data available</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {topUsers.map((u, i) => (
              <div key={u.username} className="flex items-center gap-3 py-3">
                <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                  i === 0 ? "bg-yellow-100 text-yellow-700" :
                  i === 1 ? "bg-slate-100 text-slate-600" :
                  i === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-slate-50 text-slate-500"
                }`}>{i + 1}</span>
                <span className="font-medium text-slate-800 flex-1">{u.username}</span>
                <span className="text-sm font-semibold text-blue-600">{u.score} pts</span>
                <span className="text-xs text-slate-400 ml-2">{u.solved} solved</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UsersTab({ currentUserId }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [actionLoading, setActionLoading] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/users", { withCredentials: true });
      setUsers(res.data.users || []);
    } catch { /* denied */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const setAction = (id, val) => setActionLoading(p => ({ ...p, [id]: val }));

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    setAction(u._id, "delete");
    try {
      await axios.delete(`/api/admin/users/${u._id}`, { withCredentials: true });
      setUsers(p => p.filter(x => x._id !== u._id));
    } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
    finally { setAction(u._id, null); }
  };

  const toggleSuspend = async (u) => {
    setAction(u._id, "suspend");
    try {
      const res = await axios.patch(`/api/admin/users/${u._id}/suspend`, {}, { withCredentials: true });
      setUsers(p => p.map(x => x._id === u._id ? { ...x, suspended: res.data.suspended } : x));
    } catch (err) { alert(err.response?.data?.error || "Failed"); }
    finally { setAction(u._id, null); }
  };

  const changeRole = async (u, newRole) => {
    if (newRole === u.role) return;
    if (!window.confirm(`Change ${u.username}'s role to "${newRole}"?`)) return;
    setAction(u._id, "role");
    try {
      await axios.patch(`/api/admin/users/${u._id}/role`, { role: newRole }, { withCredentials: true });
      setUsers(p => p.map(x => x._id === u._id ? { ...x, role: newRole } : x));
    } catch (err) { alert(err.response?.data?.error || "Failed"); }
    finally { setAction(u._id, null); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (!q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
      && (roleFilter === "All" || u.role === roleFilter);
  });

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === "student").length,
    teachers: users.filter(u => u.role === "teacher").length,
    admins:   users.filter(u => u.role === "admin").length,
    suspended: users.filter(u => u.suspended).length,
  };

  return (
    <div>
      {/* User counts */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total", val: stats.total,     color: "text-slate-600" },
          { label: "Students", val: stats.students, color: "text-blue-600" },
          { label: "Teachers",  val: stats.teachers,  color: "text-yellow-600" },
          { label: "Admins",    val: stats.admins,    color: "text-red-600" },
          { label: "Suspended", val: stats.suspended, color: "text-orange-600" },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="ca-card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="ca-input pl-10 w-full" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ROLES.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border capitalize ${
                roleFilter === r ? "bg-red-100 text-red-700 border-red-300" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"
              }`}
            >{r}</button>
          ))}
        </div>
        <button onClick={fetchUsers} className="btn-secondary shrink-0"><RefreshCw size={14} /></button>
      </div>

      {/* Table */}
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Users size={24} /></div>
          <p className="text-slate-600 font-medium">{users.length === 0 ? "Access denied or no users" : "No matches"}</p>
        </div>
      ) : (
        <div className="ca-card overflow-x-auto">
          <table className="ca-table min-w-[680px]">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th className="hidden sm:table-cell">Score</th>
                <th className="hidden sm:table-cell">Joined</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const isSelf = u._id === currentUserId;
                const busy   = actionLoading[u._id];
                return (
                  <tr key={u._id} className={u.suspended ? "bg-orange-50/40" : ""}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                          u.role === "admin" ? "bg-gradient-to-br from-red-400 to-red-600"
                          : u.role === "teacher" ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                          : "bg-gradient-to-br from-blue-400 to-indigo-500"
                        }`}>
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 text-sm">{u.username}</div>
                          {isSelf && <div className="text-xs text-blue-400">(you)</div>}
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-500 text-sm">{u.email}</td>
                    <td>
                      {isSelf ? <RoleBadge role={u.role} /> : (
                        <div className="relative">
                          <select value={u.role} disabled={!!busy}
                            onChange={e => changeRole(u, e.target.value)}
                            className="appearance-none bg-transparent border border-slate-200 rounded px-2 py-0.5 text-xs font-medium cursor-pointer hover:border-blue-400 pr-6"
                          >
                            {["student","teacher","admin"].map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      )}
                    </td>
                    <td className="hidden sm:table-cell text-slate-500 text-sm">{u.stats?.score ?? 0}</td>
                    <td className="hidden sm:table-cell text-slate-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      {u.suspended
                        ? <span className="badge bg-orange-100 text-orange-700 border border-orange-200">Suspended</span>
                        : <span className="badge badge-easy">Active</span>
                      }
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => toggleSuspend(u)}
                              disabled={!!busy}
                              title={u.suspended ? "Activate" : "Suspend"}
                              className={`p-1.5 rounded transition-colors ${u.suspended ? "text-green-500 hover:bg-green-50" : "text-orange-400 hover:bg-orange-50"}`}
                            >
                              {u.suspended ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                            </button>
                            <button
                              onClick={() => deleteUser(u)}
                              disabled={!!busy}
                              title="Delete user"
                              className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Platform Stats Tab ───────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/admin/stats", { withCredentials: true })
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats)  return <div className="ca-card p-8 text-center text-slate-400">Failed to load stats</div>;

  const acceptance = stats.totalSubmissions > 0
    ? ((stats.acceptedSubs / stats.totalSubmissions) * 100).toFixed(1)
    : "0.0";

  const cards = [
    { label: "Total Users",      val: stats.totalUsers,       icon: Users,    color: "text-blue-600" },
    { label: "Total Problems",   val: stats.totalProblems,    icon: Code2,    color: "text-purple-600" },
    { label: "Total Submissions",val: stats.totalSubmissions, icon: FileText, color: "text-orange-600" },
    { label: "Accepted",         val: stats.acceptedSubs,     icon: CheckCircle2, color: "text-green-600" },
    { label: "Acceptance Rate",  val: `${acceptance}%`,       icon: BarChart3, color: "text-teal-600" },
    { label: "Total Contests",   val: stats.totalContests,    icon: Trophy,   color: "text-yellow-600" },
    { label: "Total Placements", val: stats.totalPlacements,  icon: Briefcase, color: "text-indigo-600" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="stat-card">
            <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wide mb-1 ${c.color}`}>
              <c.icon size={14} /> {c.label}
            </div>
            <div className={`text-2xl font-bold ${c.color}`}>{c.val}</div>
          </div>
        ))}
      </div>

      <div className="ca-card p-5">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Users size={16} /> Users by Role</h3>
        <div className="space-y-3">
          {Object.entries(stats.byRole || {}).map(([role, count]) => {
            const pct = stats.totalUsers > 0 ? (count / stats.totalUsers * 100).toFixed(0) : 0;
            const barColor = role === "admin" ? "bg-red-400" : role === "teacher" ? "bg-yellow-400" : "bg-blue-400";
            return (
              <div key={role}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize font-medium text-slate-700">{role}s</span>
                  <span className="text-slate-500">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Submissions Tab ──────────────────────────────────────────────────────────
function SubmissionsTab() {
  const [subs, setSubs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("All");

  useEffect(() => {
    axios.get("/api/admin/submissions", { withCredentials: true })
      .then(r => setSubs(r.data.submissions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const VERDICTS = ["All", "Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error"];
  const filtered = filter === "All" ? subs : subs.filter(s => s.verdict === filter);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {VERDICTS.map(v => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filter === v ? "bg-red-100 text-red-700 border-red-300" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}
          >{v}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="ca-card p-8 text-center text-slate-400"><FileText size={28} className="mx-auto mb-2" /> No submissions</div>
      ) : (
        <div className="ca-card overflow-x-auto">
          <table className="ca-table min-w-[640px]">
            <thead><tr><th>User</th><th>Problem</th><th>Lang</th><th>Verdict</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.slice(0, 100).map(s => (
                <tr key={s._id}>
                  <td className="text-slate-700 font-medium text-sm">{s.username || s.userId?.toString().slice(-6)}</td>
                  <td className="text-slate-600 text-sm">{s.problemSlug || "—"}</td>
                  <td className="text-slate-400 text-xs uppercase">{s.language || "—"}</td>
                  <td><VerdictBadge verdict={s.verdict} /></td>
                  <td className="text-slate-400 text-xs">{s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {Math.min(filtered.length, 100)} of {filtered.length} submissions
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quick Edit Modal (Admin) ─────────────────────────────────────────────────
function QuickEditModal({ item, apiPath, fields, title, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const f = {};
    fields.forEach(field => { f[field.key] = item[field.key] ?? ""; });
    return f;
  });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      await axios.patch(`/api/admin/${apiPath}/${item._id}`, form, { withCredentials: true });
      setMsg("Saved!");
      onSaved({ ...item, ...form });
      setTimeout(onClose, 700);
    } catch (err) {
      setMsg(err.response?.data?.error || "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><Pencil size={15} className="text-red-500" /> {title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{field.label}</label>
              {field.type === "select" ? (
                <select className="ca-input w-full" value={form[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}>
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : field.type === "textarea" ? (
                <textarea className="ca-input w-full" rows={3} value={form[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))} />
              ) : (
                <input type={field.type || "text"} className="ca-input w-full" value={form[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))} />
              )}
            </div>
          ))}
          {msg && <p className={`text-sm ${msg === "Saved!" ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Save"}</button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Manage List Tab (Contests / Problems / Placements) ───────────────────────
function ManageListTab({ apiPath, title, icon: Icon, editFields, editTitle, renderRow }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [search,  setSearch]  = useState("");

  const fetch = useCallback(() => {
    setLoading(true);
    axios.get(`/api/admin/${apiPath}`, { withCredentials: true })
      .then(r => setItems(r.data[apiPath] || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiPath]);

  useEffect(() => { fetch(); }, [fetch]);

  const del = async (id, label) => {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/admin/${apiPath}/${id}`, { withCredentials: true });
      setItems(p => p.filter(x => x._id !== id));
    } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
  };

  const filtered = search
    ? items.filter(i => JSON.stringify(i).toLowerCase().includes(search.toLowerCase()))
    : items;

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="ca-card p-3 mb-4 flex items-center gap-2">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}…`} className="bg-transparent outline-none flex-1 text-sm" />
        <span className="text-xs text-slate-400 shrink-0">{filtered.length} items</span>
      </div>
      {filtered.length === 0 ? (
        <div className="ca-card p-8 text-center text-slate-400"><Icon size={28} className="mx-auto mb-2" /> No {title.toLowerCase()}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item._id} className="ca-card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">{renderRow(item)}</div>
              <div className="flex gap-1 shrink-0">
                {editFields && (
                  <button onClick={() => setEditing(item)} title="Edit"
                    className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Pencil size={15} />
                  </button>
                )}
                <button onClick={() => del(item._id, item.title || item.company || item.name || "item")}
                  title="Delete"
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <QuickEditModal
          item={editing}
          apiPath={apiPath}
          fields={editFields}
          title={editTitle || `Edit ${title}`}
          onClose={() => setEditing(null)}
          onSaved={(updated) => { setItems(p => p.map(x => x._id === updated._id ? updated : x)); setEditing(null); }}
        />
      )}
    </div>
  );
}

// ─── Discussions Management Tab ───────────────────────────────────────────────
function DiscussionsTab() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    axios.get("/api/admin/discussions", { withCredentials: true })
      .then(r => setDiscussions(r.data.discussions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const del = async (id, title) => {
    if (!window.confirm(`Delete discussion "${title}"?`)) return;
    try {
      await axios.delete(`/api/admin/discussions/${id}`, { withCredentials: true });
      setDiscussions(p => p.filter(x => x._id !== id));
    } catch (err) { alert(err.response?.data?.error || "Delete failed"); }
  };

  const filtered = search
    ? discussions.filter(d => d.title?.toLowerCase().includes(search.toLowerCase()) || d.author?.toLowerCase().includes(search.toLowerCase()))
    : discussions;

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="ca-card p-3 mb-4 flex items-center gap-2">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions…" className="bg-transparent outline-none flex-1 text-sm" />
        <span className="text-xs text-slate-400 shrink-0">{filtered.length} posts</span>
      </div>
      {filtered.length === 0 ? (
        <div className="ca-card p-8 text-center text-slate-400"><MessageCircle size={28} className="mx-auto mb-2" /> No discussions</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => (
            <div key={d._id} className="ca-card p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 text-sm">{d.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  by <span className="font-medium text-slate-600">{d.author || "Anonymous"}</span>
                  {" · "}{new Date(d.createdAt).toLocaleDateString()}
                  {" · "}{d.likes || 0} likes · {d.replies?.length || 0} replies
                </div>
                {d.content && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.content}</p>}
              </div>
              <button onClick={() => del(d._id, d.title)}
                className="shrink-0 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Broadcast Tab ────────────────────────────────────────────────────────────
function BroadcastTab() {
  const [form, setForm] = useState({ title: "", message: "", type: "announcement", link: "/", targetRole: "" });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) { setMsg({ type: "error", text: "Title and message are required." }); return; }
    setSending(true); setMsg(null);
    try {
      const res = await axios.post("/api/admin/broadcast", form, { withCredentials: true });
      setMsg({ type: "success", text: `Sent to ${res.data.sent} user${res.data.sent !== 1 ? "s" : ""}!` });
      setForm({ title: "", message: "", type: "announcement", link: "/", targetRole: "" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Broadcast failed" });
    } finally { setSending(false); }
  };

  return (
    <div className="max-w-xl">
      <div className="ca-card p-6 mb-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <Bell size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Broadcast Notification</p>
            <p className="text-xs text-amber-700 mt-0.5">Send a notification to all users (or a specific role). Use responsibly.</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSend} className="ca-card p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Title <span className="text-red-500">*</span></label>
          <input className="ca-input w-full" value={form.title} onChange={f("title")} placeholder="e.g. Platform Maintenance Notice" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Message <span className="text-red-500">*</span></label>
          <textarea className="ca-input w-full" rows={4} value={form.message} onChange={f("message")} placeholder="Compose your announcement…" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Audience</label>
            <select className="ca-input w-full" value={form.targetRole} onChange={f("targetRole")}>
              <option value="">All Users</option>
              <option value="student">Students Only</option>
              <option value="teacher">Teachers Only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
            <select className="ca-input w-full" value={form.type} onChange={f("type")}>
              <option value="announcement">Announcement</option>
              <option value="contest">Contest</option>
              <option value="placement">Placement</option>
              <option value="alert">Alert</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Link (optional)</label>
          <input className="ca-input w-full" value={form.link} onChange={f("link")} placeholder="e.g. /contests or /placements" />
        </div>
        {msg && (
          <p className={`text-sm flex items-center gap-2 ${msg.type === "success" ? "text-green-600" : "text-red-500"}`}>
            {msg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {msg.text}
          </p>
        )}
        <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2">
          {sending ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</> : <><Send size={15} /> Send Broadcast</>}
        </button>
      </form>
    </div>
  );
}

// ─── Reports Tab ─────────────────────────────────────────────────────────────
function ReportsTab() {
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [actLoading, setActLoading] = useState({});

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/reports", { withCredentials: true });
      setReports(res.data.reports || []);
    } catch { /* denied */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const setAct = (id, val) => setActLoading(p => ({ ...p, [id]: val }));

  const dismissReport = async (report) => {
    if (!window.confirm(`Dismiss report against "${report.studentUsername}"? This will only remove the report.`)) return;
    setAct(report._id, "dismiss");
    try {
      await axios.delete(`/api/admin/reports/${report._id}`, { withCredentials: true });
      setReports(p => p.filter(r => r._id !== report._id));
    } catch (err) { alert(err.response?.data?.error || "Failed to dismiss"); }
    finally { setAct(report._id, null); }
  };

  const deleteStudent = async (report) => {
    if (!window.confirm(
      `DELETE student "${report.studentUsername}" permanently?\n\nThis will remove the user, all their submissions, and all reports about them. This CANNOT be undone.`
    )) return;
    setAct(report._id, "delete");
    try {
      await axios.delete(`/api/admin/reports/${report._id}/delete-user`, { withCredentials: true });
      // Remove all reports for the same student
      setReports(p => p.filter(r => r.studentId !== report.studentId));
    } catch (err) { alert(err.response?.data?.error || "Failed to delete student"); }
    finally { setAct(report._id, null); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="section-title flex items-center gap-2 mb-0">
          <Flag size={16} className="text-red-500" /> Student Reports
          {reports.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {reports.length}
            </span>
          )}
        </h2>
        <button onClick={fetchReports} className="btn-outline btn-sm flex items-center gap-1">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="ca-card p-10 text-center">
          <CheckCircle2 size={32} className="mx-auto text-green-400 mb-3" />
          <p className="text-slate-500 font-medium">No open reports</p>
          <p className="text-xs text-slate-400 mt-1">Teachers haven't filed any reports yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r._id} className="ca-card p-4 border-l-4 border-red-400">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Student info */}
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-red-500 shrink-0" />
                    <span className="font-semibold text-slate-800">{r.studentUsername}</span>
                    <span className="text-xs text-slate-400">{r.studentEmail}</span>
                    <span className="badge bg-blue-100 text-blue-700 border-blue-200 text-xs">student</span>
                  </div>

                  {/* Reason */}
                  <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2">
                    <p className="text-sm text-red-800">{r.reason}</p>
                  </div>

                  {/* Reporter info + date */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>
                      Reported by <span className="font-medium text-slate-600">{r.teacherUsername}</span>
                    </span>
                    <span>·</span>
                    <span>{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => deleteStudent(r)}
                    disabled={!!actLoading[r._id]}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete this student from the platform"
                  >
                    <Trash2 size={12} />
                    {actLoading[r._id] === "delete" ? "Deleting…" : "Delete Student"}
                  </button>
                  <button
                    onClick={() => dismissReport(r)}
                    disabled={!!actLoading[r._id]}
                    className="flex items-center gap-1.5 border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    title="Dismiss this report (no action taken)"
                  >
                    <X size={12} />
                    {actLoading[r._id] === "dismiss" ? "Dismissing…" : "Dismiss"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin component ────────────────────────────────────────────────────
export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Users");

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Shield size={26} className="text-red-500" />
            Admin Control Panel
          </h1>
          <p className="page-subtitle">Full platform management — logged in as <strong>{user?.username}</strong></p>
        </div>
        <span className="badge bg-red-100 text-red-700 border border-red-200 text-xs mt-1">Admin Only</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              tab === t ? "border-red-500 text-red-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >{t}</button>
        ))}
      </div>

      {tab === "Users"          && <UsersTab currentUserId={user?._id?.toString()} />}
      {tab === "Platform Stats" && <StatsTab />}
      {tab === "Charts"         && <ChartsTab />}
      {tab === "Submissions"    && <SubmissionsTab />}
      {tab === "Contests"       && (
        <ManageListTab apiPath="contests" title="Contests" icon={Trophy}
          editTitle="Edit Contest"
          editFields={[
            { key: "title",       label: "Title" },
            { key: "description", label: "Description",  type: "textarea" },
            { key: "difficulty",  label: "Difficulty",   type: "select", options: ["easy","medium","hard","mixed"] },
            { key: "prize",       label: "Prize / Reward" },
          ]}
          renderRow={c => (
            <>
              <div className="font-semibold text-slate-800">{c.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {c.createdByUsername || "Unknown"} · {new Date(c.startsAt || c.createdAt).toLocaleDateString()} ·{" "}
                <span className={`badge ${c.status === "active" ? "badge-easy" : c.status === "ended" ? "badge-hard" : "badge-medium"}`}>{c.status || "upcoming"}</span>
                {" · "}{c.participants || 0} participants
              </div>
            </>
          )}
        />
      )}
      {tab === "Problems"       && (
        <ManageListTab apiPath="problems" title="Problems" icon={Code2}
          editTitle="Edit Problem"
          editFields={[
            { key: "title",      label: "Title" },
            { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy","Medium","Hard"] },
            { key: "category",   label: "Category" },
          ]}
          renderRow={p => (
            <>
              <div className="font-semibold text-slate-800">{p.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {p.createdByUsername || "Unknown"} ·{" "}
                <span className={`badge ${p.difficulty === "Easy" ? "badge-easy" : p.difficulty === "Hard" ? "badge-hard" : "badge-medium"}`}>{p.difficulty}</span>
                {p.category && <> · {p.category}</>}
              </div>
            </>
          )}
        />
      )}
      {tab === "Placements"     && (
        <ManageListTab apiPath="placements" title="Placements" icon={Briefcase}
          editTitle="Edit Placement"
          editFields={[
            { key: "company",     label: "Company" },
            { key: "title",       label: "Job Title" },
            { key: "location",    label: "Location" },
            { key: "jobType",     label: "Job Type", type: "select", options: ["Full-time","Part-time","Internship","Contract","Remote"] },
            { key: "description", label: "Description", type: "textarea" },
          ]}
          renderRow={p => (
            <>
              <div className="font-semibold text-slate-800">{p.company} — {p.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {p.location} · <span className="badge badge-medium">{p.jobType}</span>
                {" · "}{p.applicantsCount || 0} applicants
                {p.deadline && <> · Deadline: {new Date(p.deadline).toLocaleDateString()}</>}
              </div>
            </>
          )}
        />
      )}
      {tab === "Discussions"    && <DiscussionsTab />}
      {tab === "Reports"        && <ReportsTab />}
      {tab === "Broadcast"      && <BroadcastTab />}
    </div>
  );
}


