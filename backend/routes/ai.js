import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const MODEL = "gemini-2.0-flash";

function getAI(userApiKey) {
  const key = (userApiKey && userApiKey.startsWith("AIza")) ? userApiKey : (process.env.GEMINI_API_KEY || "");
  return new GoogleGenAI({ apiKey: key });
}

async function geminiText(prompt, userApiKey) {
  const ai = getAI(userApiKey);
  const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
  return response.text.trim();
}

async function geminiJSON(prompt, userApiKey) {
  const text = await geminiText(prompt, userApiKey);
  // Strip markdown code fences if present
  const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(clean);
}

// POST /api/ai/generate — generate a full coding problem
router.post("/generate", async (req, res) => {
  const { topic, difficulty, userApiKey } = req.body;
  const prompt = `Generate a ${difficulty || "Medium"} difficulty coding problem about "${topic || "Arrays"}".
Return ONLY valid JSON (no markdown, no explanation outside JSON) in this exact shape:
{
  "title": "Problem Title Here",
  "difficulty": "${difficulty || "Medium"}",
  "description": "Full problem statement. Use \\n for newlines.",
  "examples": [
    { "input": "example input", "output": "example output", "explanation": "brief explanation" }
  ],
  "constraints": ["constraint 1", "constraint 2"],
  "testCases": [
    { "input": "input1", "expectedOutput": "output1" },
    { "input": "input2", "expectedOutput": "output2" },
    { "input": "input3", "expectedOutput": "output3" }
  ],
  "starterCode": "function solution(params) {\\n  // Write your solution here\\n}",
  "hints": ["Gentle approach hint", "More specific data structure hint", "Algorithmic detail hint"],
  "tags": ["${topic || "arrays"}"]
}
All expectedOutput values must be JSON-serializable strings. No trailing commas.`;

  try {
    const problem = await geminiJSON(prompt, userApiKey);
    res.json({ problem });
  } catch (err) {
    console.error("AI generate error:", err.message?.slice(0, 200));
    const isQuota = err.message?.includes("quota") || err.message?.includes("429");
    const status = isQuota ? 429 : 500;
    res.status(status).json({ error: isQuota ? "API quota exceeded. Please set your own Gemini API key (free at aistudio.google.com/apikey)." : "AI generation failed: " + err.message?.slice(0, 100) });
  }
});

// POST /api/ai/hint — get a contextual AI hint for a problem
router.post("/hint", async (req, res) => {
  const { problemTitle, problemDescription, hintNumber, userCode, userApiKey } = req.body;
  const hintNum = parseInt(hintNumber) || 1;
  const codeSection = userCode && userCode.trim().length > 10
    ? `\n\nStudent current attempt:\n\`\`\`\n${userCode.slice(0, 500)}\n\`\`\``
    : "";
  const hintType = hintNum === 1
    ? "a gentle nudge about the general approach without revealing the algorithm"
    : hintNum === 2
    ? "a more specific hint about which data structure or algorithm pattern to use"
    : "a concrete algorithmic detail - almost giving away the approach but not writing code";

  const prompt = `You are a helpful, encouraging coding mentor.

Problem: "${problemTitle || "coding problem"}"
${problemDescription ? "Description: " + problemDescription.slice(0, 400) : ""}${codeSection}

Give hint #${hintNum}: ${hintType}.
Keep it to 2-4 sentences. Be encouraging. Do NOT show code or give the full solution.`;

  try {
    const hint = await geminiText(prompt, userApiKey);
    res.json({ hint });
  } catch (err) {
    console.error("AI hint error:", err.message?.slice(0, 100));
    const isQuota = err.message?.includes("quota") || err.message?.includes("429");
    res.status(isQuota ? 429 : 500).json({ error: isQuota ? "API quota exceeded. Set your own Gemini API key." : "Failed to generate hint." });
  }
});

// POST /api/ai/explain — explain problem, solution, or code
router.post("/explain", async (req, res) => {
  const { problemTitle, problemDescription, code, mode, userApiKey } = req.body;
  let prompt;

  if (mode === "solution" && code) {
    prompt = `Explain this solution to "${problemTitle || "the coding problem"}":
\`\`\`javascript
${code.slice(0, 1000)}
\`\`\`
Cover: 1) Overall algorithm/approach 2) Time & space complexity (Big O) 3) Step-by-step walkthrough 4) Why it works.
Be clear and educational. Use numbered sections.`;
  } else if (mode === "code" && code) {
    prompt = `Explain this code line by line for a student learning to code:
\`\`\`javascript
${code.slice(0, 1000)}
\`\`\`
Explain what each part does, data structures used, and overall logic. Be concise.`;
  } else {
    prompt = `Explain this coding problem clearly to a student:
Title: ${problemTitle || ""}
${problemDescription ? "Description: " + problemDescription.slice(0, 600) : ""}

Cover: 1) What the problem asks in simple terms 2) Key observations & edge cases 3) Recommended approach/algorithm (no code) 4) Brief example walkthrough.
Be encouraging and educational.`;
  }

  try {
    const explanation = await geminiText(prompt, userApiKey);
    res.json({ explanation });
  } catch (err) {
    console.error("AI explain error:", err.message?.slice(0, 100));
    const isQuota = err.message?.includes("quota") || err.message?.includes("429");
    res.status(isQuota ? 429 : 500).json({ error: isQuota ? "API quota exceeded. Set your own Gemini API key." : "Failed to generate explanation." });
  }
});

// POST /api/ai/chat — AI coding assistant chat
router.post("/chat", async (req, res) => {
  const { messages, context, userApiKey } = req.body;
  if (!messages?.length) {
    return res.json({ reply: { role: "assistant", content: "Hello! I am your AI coding assistant. Ask me anything about algorithms, data structures, or your code!" } });
  }

  const ctxLine = context ? `Context: ${context}\n\n` : "";
  const history = messages.slice(-10).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
  const prompt = `${ctxLine}You are an expert coding assistant helping students with programming, algorithms, and data structures. Be concise and educational.

${history}

Respond as Assistant (no "Assistant:" prefix):`;

  try {
    const reply = await geminiText(prompt, userApiKey);
    res.json({ reply: { role: "assistant", content: reply } });
  } catch (err) {
    console.error("AI chat error:", err.message?.slice(0, 100));
    const isQuota = err.message?.includes("quota") || err.message?.includes("429");
    res.status(isQuota ? 429 : 500).json({ error: isQuota ? "API quota exceeded. Set your own Gemini API key." : "AI chat failed." });
  }
});

// POST /api/ai/review — review submitted code
router.post("/review", async (req, res) => {
  const { solution, problemTitle, problemDescription, userApiKey } = req.body;
  const prompt = `Review this JavaScript solution for "${problemTitle || "the coding problem"}":
\`\`\`javascript
${(solution || "").slice(0, 1000)}
\`\`\`
${problemDescription ? "Problem: " + problemDescription.slice(0, 300) + "\n" : ""}
Return ONLY valid JSON (no markdown):
{
  "score": 0.85,
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "feedback": "Overall assessment",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["suggestion 1", "suggestion 2"],
  "bugs": []
}`;

  try {
    const review = await geminiJSON(prompt, userApiKey);
    res.json({ review });
  } catch (err) {
    console.error("AI review error:", err.message?.slice(0, 100));
    const isQuota = err.message?.includes("quota") || err.message?.includes("429");
    res.status(isQuota ? 429 : 500).json({ error: isQuota ? "API quota exceeded. Set your own Gemini API key." : "Failed to review code." });
  }
});

// Cleanup test files if they exist
export default router;
