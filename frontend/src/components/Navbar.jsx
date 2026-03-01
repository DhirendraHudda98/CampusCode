import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Menu, X, LogOut, Code2, Home, Trophy, Briefcase,
  MessageSquare, Sparkles, LayoutDashboard, BookPlus,
  UserCircle, ChevronDown, Zap, Palette, Moon, Sun, Flame, BookOpen, Bell,
} from "lucide-react";

const navLinks = [
  { to: "/",            label: "Home",        icon: Home },
  { to: "/problems",    label: "Problems",    icon: Code2 },
  { to: "/daily",       label: "Daily",       icon: Flame },
  { to: "/contests",    label: "Contests",    icon: Trophy },
  { to: "/placements",  label: "Placements",  icon: Briefcase },
  { to: "/prep",        label: "Prep",        icon: BookOpen },
  { to: "/leaderboard", label: "Leaderboard", icon: Zap },
  { to: "/discussions", label: "Discuss",     icon: MessageSquare },
];

const teacherLinks = [
  { to: "/ai-generator",         label: "AI Generator",      icon: Sparkles },
  { to: "/teacher",              label: "Dashboard",         icon: LayoutDashboard },
  { to: "/teacher/problems/new", label: "Create Problem",    icon: BookPlus },
];

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      end={to === "/"}
      className={({ isActive }) =>
        `relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ` +
        (isActive
          ? "bg-white/15 text-white"
          : "text-white/80 hover:bg-white/10 hover:text-white")
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { theme, setTheme, themes, darkMode, toggleDarkMode } = useTheme();
  const nav = useNavigate();
  const location = useLocation();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifs,      setNotifs]      = useState([]);
  const dropRef    = useRef(null);
  const paletteRef = useRef(null);
  const notifRef   = useRef(null);

  // close dropdowns on route change
  useEffect(() => {
    setMobileOpen(false);
    setTeacherOpen(false);
    setPaletteOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  // close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setTeacherOpen(false);
      if (paletteRef.current && !paletteRef.current.contains(e.target)) setPaletteOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // fetch notifications for logged-in users, poll every 60s
  useEffect(() => {
    if (!user) { setNotifs([]); return; }
    const fetchNotifs = () => {
      axios.get("/api/notifications", { withCredentials: true })
        .then(r => setNotifs(r.data.notifications || []))
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const onLogout = async () => {
    await logout();
    nav("/");
  };

  const unreadCount = notifs.filter(n => !n.read).length;
  const markAllRead = () => {
    axios.post("/api/notifications/read", {}, { withCredentials: true }).catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const isTeacher = user?.role === "teacher";
  const isAdmin   = user?.role === "admin";

  const navStyle = {
    background: `linear-gradient(to right, ${theme.navFrom}, ${theme.navVia}, ${theme.navTo})`,
  };

  return (
    <nav className="sticky top-0 z-50 w-full shadow-lg" style={navStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 font-bold text-white text-lg shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Code2 size={18} className="text-white" />
            </div>
            <span className="hidden sm:block tracking-tight">CampusCode</span>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">
            {navLinks.map((l) => (
              <NavItem key={l.to} to={l.to} label={l.label} />
            ))}

            {/* Teacher dropdown */}
            {isTeacher && (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setTeacherOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-yellow-200 hover:bg-white/10 hover:text-yellow-100 transition-all duration-150"
                >
                  <Sparkles size={14} />
                  Teacher
                  <ChevronDown size={13} className={`transition-transform duration-200 ${teacherOpen ? "rotate-180" : ""}`} />
                </button>
                {teacherOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 overflow-hidden animate-fade-in">
                    {teacherLinks.map((l) => {
                      const Icon = l.icon;
                      return (
                        <NavLink
                          key={l.to}
                          to={l.to}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ` +
                            (isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700 hover:bg-slate-50")
                          }
                        >
                          <Icon size={15} />
                          {l.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ` +
                  (isActive ? "bg-red-500/30 text-red-200" : "text-red-300 hover:bg-red-500/20 hover:text-red-200")
                }
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* Right side — theme picker + auth */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">

            {/* 🔔 Notification bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen(o => !o); if (!notifOpen && unreadCount > 0) markAllRead(); }}
                  title="Notifications"
                  className="relative flex items-center justify-center w-8 h-8 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-1 animate-fade-in z-50">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                      <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                      {notifs.length > 0 && (
                        <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifs.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-400 text-sm">
                        <Bell size={24} className="mx-auto mb-2 opacity-30" />
                        No notifications yet
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {notifs.slice(0, 10).map(n => (
                          <div key={n._id}
                            className={`px-4 py-3 border-b last:border-0 transition-colors cursor-default ${
                              !n.read ? "bg-blue-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read ? "bg-blue-500" : "bg-transparent"}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* � Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* �🎨 Theme color picker */}
            <div className="relative" ref={paletteRef}>
              <button
                onClick={() => setPaletteOpen((o) => !o)}
                title="Change theme color"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm"
              >
                <Palette size={16} />
                <span
                  className="w-3 h-3 rounded-full border border-white/40"
                  style={{ background: theme.hex }}
                />
              </button>
              {paletteOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-3 animate-fade-in z-50">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Theme Color</p>
                  <div className="grid grid-cols-4 gap-2">
                    {themes.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => { setTheme(t); setPaletteOpen(false); }}
                        title={t.label}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all hover:bg-slate-50 ${
                          theme.name === t.name ? "ring-2 ring-offset-1 ring-slate-400 bg-slate-50" : ""
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-full shadow-sm border border-slate-200"
                          style={{ background: `linear-gradient(135deg, ${t.navFrom}, ${t.navTo})` }}
                        />
                        <span className="text-[10px] text-slate-600 font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="w-20 h-8 bg-white/10 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden xl:block">{user.username}</span>
                  <span className={`text-xs hidden xl:block px-1.5 py-0.5 rounded-full font-medium ${
                    user.role === "admin" ? "bg-red-500/30 text-red-200"
                    : user.role === "teacher" ? "bg-yellow-400/30 text-yellow-200"
                    : "bg-white/15 text-white/70"
                  }`}>
                    {user.role}
                  </span>
                </NavLink>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-red-500/80 border border-white/20 hover:border-red-400 rounded-lg text-sm text-white transition-all duration-150"
                >
                  <LogOut size={14} />
                  <span className="hidden xl:block">Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all">
                  Login
                </NavLink>
                <NavLink to="/register" className="px-4 py-2 bg-white font-semibold text-sm rounded-lg hover:bg-white/90 transition-all shadow-sm" style={{ color: theme.hex }}>
                  Sign Up
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden backdrop-blur-sm border-t border-white/10 animate-slide-up"
          style={{ background: theme.navFrom + "f0" }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ` +
                  (isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white")
                }
              >
                <l.icon size={16} />
                {l.label}
              </NavLink>
            ))}

            {isTeacher && (
              <>
                <div className="h-px bg-white/10 my-2" />
                <div className="px-4 py-1 text-xs font-semibold text-yellow-300 uppercase tracking-widest">Teacher</div>
                {teacherLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ` +
                      (isActive ? "bg-yellow-400/20 text-yellow-200" : "text-white/80 hover:bg-white/10 hover:text-white")
                    }
                  >
                    <l.icon size={16} />
                    {l.label}
                  </NavLink>
                ))}
              </>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ` +
                  (isActive ? "bg-red-400/20 text-red-200" : "text-red-300 hover:bg-red-500/10")
                }
              >
                Admin Panel
              </NavLink>
            )}

            <div className="h-px bg-white/10 my-2" />

            {/* Mobile theme picker */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Palette size={12} /> Theme Color
              </p>
              <div className="flex flex-wrap gap-2">
                {themes.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t)}
                    title={t.label}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      theme.name === t.name ? "border-white scale-110" : "border-white/30 hover:border-white/60"
                    }`}
                    style={{ background: `linear-gradient(135deg, ${t.navFrom}, ${t.navTo})` }}
                  />
                ))}
              </div>

              {/* Dark mode toggle - mobile */}
              <button
                onClick={toggleDarkMode}
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all w-full"
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                <span className="ml-auto text-xs text-white/50">{darkMode ? "On" : "Off"}</span>
              </button>
            </div>

            <div className="h-px bg-white/10 my-2" />

            {user ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10"
                >
                  <UserCircle size={16} />
                  {user.username}
                  <span className="ml-auto text-xs text-white/50 capitalize">{user.role}</span>
                </NavLink>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 w-full text-left"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium text-white border border-white/20 hover:bg-white/10"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-white/90"
                  style={{ color: theme.hex }}
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
