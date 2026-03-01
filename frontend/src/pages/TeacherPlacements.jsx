import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function TeacherPlacements() {
  const { user } = useAuth();
  const [placements, setPlacements] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/api/placements", { withCredentials: true });
        if (mounted) setPlacements(res.data.placements || []);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (!user) return <div className="p-6">Please log in as a teacher to view this page.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Placement Opportunities</h1>
      {placements.length === 0 ? (
        <p className="text-muted-foreground">No placements yet.</p>
      ) : (
        <ul className="space-y-2">
          {placements.map((p) => (
            <li key={p._id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-muted-foreground">{p.company} • {p.location}</div>
                </div>
                <div className="text-sm text-muted-foreground">Applicants: {p.applicants?.length || 0}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
