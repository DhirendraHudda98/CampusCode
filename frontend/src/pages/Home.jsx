import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import {
  Code2, Trophy, Briefcase, MessageSquare, Sparkles, TrendingUp,
  ArrowRight, ChevronRight, Star, Users, Zap, BookOpen, Target, CheckCircle
} from "lucide-react";

const CODE_SNIPPETS = [
  { code: "def twoSum(nums, target):\n  seen = {}\n  for i, n in enumerate(nums):\n    if target-n in seen:\n      return [seen[target-n], i]\n    seen[n] = i", top: "12%", right: "3%" },
  { code: "const bfs = (root) => {\n  const q = [root];\n  while (q.length) {\n    const node = q.shift();\n    q.push(...node.children);\n  }\n}", top: "52%", right: "1%" },
  { code: "SELECT u.name, COUNT(s.id)\nFROM users u\nJOIN submissions s\n  ON u.id = s.user_id\nGROUP BY u.name\nORDER BY 2 DESC;", top: "30%", right: "2%" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" } }),
};

const features = [
  {
    icon: Code2,
    title: "1000+ Problems",
    desc: "From easy warm-ups to hard challenges across all major CS topics.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    link: "/problems",
  },
  {
    icon: Trophy,
    title: "Live Contests",
    desc: "Compete in real-time contests and earn points on the leaderboard.",
    color: "bg-yellow-50 text-yellow-600 border-yellow-100",
    link: "/contests",
  },
  {
    icon: Briefcase,
    title: "Placement Prep",
    desc: "Browse real job listings and practice for technical interviews.",
    color: "bg-green-50 text-green-600 border-green-100",
    link: "/placements",
  },
  {
    icon: Sparkles,
    title: "AI Generator",
    desc: "Generate custom problems with AI — pick any topic and difficulty.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    link: "/ai-generator",
  },
  {
    icon: MessageSquare,
    title: "Community Discuss",
    desc: "Share solutions, ask questions and learn from 10,000+ coders.",
    color: "bg-pink-50 text-pink-600 border-pink-100",
    link: "/discussions",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    desc: "Monitor your streak, acceptance rate and difficulty breakdown.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    link: "/profile",
  },
];

const stats = [
  { label: "Problems", value: "1,000+", icon: Code2 },
  { label: "Users", value: "10,000+", icon: Users },
  { label: "Contests", value: "50+", icon: Trophy },
  { label: "Companies", value: "200+", icon: Briefcase },
];

const steps = [
  { num: "01", title: "Create a free account", desc: "Sign up in seconds — no credit card required." },
  { num: "02", title: "Pick a problem", desc: "Filter by difficulty, category or topic." },
  { num: "03", title: "Code and submit", desc: "Write your solution and get instant feedback." },
  { num: "04", title: "Climb the ranks", desc: "Earn points and compete with the community." },
];

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-400/20 blur-3xl" />
        </div>

        {/* Floating code snippets */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {CODE_SNIPPETS.map((s, i) => (
            <motion.div
              key={i}
              className="absolute hidden xl:block bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 font-mono text-[11px] text-white/75 w-56 shadow-xl"
              style={{ top: s.top, right: s.right }}
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4 + i * 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
            >
              <pre className="whitespace-pre leading-relaxed">{s.code}</pre>
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            {user ? (
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
                <Star size={14} className="text-yellow-300" />
                Welcome back, <strong>{user.username}</strong>!
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
                <Zap size={14} className="text-yellow-300" />
                The #1 platform for coding mastery
              </div>
            )}

            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
              Level Up Your{" "}
              <TypeAnimation
                sequence={[
                  "Coding Skills", 2200,
                  "Problem Solving", 2200,
                  "Interview Game", 2200,
                  "Career Growth", 2200,
                ]}
                wrapper="span"
                repeat={Infinity}
                cursor={true}
                className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300"
              />
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-xl mx-auto leading-relaxed">
              Practice problems, compete in contests, ace interviews, and land
              your dream job — all in one place.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/problems"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-bold text-base rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20"
              >
                Start Solving <ArrowRight size={18} />
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold text-base rounded-xl hover:bg-white/20 transition-all"
                >
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────── */}
      <section className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                className="flex items-center gap-3"
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon size={18} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Features grid ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Everything you need to <span className="text-blue-600">succeed</span>
          </motion.h2>
          <motion.p
            className="text-slate-500 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            CampusCode brings together all the tools top engineers use to prepare and grow.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Link
                  to={f.link}
                  className="group ca-card-hover p-6 flex flex-col h-full block"
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${f.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1.5 group-hover:text-blue-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1">{f.desc}</p>
                  <div className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-4">
                    Explore <ChevronRight size={16} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <motion.h2
              className="text-3xl font-bold text-slate-900 mb-3"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              How it works
            </motion.h2>
            <motion.p
              className="text-slate-500"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              Get started in minutes
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                className="relative flex flex-col items-center text-center"
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-200"
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  {s.num}
                </motion.div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+36px)] right-0 h-px bg-blue-200" />
                )}
                <h3 className="font-semibold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-extrabold mb-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to start your journey?
          </motion.h2>
          <motion.p
            className="text-blue-200 text-lg mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Join 10,000+ developers sharpening their skills on CampusCode today.
          </motion.p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/problems"
              className="px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg"
            >
              Browse Problems
            </Link>
            {!user && (
              <Link
                to="/register"
                className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                Create Free Account
              </Link>
            )}
          </div>

          {/* Guarantee bullets */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-blue-200">
            {["Free forever", "No credit card required", "Instant access"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-400" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
