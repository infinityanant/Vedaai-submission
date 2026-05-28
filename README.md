# VedaAI — AI-Powered Assessment Creator

Create structured, AI-generated question papers with real-time status updates.

---

## Architecture

```
Frontend (TanStack Start / React)
        ↓ HTTP POST /api/assignments
Express API Server
        ↓ addJob()
BullMQ Queue (Redis)
        ↓ process()
Worker → Google Gemini AI
        ↓ save result
MongoDB
        ↓ socket.emit()
Socket.io → Frontend (real-time update)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | TanStack Start, React 19, Zustand, TailwindCSS, Radix UI |
| **Backend** | Node.js, Express, TypeScript |
| **AI** | Google Gemini 1.5 Flash (free tier) |
| **Database** | MongoDB Atlas (free tier) |
| **Queue** | BullMQ + Redis |
| **Real-time** | Socket.io |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## Features

- ✅ Create assignments with custom question types (MCQ, Short Answer, Long Answer, True/False, Numerical, Diagram)
- ✅ AI-generated structured question papers via Google Gemini
- ✅ Real-time generation status via WebSocket (no polling)
- ✅ Async job queue with BullMQ (3 retries, exponential backoff)
- ✅ MongoDB persistence — assignments survive server restarts
- ✅ Full TypeScript across frontend and backend
- ✅ Responsive design with dark mode support

---

## Local Setup

### Prerequisites

- Node.js 18+
- Redis (local or cloud)
- MongoDB Atlas account (free)
- Gemini API key (free)

### Clone & Install

```bash
git clone <repo-url>
cd Veda-ai
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI, REDIS_URL, GEMINI_API_KEY in .env
npm run dev
```

> See [backend/SETUP.md](backend/SETUP.md) for detailed setup instructions.

### Frontend

```bash
# From project root
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `3001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend URL | `http://localhost:3001` |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/assignments` | Create assignment + queue AI generation |
| `GET` | `/api/assignments` | List all assignments |
| `GET` | `/api/assignments/:id` | Get single assignment |
| `DELETE` | `/api/assignments/:id` | Delete assignment |
| `GET` | `/api/assignments/:id/status` | Get generation status |
| `GET` | `/health` | Health check |

---

## WebSocket Events

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `subscribe:assignment` | `{ assignmentId }` |
| Client → Server | `unsubscribe:assignment` | `{ assignmentId }` |
| Server → Client | `assignment:status` | `{ assignmentId, status, paper?, error? }` |
| Server → Client | `subscribed` | `{ assignmentId }` |

### Status Flow

```
pending → queued → generating → completed
                              → failed (retries up to 3x)
```

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

### Backend → Render

1. Push to GitHub
2. On [Render](https://render.com): New > Web Service > connect repo
3. Root directory: `backend`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Set environment variables in dashboard
7. Add a Redis instance (free tier)
8. Set `CLIENT_URL` to your Vercel frontend URL

---

## Project Structure

```
Veda-ai/
├── src/                          # Frontend (TanStack Start + React)
│   ├── routes/                   # File-based routing
│   ├── store/                    # Zustand state management
│   ├── lib/                      # API client, socket client
│   ├── hooks/                    # React hooks
│   └── components/               # UI components
├── backend/                      # Backend (Express + TypeScript)
│   └── src/
│       ├── controllers/          # Route handlers
│       ├── models/               # MongoDB schemas
│       ├── routes/               # Express routes
│       ├── services/             # AI service (Gemini)
│       ├── queues/               # BullMQ queue setup
│       ├── workers/              # BullMQ worker
│       ├── sockets/              # Socket.io setup
│       └── utils/                # Helpers
├── vercel.json                   # Frontend deployment
└── README.md
```

---

Built for **VedaAI Full Stack Engineering Assignment**
