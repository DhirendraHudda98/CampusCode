import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Placements from "./pages/Placements";
import Problems from "./pages/Problems";
import ProblemDetail from "./pages/ProblemDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Contests from "./pages/Contests";
import ContestDetail from "./pages/ContestDetail";
import ProblemEditor from "./pages/ProblemEditor";
import ProtectedRoute from "./components/ProtectedRoute";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Discussions from "./pages/Discussions";
import AiGenerator from "./pages/AiGenerator";
import Admin from "./pages/Admin";
import Teacher from "./pages/Teacher";
import TeacherPlacements from "./pages/TeacherPlacements";
import DailyChallenge from "./pages/DailyChallenge";
import PrepMaterial from "./pages/PrepMaterial";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:slug" element={<ProblemDetail />} />
        <Route path="/placements" element={<Placements />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/discussions" element={<Discussions />} />
        <Route path="/ai-generator" element={<AiGenerator />} />
        <Route path="/admin" element={<ProtectedRoute role={"admin"}><Admin /></ProtectedRoute>} />
        <Route path="/teacher" element={<ProtectedRoute role={"teacher"}><Teacher /></ProtectedRoute>} />
        <Route path="/teacher/placements" element={<ProtectedRoute role={"teacher"}><TeacherPlacements /></ProtectedRoute>} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/contests/:id" element={<ContestDetail />} />
        <Route path="/teacher/problems/new" element={<ProtectedRoute role={"teacher"}><ProblemEditor /></ProtectedRoute>} />
        <Route path="/daily" element={<DailyChallenge />} />
        <Route path="/prep" element={<PrepMaterial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}
