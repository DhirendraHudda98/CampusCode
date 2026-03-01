import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft, Tag, BarChart2, Lightbulb, ChevronDown, ChevronUp,
  Play, Send, RotateCcw, CheckCircle, XCircle, Clock, AlertCircle,
  Code2, BookOpen, HelpCircle, Sparkles, Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function DiffBadge({ diff }) {
  const map = { Easy: "badge-easy", Medium: "badge-medium", Hard: "badge-hard" };
  return <span className={`badge ${map[diff] || "badge-gray"}`}>{diff}</span>;
}

function VerdictBanner({ verdict, passed, total, message, onClose }) {
  if (!verdict) return null;
  const accepted = verdict === "Accepted";
  const noTests  = verdict === "No Test Cases";
  const colorCls = accepted
    ? "bg-green-50 border-green-200 text-green-800"
    : noTests
      ? "bg-amber-50 border-amber-200 text-amber-800"
      : "bg-red-50 border-red-200 text-red-800";
  const Icon = accepted ? CheckCircle : noTests ? AlertCircle : XCircle;
  const label = noTests
    ? "No Test Cases — code saved but not evaluated"
    : `${verdict} — ${passed}/${total} test cases passed`;
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-semibold mb-3 ${colorCls}`}>
      <span className="flex items-center gap-2">
        <Icon size={16} />
        {label}
      </span>
      <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 ml-4">✕</button>
    </div>
  );
}

function TestResult({ r, i }) {
  const [open, setOpen] = useState(!r.passed);
  return (
    <div className={`rounded-lg border text-xs overflow-hidden ${r.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
      <button
        className="w-full flex items-center justify-between px-3 py-2 font-semibold"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2">
          {r.passed
            ? <CheckCircle size={13} className="text-green-600" />
            : <XCircle size={13} className="text-red-500" />
          }
          {r.hidden ? `Hidden Test ${i + 1}` : `Test case ${i + 1}`}
        </span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && !r.hidden && (
        <div className="px-3 pb-3 space-y-1.5 font-mono border-t border-current border-opacity-20">
          <div><span className="font-bold text-slate-700">Input:</span> <span className="text-slate-600">{r.input}</span></div>
          <div><span className="font-bold text-slate-700">Expected:</span> <span className="text-green-700">{r.expectedOutput}</span></div>
          <div><span className="font-bold text-slate-700">Got:</span> <span className={r.passed ? "text-green-700" : "text-red-600"}>{r.actualOutput || "(empty)"}</span></div>
          {r.error && <div className="text-red-600"><span className="font-bold">Error:</span> {r.error}</div>}
        </div>
      )}
    </div>
  );
}

