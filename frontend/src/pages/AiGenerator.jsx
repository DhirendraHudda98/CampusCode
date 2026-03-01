import React, { useState, useEffect } from "react";
import axios from "axios";
import CodeEditor from "../components/CodeEditor";
import { Sparkles, Loader2, Play, RotateCcw, Tag, Zap, Key, X, ExternalLink } from "lucide-react";

const TOPICS = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Binary Trees",
  "Dynamic Programming",
  "Graph Traversal",
  "Sorting",
  "Searching",
  "Hash Tables",
  "Stack/Queue",
  "Recursion",
  "Greedy Algorithms",
  "Math",
  "Bit Manipulation",
  "Two Pointers",
  "Sliding Window",
];



export default function AiGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [generating, setGenerating] = useState(false);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("function solution(input) {\n  // Write your code here\n}");
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim());
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2000);
      setShowKeyInput(false);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setGenerating(true);
    setProblem(null);
    setCode("");
    setRunResult(null);
    try {
      const userKey = localStorage.getItem("gemini_api_key") || "";
      const res = await axios.post("/api/ai/generate", { topic, difficulty, userApiKey: userKey });
      const data = res.data;
      if (data.problem && data.problem.title) {
        setProblem(data.problem);
        const sc = typeof data.problem.starterCode === "string"
          ? data.problem.starterCode
          : (data.problem.starterCode?.javascript || "function solution(input) {\n  // Write your solution here\n}");
        setCode(sc);
      } else {
        setProblem({ error: data.error || "Failed to generate. Try again." });
      }
    } catch (e) {
      const msg = e.response?.data?.error || "AI service unavailable.";
      const isQuota = msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate limit") || e.response?.status === 429;
      setProblem({ error: msg, isQuota });
    }
    setGenerating(false);
  };

  const handleRun = async () => {
    if (!problem || !code || !problem.testCases) return;
    setRunning(true);
    try {
      const results = problem.testCases.map((tc) => {
        try {
          const fn = new Function("return " + code)();
          const inputParsed = JSON.parse(tc.input);
          const start = performance.now();
          const output = Array.isArray(inputParsed) ? fn(...inputParsed) : fn(inputParsed);
          const runtime = Math.round(performance.now() - start);
          const outputStr = JSON.stringify(output);
          const expectedStr = tc.expectedOutput.trim();
          return { input: tc.input, expectedOutput: expectedStr, actualOutput: outputStr, passed: outputStr === expectedStr, runtime };
        } catch (e) {
          return { input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: `Error: ${e.message}`, passed: false, runtime: 0 };
        }
      });
      const passed = results.filter((r) => r.passed).length;
      setRunResult({ summary: { status: passed === results.length ? "Accepted" : "Wrong Answer", passed, total: results.length }, results });
    } catch (e) {
      setRunResult({ summary: { status: "Runtime Error", passed: 0, total: 0 }, results: [] });
    }
    setRunning(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground"><Sparkles className="h-6 w-6 text-primary" />AI Problem Generator</h1>
          <p className="mt-1 text-sm text-muted-foreground">Generate unique coding problems. Pick a topic and difficulty.</p>
        </div>
        <button onClick={() => setShowKeyInput(!showKeyInput)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
          <Key className="h-3.5 w-3.5" />
          {localStorage.getItem("gemini_api_key") ? "Change API Key" : "Set API Key"}
        </button>
      </div>

      {showKeyInput && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="mb-2 text-xs font-semibold text-amber-800">Enter your own Gemini API Key (free at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="underline">aistudio.google.com</a>)</p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button onClick={saveApiKey} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600">
              {keySaved ? "Saved!" : "Save"}
            </button>
            {localStorage.getItem("gemini_api_key") && (
              <button onClick={clearApiKey} className="rounded-lg border border-red-300 px-3 py-2 text-xs text-red-600 hover:bg-red-50">Clear</button>
            )}
          </div>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-foreground">Topic</label>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map((t) => (
                <button key={t} onClick={() => setTopic(t)} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${topic === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Or type a custom topic..." className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Difficulty</label>
            <div className="flex gap-1.5">
              {["Easy","Medium","Hard"].map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${difficulty===d?"border-primary bg-primary/10 text-primary":"border-border text-muted-foreground"}`}>{d}</button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={!topic || generating} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} {generating ? "Generating..." : "Generate Problem"}
          </button>
        </div>
      </div>

      {problem && !problem.error && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{problem.title}</h2>
              {problem.difficulty && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${problem.difficulty==="Easy"?"bg-green-100 text-green-700":problem.difficulty==="Hard"?"bg-red-100 text-red-700":"bg-yellow-100 text-yellow-700"}`}>{problem.difficulty}</span>}
            </div>
            <div className="mb-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{problem.description}</div>
            {problem.examples?.map((ex,i)=>(<div key={i} className="mb-3 rounded-lg border border-border bg-muted/30 p-3"><div className="font-mono text-xs text-slate-600"><span className="font-semibold text-slate-700">Input:</span> {ex.input}</div><div className="font-mono text-xs text-primary"><span className="font-semibold">Output:</span> {ex.output}</div>{ex.explanation&&<div className="text-xs text-slate-500 mt-1">{ex.explanation}</div>}</div>))}
            {(problem.constraints||[]).length>0&&(<div className="mt-3"><p className="text-xs font-semibold text-slate-600 mb-1">Constraints:</p><ul className="space-y-0.5">{problem.constraints.map((c,i)=><li key={i} className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded">{c}</li>)}</ul></div>)}
            {(problem.hints||[]).length>0&&(<div className="mt-3"><p className="text-xs font-semibold text-slate-600 mb-1">Hints:</p><ul className="space-y-1">{problem.hints.map((h,i)=><li key={i} className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">💡 {h}</li>)}</ul></div>)}
          </div>

          <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">JavaScript</span>
              <div className="flex items-center gap-2">
                <button onClick={()=>setCode(problem.starterCode||"")} className="text-xs text-muted-foreground">Reset</button>
                <button onClick={handleRun} disabled={running} className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50">{running?"Running":"Run"}</button>
              </div>
            </div>
            <div className="h-80"><CodeEditor value={code} onChange={(v)=>setCode(v||"")} /></div>
            {runResult && (<div className="border-t border-border p-3"><pre className="text-xs">{JSON.stringify(runResult,null,2)}</pre></div>)}
          </div>
        </div>
      )}

      {problem?.error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">⚠️ {problem.error}</p>
          {problem.isQuota && (
            <div className="mt-2 space-y-1 text-xs text-red-600">
              <p>The default Gemini API key has hit its daily quota limit. To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="underline font-medium">aistudio.google.com/apikey</a> and create a free API key</li>
                <li>Click <strong>"Set API Key"</strong> button (top right) and paste your key</li>
                <li>Or update <code className="bg-red-100 px-1 rounded">backend/.env</code> → <code className="bg-red-100 px-1 rounded">GEMINI_API_KEY=your_key</code> and restart the server</li>
              </ol>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
