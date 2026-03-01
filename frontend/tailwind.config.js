/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1e293b",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        border: {
          DEFAULT: "#e2e8f0",
        },
        foreground: "#1e293b",
        background: "#f8fafc",
        easy: {
          DEFAULT: "#22c55e",
          bg: "#f0fdf4",
          text: "#15803d",
        },
        medium: {
          DEFAULT: "#f59e0b",
          bg: "#fffbeb",
          text: "#b45309",
        },
        hard: {
          DEFAULT: "#ef4444",
          bg: "#fef2f2",
          text: "#b91c1c",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger:  "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.10), 0 2px 4px -1px rgb(0 0 0 / 0.06)",
        form: "0 4px 24px 0 rgb(59 130 246 / 0.08)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in":        "fadeIn 0.3s ease-in-out",
        "slide-up":       "slideUp 0.3s ease-out",
        "shimmer":        "shimmer 1.4s ease-in-out infinite",
        "gradient-shift": "gradientShift 3s linear infinite",
        "float":          "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:        { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:       { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        shimmer:       { "0%": { backgroundPosition: "200% 0" }, "100%": { backgroundPosition: "-200% 0" } },
        gradientShift: { "0%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" }, "100%": { backgroundPosition: "0% 50%" } },
        float:         { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
    },
  },
  plugins: [],
};
