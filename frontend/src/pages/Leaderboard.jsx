import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trophy, Medal, Crown, Zap } from "lucide-react";

function RankIcon({ rank }) {
  if (rank === 1) return <Crown size={18} className="text-yellow-500" />;
  if (rank === 2) return <Medal size={18} className="text-slate-400" />;
  if (rank === 3) return <Medal size={18} className="text-amber-600" />;
  return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
}

function RankCard({ user, rank }) {
  const colors = [
    "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200",  // 1st
    "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200",    // 2nd
    "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200", // 3rd
  ];
  const avatarColors = [
    "bg-yellow-400 text-yellow-900",
    "bg-slate-300 text-slate-700",
    "bg-amber-500 text-white",
  ];
  return (
    <div className={`ca-card p-5 flex flex-col items-center text-center border ${colors[rank - 1] || "border-slate-200"}`}>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-3 ${avatarColors[rank - 1] || "bg-blue-100 text-blue-700"}`}>
        {user.username?.charAt(0).toUpperCase()}
      </div>
      <div className="mb-1"><RankIcon rank={rank} /></div>
      <h3 className="font-semibold text-slate-900 mt-1">{user.username || user.name}</h3>
      <p className="text-2xl font-bold text-blue-600 mt-1">{user.score || 0}</p>
      <p className="text-xs text-slate-400 mt-0.5">points</p>
    </div>
  );
}

export default function Leaderboard() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/leaderboard")
      .then((r) => setData(r.data.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  const top3 = data.slice(0, 3);
  const rest  = data.slice(3);

  const orderedTop3 = top3.length === 3
    ? [top3[1], top3[0], top3[2]]  // 2nd, 1st, 3rd for podium effect
    : top3;

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="page-header text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy size={28} className="text-yellow-500" />
          <h1 className="page-title">Leaderboard</h1>
        </div>
        <p className="page-subtitle">Top coders ranked by score</p>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Trophy size={24} /></div>
          <p className="text-slate-600 font-medium">No rankings yet</p>
          <p className="text-sm text-slate-400 mt-1">Start solving problems to appear here</p>
        </div>
      ) : (
        <>
          {/* Podium for top 3 */}
          {top3.length > 0 && (
            <div className={`grid gap-4 mb-8 ${top3.length === 3 ? "grid-cols-3" : top3.length === 2 ? "grid-cols-2 max-w-sm mx-auto" : "grid-cols-1 max-w-xs mx-auto"}`}>
              {top3.length === 3
                ? [{ u: top3[1], r: 2 }, { u: top3[0], r: 1 }, { u: top3[2], r: 3 }].map(({ u, r }) => (
                    <RankCard key={u._id || r} user={u} rank={r} />
                  ))
                : top3.map((u, i) => <RankCard key={u._id || i} user={u} rank={i + 1} />)
              }
            </div>
          )}

          {/* Rest of the rankings */}
          {rest.length > 0 && (
            <div className="ca-card overflow-hidden">
              <table className="ca-table">
                <thead>
                  <tr>
                    <th className="w-14">Rank</th>
                    <th>User</th>
                    <th className="text-right">Score</th>
                    <th className="text-right hidden sm:table-cell">Solved</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((u, i) => (
                    <tr key={u._id || i}>
                      <td>
                        <span className="rank-badge rank-n">#{i + 4}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                            {u.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{u.username || u.name}</span>
                        </div>
                      </td>
                      <td className="text-right font-bold text-blue-600">{u.score || 0}</td>
                      <td className="text-right text-slate-500 hidden sm:table-cell">{u.solved || u.stats?.solved || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

