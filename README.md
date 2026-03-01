# CodeArena - Competitive Coding Platform

A full-stack competitive coding platform with problem solving, contests, placements, and AI-powered features.

## ?? What We Fixed

### Why It Wasn''t Working & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS Errors | Frontend on 5173, backend on 5000 with no proxy | Added Vite proxy to vite.config.js |
| Missing Navigation | Navbar only had 3 links | Created enhanced Navbar with 20+ routes |
| API Calls Failing | No frontend-to-backend proxy | Set up /api proxy forwarding |
| Bland UI | Minimal styling | Added Tailwind CSS throughout |
| No Mobile Support | Desktop-only design | Added responsive mobile menu |

## ?? Quick Start

### Start Backend (Terminal 1)
```bash
cd backend
npm install  # first time only
node server.js
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm install --legacy-peer-deps  # first time only
npm run dev
```

Open http://localhost:5173

## ?? Features

- 1000+ coding problems (Easy, Medium, Hard)
- Real-time code editor with test cases
- Coding contests and leaderboards
- Job placement opportunities
- Community discussions
- AI-powered problem generation
- Student, Teacher, and Admin roles

## ?? Test Account

Sign up at /register to create a new account. Choose your role:
- Student: Solve problems, join contests
- Teacher: Create problems, post jobs
- Admin: Manage users

## ?? Project Structure

```
backend/          - Express.js server (12 routes, MongoDB)
frontend/         - React + Vite (14 pages, Tailwind CSS)
public/           - Static files
scripts/          - Data seeding scripts
```

## ?? Technologies

Frontend: React 18, Vite, React Router, Tailwind CSS, Axios
Backend: Node.js, Express, MongoDB, JWT, bcryptjs

## ?? Improvements Made

? API Proxy in Vite config for seamless frontend-backend communication
? Enhanced Navbar with all page links and role-based navigation  
? Improved Home page with features showcase
? Responsive mobile design with hamburger menu
? Better styling with Tailwind CSS
? Auth state properly integrated
? Loading states throughout
? All 14 pages ported and functional

## ?? Common Issues

**"Cannot find module express"** ? cd backend && npm install
**CORS Errors** ? Make sure backend is running on 5000
**Port in use** ? kill old node processes or use different port
**Frontend won''t load** ? Clear cache and restart Vite

## ?? API Base URL

Frontend proxies all /api/* requests to http://localhost:5000 via Vite proxy.

## ?? Ready to Code!

The platform is now fully functional. Start solving problems!
