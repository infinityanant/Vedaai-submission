# 🚀 VedaAI — AI Powered Assessment Creator

An AI-driven full-stack platform that enables teachers to generate structured, curriculum-aligned assessments dynamically using Large Language Models, asynchronous job processing, and real-time WebSocket updates.

Built as part of the VedaAI Full Stack Engineering Assignment.

---

# ✨ Features

## 📄 Assignment Creation

Teachers can:

* Create assignments dynamically
* Configure multiple question types
* Set due dates
* Define marks distribution
* Add custom instructions
* Upload contextual learning materials *(extensible multimodal pipeline)*

---

## 🤖 AI Question Paper Generation

The system generates:

* Structured exam papers
* Multiple sections (A, B, etc.)
* Difficulty-tagged questions
* Marks allocation
* MCQs / Short / Long / Numerical / Diagram-based questions

The AI output is parsed into structured JSON instead of rendering raw LLM text.

---

## ⚡ Real-time Status Updates

The platform uses WebSockets for live updates:

* Queued
* Generating
* Completed
* Failed

Users receive real-time generation progress without refreshing the page.

---

## 🧠 Queue-Based Async Architecture

LLM generation is processed asynchronously using:

* BullMQ
* Redis
* Dedicated workers

This prevents blocking HTTP requests and creates a scalable architecture for long-running AI tasks.

---

# 🏗️ System Architecture

VedaAI follows a distributed queue-based architecture for scalable AI processing.

```text
                 ┌──────────────────────────────────────────┐
                 │          Frontend Client                 │
                 │  TanStack Start + Zustand + Socket.io   │
                 └───────────────┬──────────────────────────┘
                                 │
                       HTTP POST │
                 /api/assignments│
                                 ▼
                 ┌──────────────────────────────────────────┐
                 │          Express API Server              │
                 │  Validation + DB Persistence + Queue     │
                 └───────────────┬──────────────────────────┘
                                 │
                                 ▼
                 ┌──────────────────────────────────────────┐
                 │            BullMQ Queue                  │
                 │         Redis-backed Jobs                │
                 └───────────────┬──────────────────────────┘
                                 │
                                 ▼
                 ┌──────────────────────────────────────────┐
                 │          Worker Process                  │
                 │   Gemini Prompting + JSON Parsing        │
                 └───────────────┬──────────────────────────┘
                                 │
                                 ▼
                 ┌──────────────────────────────────────────┐
                 │              MongoDB                     │
                 │     Generated Paper + Metadata           │
                 └───────────────┬──────────────────────────┘
                                 │
                                 ▼
                 ┌──────────────────────────────────────────┐
                 │            Socket.io Server              │
                 │      Real-time Client Updates            │
                 └──────────────────────────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React 19
* TypeScript
* TanStack Start
* Zustand
* Tailwind CSS
* Socket.io Client
* React Hook Form
* Zod

---

## Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Redis
* BullMQ
* Socket.io

---

## AI Layer

* Google Gemini 2.0 Flash
* Structured Prompt Engineering
* JSON-based Output Parsing

---

# 📂 Project Structure

```bash
veda-ai/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── queues/
│   ├── routes/
│   ├── services/
│   ├── workers/
│   ├── sockets/
│   └── utils/
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   ├── store/
│   └── assets/
```

---

# ⚙️ Backend Flow

## 1. Assignment Creation

Frontend sends assignment configuration to:

```http
POST /api/assignments
```

---

## 2. Queue Injection

The server:

* validates payload
* stores assignment metadata
* pushes a generation job into BullMQ

---

## 3. Worker Processing

Dedicated workers:

* generate prompts
* invoke Gemini API
* validate JSON output
* store generated paper

---

## 4. Real-time Updates

Socket.io broadcasts:

* queued
* generating
* completed
* failed

The frontend updates instantly.

---

# 📡 WebSocket Event Contract

## Client → Server

```ts
subscribe:assignment
unsubscribe:assignment
```

---

## Server → Client

```ts
assignment:status
```

Payload:

```ts
{
  assignmentId: string;
  status: "queued" | "generating" | "completed" | "failed";
  paper?: object;
  error?: string;
}
```

---

# 🧾 Structured AI Output

Instead of rendering raw LLM responses, the system enforces structured JSON generation.

Example:

```json
{
  "title": "Mid-Term Examination",
  "subject": "Physics",
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "text": "Define Newton's First Law.",
          "difficulty": "Easy",
          "marks": 2
        }
      ]
    }
  ]
}
```

---

# 🔥 Why Queue-Based Processing?

LLM generation can take 15–30 seconds.

Instead of blocking HTTP requests:

* jobs are pushed into Redis queues
* workers process generation asynchronously
* clients receive live updates via sockets

This architecture:

* improves scalability
* avoids request timeouts
* supports concurrent assessment generation

---

# 🧠 Design Decisions

## Zustand over Redux

Chosen for:

* minimal boilerplate
* lightweight global state
* simpler async integration

---

## BullMQ + Redis

Chosen because:

* AI generation is long-running
* retries and job persistence are needed
* async workflows scale better

---

## Structured JSON Parsing

Raw AI text is unreliable.

The backend validates and parses AI responses into strongly typed structures before rendering.

---

# 📱 UI Highlights

* Responsive dashboard
* Mobile navigation support
* Dynamic question builders
* Real-time status indicators
* Structured exam paper rendering
* Modern Figma-inspired UI

---

# 🔐 Environment Variables

Create a `.env` file in both frontend/backend where required.

## Backend `.env`

```env
PORT=5000

MONGODB_URI=your_mongodb_uri

REDIS_URL=your_redis_url

GEMINI_API_KEY=your_gemini_api_key
```

---

# 🚀 Running Locally

## Frontend

```bash
npm install
npm run dev
```

---

## Backend

```bash
cd backend

npm install

npm run dev
```

---

# 🌍 Deployment

## Frontend

Recommended:

* Vercel

## Backend

Recommended:

* Render
* Railway

---

# ⚠️ Current Limitations

## 1. Frontend Framework

The frontend currently uses TanStack Start instead of Next.js because the UI scaffolding was generated using Lovable, which does not support Next.js.

---

## 2. AI Structured Output Reliability

The current implementation relies on prompt-based JSON compliance. Future versions can leverage Gemini native response schemas.

---

## 3. Multimodal Upload Pipeline

Document/image uploads are currently UI-ready but backend multimodal processing can be extended further.

---

## 4. Horizontal WebSocket Scaling

Socket state is currently in-memory. Redis Socket.io adapters can be added for multi-instance deployments.

---

# 🔮 Future Improvements

* Native Gemini Structured Outputs
* Server-side PDF rendering
* Classroom & teacher authentication
* Role-based access
* Multilingual question generation
* Curriculum-aware AI generation
* Cloud object storage for uploads
* Redis socket clustering
* Advanced analytics dashboard

---

# 🧪 Engineering Focus Areas

This project emphasizes:

* distributed system design
* asynchronous architectures
* AI orchestration pipelines
* real-time communication
* scalable backend workflows
* structured data generation

---

# 📌 Submission Notes

Due to API quota limitations, AI integrations may require evaluator-provided API keys through environment variables.

The project includes:

* complete architecture
* integration pipeline
* queue-based workflows
* structured rendering logic
* deployment-ready setup

---

# 👨‍💻 Author

Anant Sharma

Built for the VedaAI Full Stack Engineering Assignment.