export default function ProblemDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editor state
  const [code, setCode]             = useState("");
  const [language, setLanguage]     = useState("javascript");
  const [tab, setTab]               = useState("problem"); // problem | editorial | hints
  const [resultTab, setResultTab]   = useState("output"); // output | tests

  // Run state
  const [running, setRunning]       = useState(false);
  const [runOutput, setRunOutput]   = useState(null);
  const [runError, setRunError]     = useState(null);

  // Test run state
  const [testing, setTesting]       = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict]       = useState(null);
  const [verdictData, setVerdictData] = useState(null);

  // Hints
  const [hintsOpen, setHintsOpen]   = useState([]);

  // AI state
  const [aiHint, setAiHint]               = useState(null);
  const [aiHintLoading, setAiHintLoading] = useState(false);
  const [aiHintCount, setAiHintCount]     = useState(0);
  const [aiExplain, setAiExplain]         = useState(null);
  const [aiExplainLoading, setAiExplainLoading] = useState(false);
  const [aiExplainMode, setAiExplainMode] = useState("problem");

  useEffect(() => {
    if (!slug) return;
    axios.get(`/api/problems/${slug}`)
      .then((r) => {
        const p = r.data.problem;
        setProblem(p);
        setCode(p.starterCode?.[language] || p.starterCode?.javascript || "// Write your solution here\n");
      })
      .catch(() => setProblem(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // Update code when language changes
  useEffect(() => {
    if (!problem) return;
    setCode(problem.starterCode?.[language] || problem.starterCode?.javascript || "// Write your solution here\n");
  }, [language]);

  const handleRun = async () => {
    setRunning(true);
    setRunOutput(null);
    setRunError(null);
    setResultTab("output");
    try {
      const res = await axios.post("/api/run/js", { code });
      setRunOutput(res.data.stdout || "(no output)");
      if (res.data.error) setRunError(res.data.error);
    } catch (err) {
      setRunError(err.response?.data?.error || err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleTest = async () => {
    if (!problem?.testCases) return;
    setTesting(true);
    setTestResults(null);
    setResultTab("tests");
    setVerdict(null);
    const visibleCases = problem.testCases.filter((t) => !t.isHidden);
    try {
      const res = await axios.post("/api/run/test", { code, testCases: visibleCases });
      setTestResults(res.data);
    } catch (err) {
      setRunError(err.response?.data?.error || "Test run failed");
      setResultTab("output");
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async () => {
    if (user && user.role !== "student") {
      setRunError("Only students can submit solutions");
      setResultTab("output");
      return;
    }
    setSubmitting(true);
    setVerdict(null);
    setVerdictData(null);
    setResultTab("tests");
    try {
      const res = await axios.post("/api/submissions", {
        problemSlug: slug,
        code,
        language,
      }, { withCredentials: true });
      setVerdict(res.data.verdict);
      setVerdictData(res.data);
      setTestResults(res.data);
    } catch (err) {
      setRunError(err.response?.data?.error || "Submission failed");
      setResultTab("output");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!problem) return;
    setCode(problem.starterCode?.[language] || problem.starterCode?.javascript || "");
    setRunOutput(null);
    setRunError(null);
    setTestResults(null);
    setVerdict(null);
  };

  const handleAIHint = async () => {
    setAiHintLoading(true);
    const nextCount = aiHintCount + 1;
    setAiHintCount(nextCount);
    try {
      const res = await axios.post("/api/ai/hint", {
        problemTitle: problem.title,
        problemDescription: problem.description,
        hintNumber: nextCount,
        userCode: code,
        userApiKey: localStorage.getItem("gemini_api_key") || "",
      }, { withCredentials: true });
      setAiHint(res.data.hint);
    } catch {
      setAiHint("Failed to get AI hint. Please try again.");
    }
    setAiHintLoading(false);
  };

  const handleAIExplain = async (mode) => {
    setAiExplainMode(mode);
    setAiExplainLoading(true);
    setAiExplain(null);
    try {
      const res = await axios.post("/api/ai/explain", {
        problemTitle: problem.title,
        problemDescription: problem.description,
        code: mode !== "problem" ? code : undefined,
        mode,
        userApiKey: localStorage.getItem("gemini_api_key") || "",
      }, { withCredentials: true });
      setAiExplain(res.data.explanation);
    } catch (e) {
      const msg = e.response?.data?.error || "Failed to get AI explanation. Please try again.";
      setAiExplain(msg);
    }
    setAiExplainLoading(false);
  };

  const toggleHint = (i) => {
    setHintsOpen((h) => h.includes(i) ? h.filter((x) => x !== i) : [...h, i]);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <svg className="spinner" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon"><span className="text-2xl">🔍</span></div>
          <p className="text-slate-700 font-medium">Problem not found</p>
          <Link to="/problems" className="btn-primary btn-sm mt-4">Back to Problems</Link>
        </div>
      </div>
    );
  }

  const visibleTests = (problem.testCases || []).filter((t) => !t.isHidden);
  const isBusy = running || testing || submitting;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 60px)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shrink-0">
        <Link to="/problems" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors">
          <ChevronLeft size={16} /> All Problems
        </Link>
        <div className="flex items-center gap-2">
          <DiffBadge diff={problem.difficulty} />
          <span className="text-sm font-semibold text-slate-800 truncate max-w-[300px]">{problem.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {problem.acceptance != null && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <BarChart2 size={12} /> {problem.acceptance}% acceptance
            </span>
          )}
        </div>
      </div>

      {/* Main split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL — Problem info */}
        <div className="w-1/2 border-r border-slate-200 flex flex-col overflow-hidden bg-white">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 shrink-0">
            {[
              { key: "problem",   icon: BookOpen,   label: "Problem" },
              { key: "hints",     icon: HelpCircle, label: `Hints (${(problem.hints || []).length})` },
              { key: "ai",        icon: Sparkles,   label: "AI Help" },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {tab === "problem" && (
              <>
                {problem.description && (
                  <div>
                    <div
                      className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, "<br/>").replace(/`([^`]+)`/g, "<code class='bg-slate-100 px-1 rounded text-blue-700 text-xs font-mono'>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") }}
                    />
                  </div>
                )}

                {/* Examples */}
                {(problem.examples || []).length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Examples</h3>
                    <div className="space-y-3">
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-sm font-mono">
                          <div className="text-slate-600 mb-1">
                            <span className="font-bold font-sans text-slate-700">Input:</span> {ex.input}
                          </div>
                          <div className="text-slate-600 mb-1">
                            <span className="font-bold font-sans text-slate-700">Output:</span> {ex.output}
                          </div>
                          {ex.explanation && (
                            <div className="text-xs text-slate-500 mt-1.5 font-sans border-t border-slate-200 pt-1.5">
                              <span className="font-semibold">Explanation:</span> {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {(problem.constraints || []).length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Constraints</h3>
                    <ul className="space-y-1">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {(problem.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">
                        <Tag size={9} />{t}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "hints" && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 mb-4">Stuck? Reveal hints one at a time.</p>
                {(problem.hints || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No hints available for this problem.</p>
                ) : (
                  (problem.hints || []).map((hint, i) => (
                    <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-amber-800"
                        onClick={() => toggleHint(i)}
                      >
                        <span className="flex items-center gap-2"><Lightbulb size={14} className="text-amber-500" />Hint {i + 1}</span>
                        {hintsOpen.includes(i) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {hintsOpen.includes(i) && (
                        <p className="px-4 pb-3 text-sm text-amber-900 border-t border-amber-200">{hint}</p>
                      )}
                    </div>
                  ))
                )}

                {/* AI Hint Section */}
                <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-purple-800">
                      <Sparkles size={14} className="text-purple-500" /> AI-Powered Hint
                    </span>
                    <button
                      onClick={handleAIHint}
                      disabled={aiHintLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
                    >
                      {aiHintLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {aiHintCount === 0 ? "Get AI Hint" : "Next AI Hint"}
                    </button>
                  </div>
                  {aiHint && (
                    <div className="px-4 pb-4 text-sm text-purple-900 border-t border-purple-200 pt-3">
                      <p className="leading-relaxed whitespace-pre-wrap">{aiHint}</p>
                      <p className="text-xs text-purple-500 mt-2">AI hint #{aiHintCount} • Based on your current code</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "ai" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">AI Problem Assistant</h3>
                  <p className="text-xs text-slate-500">Powered by Google Gemini. Get explanations for the problem or your solution.</p>
                </div>

                {/* Mode buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleAIExplain("problem")}
                    disabled={aiExplainLoading}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                  >
                    {aiExplainLoading && aiExplainMode === "problem" ? <Loader2 size={12} className="animate-spin" /> : <BookOpen size={12} />}
                    Explain This Problem
                  </button>
                  <button
                    onClick={() => handleAIExplain("solution")}
                    disabled={aiExplainLoading}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                  >
                    {aiExplainLoading && aiExplainMode === "solution" ? <Loader2 size={12} className="animate-spin" /> : <Code2 size={12} />}
                    Explain My Solution
                  </button>
                  <button
                    onClick={() => handleAIExplain("code")}
                    disabled={aiExplainLoading}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-600 text-white hover:bg-slate-500 disabled:opacity-50 transition-colors"
                  >
                    {aiExplainLoading && aiExplainMode === "code" ? <Loader2 size={12} className="animate-spin" /> : <HelpCircle size={12} />}
                    Explain My Code
                  </button>
                </div>

                {aiExplainLoading && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                    <Loader2 size={16} className="animate-spin text-purple-500" />
                    <span>Gemini is thinking...</span>
                  </div>
                )}

                {aiExplain && !aiExplainLoading && (
                  <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={14} className="text-purple-500" />
                      <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                        {aiExplainMode === "problem" ? "Problem Explanation" : aiExplainMode === "solution" ? "Solution Explanation" : "Code Explanation"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{aiExplain}</div>
                  </div>
                )}

                {!aiExplain && !aiExplainLoading && (
                  <div className="text-center py-8 text-slate-400">
                    <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Choose an option above to get AI assistance</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — Code editor */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-[#1e1e2e]">
          {/* Editor top bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#181825] border-b border-[#313244] shrink-0">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm bg-[#313244] text-slate-300 border border-[#45475a] rounded px-2 py-1 focus:outline-none focus:border-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python" disabled>Python (soon)</option>
            </select>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-[#313244]"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Code textarea */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full resize-none font-mono text-sm text-slate-200 bg-[#1e1e2e] p-4 focus:outline-none leading-6 tracking-wide"
              style={{ tabSize: 2, caretColor: "#89b4fa" }}
              spellCheck={false}
              placeholder="// Write your solution here"
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  const start = e.target.selectionStart;
                  const end   = e.target.selectionEnd;
                  const newCode = code.slice(0, start) + "  " + code.slice(end);
                  setCode(newCode);
                  setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = start + 2;
                  }, 0);
                }
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#181825] border-t border-[#313244] shrink-0">
            <button
              onClick={handleRun}
              disabled={isBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded bg-[#313244] text-slate-300 hover:bg-[#45475a] disabled:opacity-50 transition-colors border border-[#45475a]"
            >
              {running ? <><span className="inline-block w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /></> : <Play size={13} />}
              Run Code
            </button>
            <button
              onClick={handleTest}
              disabled={isBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded bg-blue-700 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {testing ? <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /></> : <Code2 size={13} />}
              Run Tests
            </button>
            <button
              onClick={handleSubmit}
              disabled={isBusy || (user && user.role !== "student")}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors ml-auto"
            >
              {submitting ? <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /></> : <Send size={13} />}
              Submit
            </button>
          </div>

          {/* Output panel */}
          <div className="bg-[#181825] border-t border-[#313244] shrink-0" style={{ maxHeight: "240px", minHeight: "140px", display: "flex", flexDirection: "column" }}>
            {/* Output tabs */}
            <div className="flex border-b border-[#313244]">
              {["output", "tests"].map((t) => (
                <button
                  key={t}
                  onClick={() => setResultTab(t)}
                  className={`px-4 py-2 text-xs font-semibold transition-colors capitalize ${
                    resultTab === t ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {t === "tests" ? `Test Results${testResults ? ` (${testResults.passed}/${testResults.total})` : ""}` : "Output"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {resultTab === "output" && (
                <div className="font-mono text-xs text-green-400 whitespace-pre-wrap leading-5">
                  {runError && <span className="text-red-400">{runError}</span>}
                  {!runError && !runOutput && <span className="text-slate-600">Click "Run Code" to see output here</span>}
                  {runOutput}
                </div>
              )}

              {resultTab === "tests" && (
                <div className="space-y-2">
                  {!testResults && (
                    <p className="text-xs text-slate-500 font-mono">Click "Run Tests" or "Submit" to see results</p>
                  )}
                  {testResults && (
                    <>
                      <VerdictBanner
                        verdict={verdict}
                        passed={testResults.passed}
                        total={testResults.total}
                        message={testResults.message}
                        onClose={() => { setVerdict(null); setVerdictData(null); }}
                      />
                      {(testResults.results || []).map((r, i) => (
                        <TestResult key={i} r={r} i={i} />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
