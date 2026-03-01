import express from "express";
import { exec } from "child_process";

const router = express.Router();

// Helper: run a JS snippet, return { stdout, error }
function runCode(code, timeoutMs = 5000) {
  return new Promise(async (resolve) => {
    const fs   = await import("fs/promises");
    const os   = await import("os");
    const path = await import("path");
    const fname = path.join(os.tmpdir(), `ca-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
    try {
      await fs.writeFile(fname, code, "utf8");
      exec(`node "${fname}"`, { timeout: timeoutMs }, (err, stdout, stderr) => {
        fs.unlink(fname).catch(() => {});
        if (err) resolve({ stdout: "", error: stderr || err.message });
        else resolve({ stdout: stdout.trim(), error: stderr ? stderr.trim() : null });
      });
    } catch (e) {
      resolve({ stdout: "", error: e.message });
    }
  });
}

// POST /api/run/js — run arbitrary code (no stdin)
router.post("/js", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Code required" });
  const result = await runCode(code);
  res.json(result);
});

// POST /api/run/test — run code against provided test cases
// Body: { code, testCases: [{ input, expectedOutput }] }
router.post("/test", async (req, res) => {
  const { code, testCases } = req.body;
  if (!code)      return res.status(400).json({ error: "Code required" });
  if (!testCases?.length) return res.status(400).json({ error: "Test cases required" });

  // Extract function name and parameter count from user code
  const fnMatch = code.match(/^\s*(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/m)
                || code.match(/^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/m)
                || code.match(/^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(\w+)\s*=>/m);
  const fnName   = fnMatch?.[1];
  const fnParams = fnMatch?.[2] ? fnMatch[2].split(',').map(p => p.trim()).filter(Boolean) : [];
  const multiArg = fnParams.length > 1;

  const results = [];
  let passed = 0;

  for (const tc of testCases) {
    let harness;
    try {
      if (fnName) {
        // Single-param: pass the whole parsed value directly
        // Multi-param:  spread the parsed array as separate arguments
        const callExpr = multiArg
          ? `${fnName}(...__args)`
          : `${fnName}(__args)`;
        harness = `${code}\nconst __args = JSON.parse(${JSON.stringify(tc.input)});\nconst __result = ${callExpr};\nprocess.stdout.write(JSON.stringify(__result));`;
      } else {
        harness = code;
      }
    } catch {
      harness = code;
    }

    const { stdout, error } = await runCode(harness, 4000);

    let gotStr = stdout;
    let expStr = tc.expectedOutput?.trim() ?? "";

    // Normalize JSON output for comparison
    let ok = false;
    try {
      ok = JSON.stringify(JSON.parse(gotStr)) === JSON.stringify(JSON.parse(expStr));
    } catch {
      ok = gotStr === expStr;
    }

    if (ok) passed++;
    results.push({
      input:          tc.input,
      expectedOutput: expStr,
      actualOutput:   error ? `Runtime Error: ${error}` : gotStr,
      passed:         ok,
      error:          error || null,
    });
  }

  res.json({ passed, total: testCases.length, results });
});

export default router;