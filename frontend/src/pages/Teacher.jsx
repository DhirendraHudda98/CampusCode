import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, BookPlus, Code2, Users, ChevronRight, Zap,
  GraduationCap, Trophy, Briefcase, PlusCircle, Trash2,
  CalendarDays, MapPin, Building2, FileCode2, CheckCircle2, XCircle,
  BookOpen, Brain, Layers, ChevronDown, ChevronUp,
  Pencil, X, Eye, UserCheck, Flag, AlertTriangle,
} from "lucide-react";

const TABS = ["Dashboard", "Create Contest", "Create Placement", "Prep Material", "My Content", "Student Activity"];

const PREP_CATEGORIES = ["Viva / Core CS", "DSA", "System Design", "HR & Behavioral", "Resume & Tips"];
const PREP_TYPES = ["Notes", "Q&A", "Tips", "Resource Link"];

// ─── helpers ────────────────────────────────────────────────────────────────
function InputField({ label, type = "text", value, onChange, required, placeholder, min }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} min={min}
        className="ca-input w-full" />
    </div>
  );
}
function TextareaField({ label, value, onChange, rows = 3, placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <textarea value={value} onChange={onChange} rows={rows} required={required} placeholder={placeholder}
        className="ca-input w-full resize-y" />
    </div>
  );
}
function Alert({ type, msg, onClose }) {
  if (!msg) return null;
  const cls = type === "error" ? "bg-red-50 border-red-300 text-red-700" : "bg-green-50 border-green-300 text-green-700";
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm flex items-center justify-between ${cls}`}>
      <span>{msg}</span>
      <button onClick={onClose} className="ml-4 font-bold opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

// ─── Create Prep Material form ───────────────────────────────────────────────
function CreatePrepMaterial({ onCreated }) {
  const [form, setForm] = useState({
    title: "", category: "Viva / Core CS", topic: "", type: "Notes",
    content: "", tags: "", difficulty: "Medium",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await axios.post("/api/prep", form, { withCredentials: true });
      setMsg({ type: "success", text: "Material published successfully! Students can see it in Prep section." });
      setForm({ title: "", category: "Viva / Core CS", topic: "", type: "Notes", content: "", tags: "", difficulty: "Medium" });
      onCreated?.();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Failed to publish material" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-2xl">
      <h2 className="section-title flex items-center gap-2"><BookOpen size={18} className="text-indigo-500" /> Add Preparation Material</h2>
      <p className="text-sm text-slate-500 -mt-2">Published materials appear in the student-facing Prep section under your name.</p>
      <Alert type={msg?.type} msg={msg?.text} onClose={() => setMsg(null)} />

      <InputField label="Title" value={form.title} onChange={f("title")} required placeholder="e.g. What is a deadlock? How to avoid it?" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Category<span className="text-red-500 ml-0.5">*</span></label>
          <select value={form.category} onChange={f("category")} className="ca-input w-full">
            {PREP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Type<span className="text-red-500 ml-0.5">*</span></label>
          <select value={form.type} onChange={f("type")} className="ca-input w-full">
            {PREP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="Topic / Subject" value={form.topic} onChange={f("topic")} placeholder="e.g. Operating Systems, Arrays" />
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Difficulty</label>
          <select value={form.difficulty} onChange={f("difficulty")} className="ca-input w-full">
            {["Easy", "Medium", "Hard"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <TextareaField
        label={form.type === "Q&A" ? "Question & Answer (write Q: ... A: ... or full explanation)" : "Content"}
        value={form.content} onChange={f("content")} rows={6} required
        placeholder={form.type === "Q&A"
          ? "Q: What is a deadlock?\nA: A deadlock occurs when two or more processes wait for each other indefinitely…"
          : form.type === "Resource Link"
          ? "https://... — Brief description of the resource"
          : "Write your notes, tips, or explanation here…"}
      />

      <InputField label="Tags (comma-separated)" value={form.tags} onChange={f("tags")} placeholder="e.g. OS, deadlock, synchronization" />

      <button type="submit" disabled={saving} className="btn-primary">
        {saving
          ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Publishing…</>
          : <><PlusCircle size={15} /> Publish Material</>}
      </button>
    </form>
  );
}

// ─── My Prep Materials ───────────────────────────────────────────────────────
function MyPrepMaterials({ materials, onDelete }) {
  const [expanded, setExpanded] = useState(null);
  const catColors = {
    "Viva / Core CS": "bg-purple-100 text-purple-700 border-purple-200",
    "DSA": "bg-blue-100 text-blue-700 border-blue-200",
    "System Design": "bg-green-100 text-green-700 border-green-200",
    "HR & Behavioral": "bg-orange-100 text-orange-700 border-orange-200",
    "Resume & Tips": "bg-pink-100 text-pink-700 border-pink-200",
  };

  if (materials.length === 0) return (
    <div className="ca-card p-8 text-center text-slate-400 text-sm">
      <BookOpen size={28} className="mx-auto mb-2 text-slate-300" />
      No prep materials yet. Use the "Prep Material" tab to add some.
    </div>
  );

  return (
    <div className="space-y-3">
      {materials.map(m => (
        <div key={m._id} className="ca-card overflow-hidden">
          <button
            onClick={() => setExpanded(p => p === m._id ? null : m._id)}
            className="w-full p-4 flex items-start gap-3 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge border text-xs capitalize ${catColors[m.category] || "badge-gray"}`}>{m.category}</span>
                <span className="badge badge-gray text-xs">{m.type}</span>
                {m.topic && <span className="text-xs text-slate-400">{m.topic}</span>}
              </div>
              <p className="font-semibold text-slate-800 mt-1 text-sm">{m.title}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(m._id); }}
                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={14} />
              </button>
              {expanded === m._id ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
            </div>
          </button>
          {expanded === m._id && (
            <div className="border-t border-slate-100 px-4 pb-4 pt-3">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 rounded-lg p-3">{m.content}</pre>
              {m.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {m.tags.map(t => <span key={t} className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded border border-indigo-100">{t}</span>)}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-2">Created {new Date(m.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Contest form ────────────────────────────────────────────────────────────
function CreateContest({ onCreated }) {
  const [form, setForm] = useState({
    title: "", description: "", difficulty: "medium",
    startDate: "", endDate: "", duration: "", prize: "", tags: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await axios.post("/api/teacher/contests", {
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      }, { withCredentials: true });
      setMsg({ type: "success", text: "Contest created successfully!" });
      setForm({ title: "", description: "", difficulty: "medium", startDate: "", endDate: "", duration: "", prize: "", tags: "" });
      onCreated?.();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Failed to create contest" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-2xl">
      <h2 className="section-title flex items-center gap-2"><Trophy size={18} className="text-purple-500" /> Create Contest</h2>
      <Alert type={msg?.type} msg={msg?.text} onClose={() => setMsg(null)} />
      <InputField label="Title" value={form.title} onChange={f("title")} required placeholder="e.g. Weekly Challenge #12" />
      <TextareaField label="Description" value={form.description} onChange={f("description")} required rows={4}
        placeholder="Describe the contest, rules, and objectives…" />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Start Date & Time" type="datetime-local" value={form.startDate} onChange={f("startDate")} required />
        <InputField label="End Date & Time" type="datetime-local" value={form.endDate} onChange={f("endDate")} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Difficulty</label>
          <select value={form.difficulty} onChange={f("difficulty")} className="ca-input w-full">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <InputField label="Duration (minutes)" type="number" value={form.duration} onChange={f("duration")} placeholder="e.g. 120" min="5" />
      </div>
      <InputField label="Prize / Rewards" value={form.prize} onChange={f("prize")} placeholder="e.g. Certificates, Swag, Cash prizes" />
      <InputField label="Tags (comma-separated)" value={form.tags} onChange={f("tags")} placeholder="e.g. arrays, dp, graphs" />
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Creating…</> : <><PlusCircle size={15} /> Create Contest</>}
      </button>
    </form>
  );
}

// ─── Placement form ──────────────────────────────────────────────────────────
function CreatePlacement({ onCreated }) {
  const [form, setForm] = useState({
    company: "", title: "", location: "", jobType: "Full-time",
    salaryMin: "", salaryMax: "", description: "", requirements: "",
    responsibilities: "", skills: "", openings: "1", deadline: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await axios.post("/api/teacher/placements", {
        ...form,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      }, { withCredentials: true });
      setMsg({ type: "success", text: "Placement opportunity posted!" });
      setForm({ company: "", title: "", location: "", jobType: "Full-time", salaryMin: "", salaryMax: "", description: "", requirements: "", responsibilities: "", skills: "", openings: "1", deadline: "" });
      onCreated?.();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Failed to create placement" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-2xl">
      <h2 className="section-title flex items-center gap-2"><Briefcase size={18} className="text-blue-500" /> Post Placement Opportunity</h2>
      <Alert type={msg?.type} msg={msg?.text} onClose={() => setMsg(null)} />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Company Name" value={form.company} onChange={f("company")} required placeholder="e.g. Google" />
        <InputField label="Job Title" value={form.title} onChange={f("title")} required placeholder="e.g. SDE Intern" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Location" value={form.location} onChange={f("location")} required placeholder="e.g. Bangalore, Remote" />
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Job Type</label>
          <select value={form.jobType} onChange={f("jobType")} className="ca-input w-full">
            {["Full-time", "Part-time", "Internship", "Contract", "Remote"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <InputField label="Min Salary (₹/yr)" type="number" value={form.salaryMin} onChange={f("salaryMin")} placeholder="e.g. 800000" />
        <InputField label="Max Salary (₹/yr)" type="number" value={form.salaryMax} onChange={f("salaryMax")} placeholder="e.g. 1500000" />
        <InputField label="Openings" type="number" value={form.openings} onChange={f("openings")} placeholder="e.g. 5" min="1" />
      </div>
      <InputField label="Application Deadline" type="date" value={form.deadline} onChange={f("deadline")} />
      <TextareaField label="Job Description" value={form.description} onChange={f("description")} rows={4}
        placeholder="Describe the role, team, and what the candidate will be doing…" />
      <TextareaField label="Requirements / Qualifications" value={form.requirements} onChange={f("requirements")} rows={3}
        placeholder="List key requirements, education, experience…" />
      <TextareaField label="Responsibilities" value={form.responsibilities} onChange={f("responsibilities")} rows={3}
        placeholder="Key responsibilities of this role…" />
      <InputField label="Required Skills (comma-separated)" value={form.skills} onChange={f("skills")}
        placeholder="e.g. React, Node.js, MongoDB, Python" />
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Posting…</> : <><PlusCircle size={15} /> Post Opportunity</>}
      </button>
    </form>
  );
}

// ─── Edit Contest Modal ──────────────────────────────────────────────────────
function EditContestModal({ contest, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:       contest.title || "",
    description: contest.description || "",
    difficulty:  contest.difficulty || "medium",
    startDate:   contest.startsAt ? new Date(contest.startsAt).toISOString().slice(0, 16) : "",
    endDate:     contest.endsAt   ? new Date(contest.endsAt).toISOString().slice(0, 16)   : "",
    prize:       contest.prize || "",
    tags:        (contest.tags || []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      await axios.patch(`/api/teacher/contests/${contest._id}`, form, { withCredentials: true });
      setMsg("Saved!");
      onSaved({ ...contest, ...form, startsAt: form.startDate, endsAt: form.endDate });
      setTimeout(onClose, 800);
    } catch (err) {
      setMsg(err.response?.data?.error || "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><Pencil size={16} className="text-purple-500" /> Edit Contest</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <InputField label="Title" value={form.title} onChange={f("title")} required />
          <TextareaField label="Description" value={form.description} onChange={f("description")} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Difficulty</label>
              <select className="ca-input w-full" value={form.difficulty} onChange={f("difficulty")}>
                {["easy","medium","hard","mixed"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <InputField label="Prize" value={form.prize} onChange={f("prize")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Start Date" type="datetime-local" value={form.startDate} onChange={f("startDate")} />
            <InputField label="End Date"   type="datetime-local" value={form.endDate}   onChange={f("endDate")} />
          </div>
          <InputField label="Tags (comma-separated)" value={form.tags} onChange={f("tags")} />
          {msg && <p className={`text-sm ${msg === "Saved!" ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Save Changes"}</button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Placement Modal ─────────────────────────────────────────────────────
function EditPlacementModal({ placement, onClose, onSaved }) {
  const [form, setForm] = useState({
    company:         placement.company || "",
    title:           placement.title || "",
    location:        placement.location || "",
    jobType:         placement.jobType || "Full-time",
    salaryMin:       placement.salaryMin || "",
    salaryMax:       placement.salaryMax || "",
    description:     placement.description || "",
    requirements:    placement.requirements || "",
    responsibilities:placement.responsibilities || "",
    skills:          (placement.skills || []).join(", "),
    openings:        placement.openings || 1,
    deadline:        placement.deadline ? new Date(placement.deadline).toISOString().slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      await axios.patch(`/api/teacher/placements/${placement._id}`, form, { withCredentials: true });
      setMsg("Saved!");
      onSaved({ ...placement, ...form });
      setTimeout(onClose, 800);
    } catch (err) {
      setMsg(err.response?.data?.error || "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><Pencil size={16} className="text-blue-500" /> Edit Placement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Company" value={form.company} onChange={f("company")} required />
            <InputField label="Job Title" value={form.title} onChange={f("title")} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Location" value={form.location} onChange={f("location")} required />
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Job Type</label>
              <select className="ca-input w-full" value={form.jobType} onChange={f("jobType")}>
                {["Full-time","Part-time","Internship","Contract","Remote"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Salary Min (₹)" type="number" value={form.salaryMin} onChange={f("salaryMin")} />
            <InputField label="Salary Max (₹)" type="number" value={form.salaryMax} onChange={f("salaryMax")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Openings" type="number" value={form.openings} onChange={f("openings")} />
            <InputField label="Deadline" type="date" value={form.deadline} onChange={f("deadline")} />
          </div>
          <TextareaField label="Description" value={form.description} onChange={f("description")} rows={3} />
          <InputField label="Requirements" value={form.requirements} onChange={f("requirements")} />
          <InputField label="Skills (comma-separated)" value={form.skills} onChange={f("skills")} />
          {msg && <p className={`text-sm ${msg === "Saved!" ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Save Changes"}</button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Applicants Panel ─────────────────────────────────────────────────────────
function ApplicantsPanel({ placement, onClose }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/teacher/placements/${placement._id}/applicants`, { withCredentials: true })
      .then(r => setApplicants(r.data.applicants || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [placement._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <UserCheck size={16} className="text-green-500" /> Applicants — {placement.title}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">Loading…</div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No applicants yet.</div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-3">{applicants.length} applicant{applicants.length !== 1 ? "s" : ""}</p>
              {applicants.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {a.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 text-sm">{a.username}</div>
                    <div className="text-xs text-slate-400">{a.email}</div>
                  </div>
                  <div className="text-xs text-slate-400 shrink-0">{new Date(a.appliedAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── My Content ──────────────────────────────────────────────────────────────
function MyContent({ contests, placements, loading, onDeleteContest, onDeletePlacement, onEditContest, onEditPlacement }) {
  if (loading) return (
    <div className="loading-container min-h-[120px]">
      <svg className="spinner h-6 w-6" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Contests */}
      <div>
        <h2 className="section-title flex items-center gap-2"><Trophy size={16} className="text-purple-500" /> My Contests ({contests.length})</h2>
        {contests.length === 0 ? (
          <div className="ca-card p-6 text-center text-slate-400 text-sm">No contests yet. Use "Create Contest" to add one.</div>
        ) : (
          <div className="space-y-3">
            {contests.map(c => (
              <div key={c._id} className="ca-card p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800">{c.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{c.description}</div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> {new Date(c.startsAt).toLocaleDateString()} → {new Date(c.endsAt).toLocaleDateString()}</span>
                    <span className={`badge ${c.status === "active" ? "badge-easy" : c.status === "ended" ? "badge-hard" : "badge-medium"}`}>{c.status || "upcoming"}</span>
                    <span className={`badge ${c.difficulty === "easy" ? "badge-easy" : c.difficulty === "hard" ? "badge-hard" : "badge-medium"}`}>{c.difficulty}</span>
                    <span><Users size={12} className="inline mr-1" />{c.participants || 0} joined</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onEditContest(c)} title="Edit" className="text-blue-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => onDeleteContest(c._id)} title="Delete" className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placements */}
      <div>
        <h2 className="section-title flex items-center gap-2"><Briefcase size={16} className="text-blue-500" /> My Placements ({placements.length})</h2>
        {placements.length === 0 ? (
          <div className="ca-card p-6 text-center text-slate-400 text-sm">No placements posted yet. Use "Create Placement" to add one.</div>
        ) : (
          <div className="space-y-3">
            {placements.map(p => (
              <div key={p._id} className="ca-card p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-blue-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{p.company}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{p.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {p.location}</span>
                    <span className="badge badge-medium">{p.jobType}</span>
                    {p.salaryMin && <span>₹{(p.salaryMin / 100000).toFixed(1)}L – ₹{(p.salaryMax / 100000).toFixed(1)}L</span>}
                    <span>{p.openings} opening{p.openings !== 1 ? "s" : ""}</span>
                    {p.deadline && <span className="flex items-center gap-1"><CalendarDays size={11} /> Deadline: {new Date(p.deadline).toLocaleDateString()}</span>}
                    <span className="flex items-center gap-1 text-green-600 font-medium"><UserCheck size={11} /> {p.applicantsCount || 0} applied</span>
                  </div>
                  {p.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.skills.slice(0, 5).map(s => (
                        <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onEditPlacement(p)} title="Edit" className="text-blue-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => onEditPlacement(p, 'applicants')} title="View Applicants" className="text-green-500 hover:text-green-700 transition-colors p-1 rounded hover:bg-green-50">
                    <Eye size={15} />
                  </button>
                  <button onClick={() => onDeletePlacement(p._id)} title="Delete" className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Teacher() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Dashboard");
  const [problems, setProblems] = useState([]);
  const [students, setStudents] = useState([]);
  const [contests, setContests] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [prepMaterials, setPrepMaterials] = useState([]);
  const [stats, setStats] = useState({ problemCount: 0, contestCount: 0, placementCount: 0, studentCount: 0 });
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  // Edit / Applicants modal state
  const [editingContest,   setEditingContest]   = useState(null);
  const [editingPlacement, setEditingPlacement] = useState(null);
  const [viewApplicants,   setViewApplicants]   = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes, stRes] = await Promise.allSettled([
        axios.get("/api/teacher/problems", { withCredentials: true }),
        axios.get("/api/teacher/students", { withCredentials: true }),
        axios.get("/api/teacher/stats", { withCredentials: true }),
      ]);
      if (pRes.status === "fulfilled") setProblems(pRes.value.data.problems || []);
      if (sRes.status === "fulfilled") setStudents(sRes.value.data.students || []);
      if (stRes.status === "fulfilled") setStats(stRes.value.data);
    } finally { setLoading(false); }
  }, []);

  const fetchMyContent = useCallback(async () => {
    setContentLoading(true);
    try {
      const [cRes, pRes, prRes] = await Promise.allSettled([
        axios.get("/api/teacher/contests", { withCredentials: true }),
        axios.get("/api/teacher/placements", { withCredentials: true }),
        axios.get("/api/prep/my", { withCredentials: true }),
      ]);
      if (cRes.status === "fulfilled") setContests(cRes.value.data.contests || []);
      if (pRes.status === "fulfilled") setPlacements(pRes.value.data.placements || []);
      if (prRes.status === "fulfilled") setPrepMaterials(prRes.value.data.materials || []);
    } finally { setContentLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); fetchMyContent(); }, [fetchAll, fetchMyContent]);

  const deleteContest = async (id) => {
    if (!window.confirm("Delete this contest?")) return;
    await axios.delete(`/api/teacher/contests/${id}`, { withCredentials: true });
    setContests(c => c.filter(x => x._id !== id));
  };

  const deletePlacement = async (id) => {
    if (!window.confirm("Delete this placement?")) return;
    await axios.delete(`/api/teacher/placements/${id}`, { withCredentials: true });
    setPlacements(p => p.filter(x => x._id !== id));
  };

  const deletePrep = async (id) => {
    if (!window.confirm("Delete this prep material?")) return;
    try {
      await axios.delete(`/api/prep/${id}`, { withCredentials: true });
      setPrepMaterials(p => p.filter(x => x._id !== id));
    } catch { alert("Delete failed"); }
  };

  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon"><GraduationCap size={24} /></div>
          <p className="text-slate-600 font-medium">Access Denied</p>
          <p className="text-sm text-slate-400 mt-1">Please log in as a teacher.</p>
          <Link to="/login" className="btn-primary btn-sm mt-5">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <GraduationCap size={26} className="text-blue-600" />
          Teacher Dashboard
        </h1>
        <p className="page-subtitle">Welcome back, <strong>{user.username}</strong></p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              tab === t ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Dashboard tab ── */}
      {tab === "Dashboard" && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="flex items-center gap-2 text-blue-500 text-xs font-medium uppercase tracking-wide mb-1"><Code2 size={14} /> Problems</div>
              <div className="stat-value">{loading ? "…" : stats.problemCount}</div>
              <div className="stat-label">Created by you</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 text-purple-500 text-xs font-medium uppercase tracking-wide mb-1"><Trophy size={14} /> Contests</div>
              <div className="stat-value">{loading ? "…" : stats.contestCount}</div>
              <div className="stat-label">Created by you</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 text-green-500 text-xs font-medium uppercase tracking-wide mb-1"><Briefcase size={14} /> Placements</div>
              <div className="stat-value">{loading ? "…" : stats.placementCount}</div>
              <div className="stat-label">Posted by you</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 text-indigo-500 text-xs font-medium uppercase tracking-wide mb-1"><BookOpen size={14} /> Prep</div>
              <div className="stat-value">{contentLoading ? "…" : prepMaterials.length}</div>
              <div className="stat-label">Materials added</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 text-orange-500 text-xs font-medium uppercase tracking-wide mb-1"><Users size={14} /> Students</div>
              <div className="stat-value">{loading ? "…" : stats.studentCount}</div>
              <div className="stat-label">On platform</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="ca-card p-5 mb-8">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-4"><Zap size={16} className="text-yellow-500" /> Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setTab("Create Contest")} className="btn-primary">
                <Trophy size={14} /> New Contest
              </button>
              <button onClick={() => setTab("Create Placement")} className="btn-secondary">
                <Briefcase size={14} /> Post Placement
              </button>
              <button onClick={() => setTab("Prep Material")} className="btn-secondary">
                <BookOpen size={14} /> Add Prep Material
              </button>
              <Link to="/teacher/problems/new" className="btn-secondary">
                <BookPlus size={14} /> New Problem
              </Link>
              <Link to="/ai-generator" className="btn-secondary">
                <Zap size={14} /> AI Generator
              </Link>
            </div>
          </div>

          {/* Problems list */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Your Problems</h2>
              <Link to="/teacher/problems/new" className="btn-primary btn-sm"><BookPlus size={13} /> Create New</Link>
            </div>
            {loading ? (
              <div className="loading-container min-h-[80px]">
                <svg className="spinner h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            ) : problems.length === 0 ? (
              <div className="ca-card p-8 text-center">
                <Code2 size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No problems created yet</p>
                <Link to="/teacher/problems/new" className="btn-primary btn-sm mt-4"><BookPlus size={13} /> Create First Problem</Link>
              </div>
            ) : (
              <div className="ca-card overflow-hidden">
                <table className="ca-table">
                  <thead><tr><th>Title</th><th className="hidden sm:table-cell">Difficulty</th><th className="hidden md:table-cell">Category</th><th className="w-8" /></tr></thead>
                  <tbody>
                    {problems.map(p => (
                      <tr key={p._id}>
                        <td className="font-medium text-slate-800">{p.title}</td>
                        <td className="hidden sm:table-cell">
                          {p.difficulty && <span className={`badge ${p.difficulty === "Easy" ? "badge-easy" : p.difficulty === "Medium" ? "badge-medium" : "badge-hard"}`}>{p.difficulty}</span>}
                        </td>
                        <td className="hidden md:table-cell text-slate-500 text-xs">{p.category || "—"}</td>
                        <td><ChevronRight size={14} className="text-slate-300" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Students */}
          {students.length > 0 && (
            <div>
              <h2 className="section-title">Students ({students.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {students.slice(0, 12).map(s => (
                  <div key={s._id} className="ca-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {s.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 text-sm truncate">{s.username}</div>
                      <div className="text-xs text-slate-400 truncate">{s.email}</div>
                      {s.stats && <div className="text-xs text-slate-500 mt-0.5">Score: {s.stats.score || 0} · Solved: {s.stats.solved || 0}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Create Contest tab ── */}
      {tab === "Create Contest" && (
        <CreateContest onCreated={() => { fetchMyContent(); setTab("My Content"); }} />
      )}

      {/* ── Create Placement tab ── */}
      {tab === "Create Placement" && (
        <CreatePlacement onCreated={() => { fetchMyContent(); setTab("My Content"); }} />
      )}

      {/* ── Prep Material tab ── */}
      {tab === "Prep Material" && (
        <div className="space-y-8">
          <CreatePrepMaterial onCreated={fetchMyContent} />
          {prepMaterials.length > 0 && (
            <div>
              <h2 className="section-title flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-500" /> Your Prep Materials ({prepMaterials.length})
              </h2>
              <MyPrepMaterials materials={prepMaterials} onDelete={deletePrep} />
            </div>
          )}
        </div>
      )}

      {/* ── My Content tab ── */}
      {tab === "My Content" && (
        <MyContent
          contests={contests}
          placements={placements}
          loading={contentLoading}
          onDeleteContest={deleteContest}
          onDeletePlacement={deletePlacement}
          onEditContest={(c) => setEditingContest(c)}
          onEditPlacement={(p, mode) => mode === "applicants" ? setViewApplicants(p) : setEditingPlacement(p)}
        />
      )}

      {/* ── Edit Contest Modal ── */}
      {editingContest && (
        <EditContestModal
          contest={editingContest}
          onClose={() => setEditingContest(null)}
          onSaved={(updated) => setContests(cs => cs.map(c => c._id === updated._id ? updated : c))}
        />
      )}

      {/* ── Edit Placement Modal ── */}
      {editingPlacement && (
        <EditPlacementModal
          placement={editingPlacement}
          onClose={() => setEditingPlacement(null)}
          onSaved={(updated) => setPlacements(ps => ps.map(p => p._id === updated._id ? updated : p))}
        />
      )}

      {/* ── Applicants Panel ── */}
      {viewApplicants && (
        <ApplicantsPanel
          placement={viewApplicants}
          onClose={() => setViewApplicants(null)}
        />
      )}

      {tab === "Student Activity" && <StudentActivity students={students} />}
    </div>
  );
}

// ─── Report Student Modal ─────────────────────────────────────────────────────
function ReportModal({ student, onClose, onReported }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { setErr("Please enter a reason."); return; }
    setSaving(true); setErr("");
    try {
      await axios.post(`/api/teacher/report/${student._id}`, { reason }, { withCredentials: true });
      onReported?.();
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to submit report");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold flex items-center gap-2 text-red-600">
            <Flag size={16} /> Report Student
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">{student.username}</p>
              <p className="text-xs text-red-500">{student.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Reason for report <span className="text-red-500">*</span>
            </label>
            <textarea
              className="ca-input w-full resize-y"
              rows={4}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe the issue (e.g. cheating, inappropriate behavior, plagiarism)…"
              required
            />
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {saving ? "Submitting…" : "Submit Report"}
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Student Activity tab ─────────────────────────────────────────────────────
function StudentActivity({ students }) {
  const [selected,    setSelected]    = useState(null);
  const [subs,        setSubs]        = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [expandedId,  setExpandedId]  = useState(null);
  const [reporting,   setReporting]   = useState(null);   // student being reported
  const [reportedIds, setReportedIds] = useState(new Set());

  const loadSubs = async (student) => {
    if (selected?._id === student._id) { setSelected(null); setSubs([]); return; }
    setSelected(student);
    setExpandedId(null);
    setLoadingSubs(true);
    try {
      const res = await axios.get(
        `/api/teacher/student-submissions?studentId=${student._id}&limit=100`,
        { withCredentials: true }
      );
      setSubs(res.data.submissions || []);
    } catch { setSubs([]); }
    finally { setLoadingSubs(false); }
  };

  return (
    <div>
      <h2 className="section-title flex items-center gap-2 mb-4">
        <Users size={16} className="text-blue-500" /> Student Submissions
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        Click a student to view their submissions. Use <Flag size={11} className="inline text-red-400" /> to report a student to admin.
      </p>

      {students.length === 0 ? (
        <div className="ca-card p-8 text-center text-slate-400">
          <Users size={28} className="mx-auto mb-2" /> No students yet
        </div>
      ) : (
        <div className="space-y-2">
          {students.map(s => (
            <div key={s._id}>
              {/* Student row */}
              <div className={`w-full ca-card p-3 flex items-center gap-3 ${
                selected?._id === s._id ? "border-blue-400 bg-blue-50/40" : ""
              }`}>
                <button
                  onClick={() => loadSubs(s)}
                  className="flex items-center gap-3 flex-1 text-left min-w-0"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {s.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800">{s.username}</div>
                    <div className="text-xs text-slate-400">{s.email}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-500">Score: <span className="font-semibold text-slate-700">{s.stats?.score ?? 0}</span></div>
                    <div className="text-xs text-slate-500">Solved: <span className="font-semibold text-slate-700">{s.stats?.solved ?? 0}</span></div>
                  </div>
                  <div className={`ml-1 text-slate-400 transition-transform ${selected?._id === s._id ? "rotate-180" : ""}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </button>

                {/* Report button */}
                <button
                  onClick={e => { e.stopPropagation(); setReporting(s); }}
                  title="Report this student to admin"
                  className={`ml-2 p-1.5 rounded-lg border transition-colors shrink-0 ${
                    reportedIds.has(s._id)
                      ? "border-red-200 bg-red-50 text-red-400 cursor-default"
                      : "border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-300 hover:text-red-500"
                  }`}
                  disabled={reportedIds.has(s._id)}
                >
                  <Flag size={13} />
                </button>
              </div>

              {/* Expanded submissions */}
              {selected?._id === s._id && (
                <div className="ml-4 border-l-2 border-blue-200 pl-4 mt-1 space-y-2">
                  {loadingSubs ? (
                    <div className="py-4 text-center text-slate-400 text-sm">
                      <svg className="spinner h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    </div>
                  ) : subs.length === 0 ? (
                    <div className="py-3 text-sm text-slate-400">No submissions yet</div>
                  ) : (
                    subs.map(sub => (
                      <div key={sub._id} className="ca-card overflow-hidden">
                        {/* Submission header */}
                        <button
                          onClick={() => setExpandedId(p => p === sub._id?.toString() ? null : sub._id?.toString())}
                          className="w-full p-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
                        >
                          {sub.verdict === "Accepted"
                            ? <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                            : <XCircle size={15} className="text-red-400 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm text-slate-800 capitalize">
                              {(sub.problemSlug || "Unknown").replace(/-/g, " ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                            <span className={`font-semibold ${
                              sub.verdict === "Accepted" ? "text-green-600" : "text-red-500"
                            }`}>{sub.verdict}</span>
                            <span className="uppercase">{sub.language || "js"}</span>
                            <span>{sub.passed ?? 0}/{sub.total ?? 0} tests</span>
                            <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                            <FileCode2 size={13} className={expandedId === sub._id?.toString() ? "text-blue-500" : "text-slate-300"} />
                          </div>
                        </button>

                        {/* Code view */}
                        {expandedId === sub._id?.toString() && (
                          <div className="border-t border-slate-100">
                            <pre className="overflow-x-auto p-4 text-xs text-slate-700 bg-slate-50 max-h-72 font-mono leading-relaxed whitespace-pre">{sub.code || "(no code saved)"}</pre>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Report modal */}
      {reporting && (
        <ReportModal
          student={reporting}
          onClose={() => setReporting(null)}
          onReported={() => setReportedIds(p => new Set([...p, reporting._id]))}
        />
      )}
    </div>
  );
}


