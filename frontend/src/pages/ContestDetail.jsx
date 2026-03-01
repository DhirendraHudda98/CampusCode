import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";

export default function ContestDetail(){
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  useEffect(()=>{
    axios.get("/api/contests").then(r=>{
      const found = (r.data.contests || []).find(c=>String(c._id) === String(id));
      setContest(found || null);
    }).catch(()=>{});
  },[id]);

  if(!contest) return <div className="p-8">Loading contest...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">{contest.title}</h1>
      <div className="text-sm text-gray-600 mb-4">{contest.description}</div>
      <h2 className="font-semibold mb-2">Sample Problem</h2>
      <div className="mb-4">{contest.sampleProblem?.title || 'No sample provided'}</div>
      <CodeEditor initialCode={contest.sampleProblem?.starterCode || "// write code"} />
    </div>
  );
}
