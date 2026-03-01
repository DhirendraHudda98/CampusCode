import React, { createContext, useContext, useEffect, useState } from "react";

// 8 preset color themes
export const THEMES = [
  {
    name:    "blue",
    label:   "Ocean",
    hex:     "#2563eb",
    hover:   "#1d4ed8",
    light:   "#eff6ff",
    navFrom: "#1d4ed8",
    navVia:  "#2563eb",
    navTo:   "#4338ca",
  },
  {
    name:    "purple",
    label:   "Royal",
    hex:     "#7c3aed",
    hover:   "#6d28d9",
    light:   "#f5f3ff",
    navFrom: "#5b21b6",
    navVia:  "#7c3aed",
    navTo:   "#6d28d9",
  },
  {
    name:    "green",
    label:   "Forest",
    hex:     "#16a34a",
    hover:   "#15803d",
    light:   "#f0fdf4",
    navFrom: "#15803d",
    navVia:  "#16a34a",
    navTo:   "#0d9488",
  },
  {
    name:    "orange",
    label:   "Sunset",
    hex:     "#ea580c",
    hover:   "#c2410c",
    light:   "#fff7ed",
    navFrom: "#9a3412",
    navVia:  "#ea580c",
    navTo:   "#d97706",
  },
  {
    name:    "red",
    label:   "Cherry",
    hex:     "#dc2626",
    hover:   "#b91c1c",
    light:   "#fef2f2",
    navFrom: "#991b1b",
    navVia:  "#dc2626",
    navTo:   "#e11d48",
  },
  {
    name:    "teal",
    label:   "Aqua",
    hex:     "#0d9488",
    hover:   "#0f766e",
    light:   "#f0fdfa",
    navFrom: "#0f766e",
    navVia:  "#0d9488",
    navTo:   "#0284c7",
  },
  {
    name:    "pink",
    label:   "Rose",
    hex:     "#db2777",
    hover:   "#be185d",
    light:   "#fdf2f8",
    navFrom: "#9d174d",
    navVia:  "#db2777",
    navTo:   "#a21caf",
  },
  {
    name:    "dark",
    label:   "Night",
    hex:     "#6366f1",
    hover:   "#4f46e5",
    light:   "#eef2ff",
    navFrom: "#0f172a",
    navVia:  "#1e293b",
    navTo:   "#312e81",
  },
];

const ThemeContext = createContext(null);

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--primary",       theme.hex);
  root.style.setProperty("--primary-hover", theme.hover);
  root.style.setProperty("--primary-light", theme.light);
  root.setAttribute("data-theme", theme.name);
}

function applyDark(dark) {
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function safeGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch {} }

export function ThemeProvider({ children }) {
  const saved   = safeGet("ca-theme");
  const initial = THEMES.find((t) => t.name === saved) || THEMES[0];
  const [theme, setThemeState] = useState(initial);

  const savedDark = safeGet("ca-dark") === "true";
  const [darkMode, setDarkModeState] = useState(savedDark);

  // Apply on mount + whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Apply dark mode on mount + whenever it changes
  useEffect(() => {
    applyDark(darkMode);
  }, [darkMode]);

  const setTheme = (t) => {
    safeSet("ca-theme", t.name);
    setThemeState(t);
  };

  const toggleDarkMode = () => {
    setDarkModeState((prev) => {
      const next = !prev;
      safeSet("ca-dark", String(next));
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
