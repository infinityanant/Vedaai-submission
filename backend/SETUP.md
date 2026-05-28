# VedaAI Backend — Setup Guide

Follow these steps to get the backend running locally.

---

## 1. Get a FREE Gemini API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key

> **Note:** Gemini 1.5 Flash has a free tier with **15 requests/minute** and **1,500 requests/day**. No credit card required.

---

## 2. Set up FREE MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account (no credit card needed)
3. Create a **free M0 cluster**
4. Create a database user with a password
5. Under **Network Access**, whitelist IP `0.0.0.0/0` (allow all — for development only)
6. Click **"Connect" → "Drivers"** and copy the connection string
7. Replace `<password>` with your actual password
8. Add `/vedaai` at the end of the connection string

Example:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/vedaai
```

---

## 3. Set up Redis

### Option A: Local Redis

**Mac:**
```bash
brew install redis
brew services start redis
```

**Ubuntu / WSL:**
```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

**Windows (via WSL):**
1. Install WSL: `wsl --install` (PowerShell as Admin)
2. Open WSL terminal
3. Follow the Ubuntu instructions above

**Windows (via Docker):**
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

### Option B: Redis Cloud (Free Tier)

1. Go to [https://redis.io/try-free](https://redis.io/try-free)
2. Create a free account (30MB free, no credit card)
3. Create a database
4. Copy the `redis://` connection string

---

## 4. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
```
PORT=3001
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/vedaai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_actual_api_key
CLIENT_URL=http://localhost:5173
```

---

## 5. Run the Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ Connected to MongoDB
✅ Connected to Redis
✅ BullMQ worker started
🚀 VedaAI Backend running on port 3001
```

Test the health endpoint:
```bash
curl http://localhost:3001/health
# { "status": "ok", "timestamp": "..." }
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `maxRetriesPerRequest` error | Already handled — ioredis config includes `maxRetriesPerRequest: null` |
| Gemini returns markdown JSON | Already handled — code strips ` ```json ` fences |
| Socket.io CORS error | Check `CLIENT_URL` env var matches your frontend origin exactly |
| MongoDB connection timeout | Check Atlas IP whitelist includes `0.0.0.0/0` |
| Worker not processing | Make sure `startWorker()` is called (it's auto-called in `index.ts`) |
