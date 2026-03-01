import React, { useState } from "react";
import axios from "axios";

export default function CodeEditor({ initialCode = "", language = "javascript" }){
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try{
      const res = await axios.post("/api/run/js", { code }, { timeout: 10000 });
      setOutput(res.data.stdout || res.data.error || res.data.stderr || "(no output)");
    }catch(err){
      setOutput(err.response?.data?.error || err.message);
    }finally{ setLoading(false); }
  };

  return (
    <div>
      <div className="mb-2">
        <div className="text-sm text-gray-600">Language: {language}</div>
      </div>
      <textarea value={code} onChange={e=>setCode(e.target.value)} rows={12} className="w-full font-mono p-2 border rounded" />
      <div className="flex items-center gap-2 mt-2">
        <button onClick={run} disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded">{loading? 'Running...' : 'Run'}</button>
        <button onClick={()=>setCode(initialCode)} className="border px-3 py-1 rounded">Reset</button>
      </div>
      <div className="mt-3 bg-black text-white p-3 rounded font-mono whitespace-pre-wrap">{output ?? 'Output will show here'}</div>
    </div>
  );
}
