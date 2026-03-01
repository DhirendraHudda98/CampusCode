# CodeArena Environment Configuration

## Frontend Setup

1. Copy `.env.example` to `.env.local`
2. Set the API base URL (default: http://localhost:5000)

```bash
VITE_API_URL=http://localhost:5000
```

## Backend Setup

1. Create `.env` file with MongoDB connection:

```bash
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
```

## Starting Both Servers

### Terminal 1 - Backend
```bash
cd backend
npm install  # (first time only)
node server.js
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install  # (first time only)
npm run dev
```

The app will be available at `http://localhost:5173`

## API Base URL

By default, the frontend will proxy all `/api/**` requests to `http://localhost:5000` using Vite's proxy configuration in `vite.config.js`.

If you need to change the backend URL, update:
- `frontend/vite.config.js` (development)
- Environment variables in `.env.local` (optional)
