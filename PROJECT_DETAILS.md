# VedaAI — A to Z Project Blueprint & Technical Details

VedaAI is a modern, responsive, AI-powered Assessment Creator platform that allows teachers to generate comprehensive, structured, and curriculum-aligned question papers dynamically using AI. It integrates a fast **TanStack Start (React)** frontend with a robust, distributed **Node.js/Express + BullMQ + Socket.io** backend.

---

## 1. High-Level System Architecture

VedaAI uses a queue-based asynchronous processing architecture. Generating high-quality assessments from large LLMs takes 15–30 seconds. Instead of making the user wait on a blocking HTTP request, the system processes tasks in the background and delivers real-time UI updates via WebSockets.

```
                  ┌──────────────────────────────────────────┐
                  │          TanStack Start Client           │
                  │   React + Zustand Store + Socket.io      │
                  └────────────┬───────────────────▲─────────┘
                               │                   │
                     HTTP POST │                   │ Real-time
            /api/assignments   │                   │ WebSocket Updates
                               ▼                   │ (Status changes, paper JSON)
                  ┌──────────────────────────────  │ ────────┐
                  │       Express API Server       │         │
                  │  Saves pending state to DB     │         │
                  └────────────┬───────────────────┼─────────┘
                               │                   │
                               │ Queue Job         │ Socket Emits
                               ▼                   │
                  ┌──────────────────────────────┐ │
                  │     Redis (Upstash/BullMQ)   │ │
                  └────────────┬─────────────────┘ │
                               │                   │
                               │ Worker Polls      │
                               ▼                   │
                  ┌──────────────────────────────┐ │
                  │        BullMQ Worker         ├─┘
                  │  Calls Gemini 2.0 & Updates  │
                  │  DB with finished JSON paper │
                  └────────────┬─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Google Gemini AI   │
                    │   2.0 Flash Model   │
                    └─────────────────────┘
```

---

## 2. Technology Stack

### Frontend Architecture
- **Core Framework**: React 19 + TypeScript + TanStack Start (Vite).
- **Client Routing**: TanStack Router (Typesafe file-based routing with layouts, index files, and parameter parameters).
- **State Management**: Zustand (Asynchronous operations, caching, real-time WebSocket state injection).
- **Styling & Icons**: Tailwind CSS + Vanilla CSS + Lucide React icons.
- **WebSocket Client**: `socket.io-client` with a resilient room-based subscription system.

### Backend Architecture
- **Web Server**: Node.js + Express.js + CORS + JSON body parser.
- **Database**: MongoDB (Mongoose schemas with nested sub-document representations for papers, sections, and questions).
- **Distributed Queue**: BullMQ (Redis-backed task runner utilizing exponential backoffs and multiple retries).
- **Caching & Broker**: Redis (Fully supporting TLS integration for secure serverless platforms like Upstash).
- **WebSocket Server**: Socket.io (Configured with custom event channels and structured target rooms).
- **AI Integration**: `@google/generative-ai` utilizing Google's advanced `gemini-2.0-flash` model.

---

## 3. Directory & File Breakdown (A to Z)

Here is a full breakdown of the folder structure and the explicit responsibilities of every file.

```
veda-ai/
├── backend/                       # Node.js + Express + BullMQ Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   └── assignmentController.ts # Logic for handling Express HTTP requests
│   │   ├── models/
│   │   │   └── Assignment.ts      # Mongoose schema + types for MongoDB
│   │   ├── queues/
│   │   │   └── assignmentQueue.ts # BullMQ configuration & Redis connection
│   │   ├── routes/
│   │   │   └── assignmentRoutes.ts # Mapping endpoints to controller handlers
│   │   ├── services/
│   │   │   └── aiService.ts       # Prompt engineering + Gemini API client
│   │   ├── sockets/
│   │   │   └── socketSetup.ts     # Handlers for client room subscriptions
│   │   ├── utils/
│   │   │   └── socketEmitter.ts   # Helper to emit events globally from workers
│   │   ├── workers/
│   │   │   └── assignmentWorker.ts # Background thread handling generation jobs
│   │   └── index.ts               # Main server entrypoint (Express, Sockets, DB)
│   ├── .env                       # Backend Environment Variables (Git-ignored)
│   ├── package.json               # Backend dependencies & scripts
│   └── tsconfig.json              # Backend TypeScript compilation rules
│
├── src/                           # TanStack Start Frontend
│   ├── assets/                    # Static assets & images
│   ├── components/                # Reusable UI components (AppShell, Sidebar)
│   ├── hooks/
│   │   └── use-assignments-ws.ts  # Real-time WebSocket bridge hook
│   ├── lib/
│   │   ├── api.ts                 # Typed HTTP client + enums mapper
│   │   └── socket.ts              # Socket.io Client manager (Singleton)
│   ├── routes/                    # File-based routing rules
│   │   ├── __root.tsx             # HTML frame, scripts, head tags, context
│   │   ├── index.tsx              # Dashboard / Home Screen
│   │   ├── assignments.tsx        # Assignments transparent layout route
│   │   ├── assignments.index.tsx  # Assignments table list page
│   │   ├── assignments.create.tsx # Multi-step assessment configuration form
│   │   └── assignments.output.$id.tsx # Dynamic real-time assessment page
│   └── store/
│       └── assignments.ts         # Zustand state store with async actions
```

---

## 4. Key Workflows & Pipelines

### 4.1 Form Creation Pipeline
1. The teacher enters basic information (Title, Subject, Instructions) on `/assignments/create`.
2. They customize question sections (e.g., MCQs, Short Answers) using real-time total mark and question aggregators.
3. Upon clicking **Next**, the UI invokes the `createAssignment` Zustand action.
4. The frontend routes values into a unified request body. The API mapping function translates user-friendly titles to backend enums:
   - *"Multiple Choice Questions"* ➔ `mcq`
   - *"Short Questions"* ➔ `short_answer`
   - *"Long Answer Questions"* ➔ `long_answer`
   - *"Diagram/Graph-Based Questions"* ➔ `diagram`
   - *"Numerical Problems"* ➔ `numerical`
   - *"True/False"* ➔ `true_false`
5. The REST client performs an HTTP POST request to `/api/assignments`.

### 4.2 Queue & Background Job Processing
1. Express receives the POST request. It validates the body parameters, calculates the total marks, and initializes a Mongoose `Assignment` with a status of `pending`.
2. The server calls `addAssignmentJob(assignmentId)` to drop a task into the BullMQ Redis queue.
3. The server updates the assignment state in MongoDB to `queued`, tracks the associated `jobId`, and returns a `201 Created` response.
4. The client receives the response and immediately navigates to `/assignments/output/$id`.

### 4.3 Gemini AI & Real-time Sockets Integration
1. On mount, `/assignments/output/$id` establishes a Socket.io connection and emits a `subscribe:assignment` event specifying the `assignmentId`. The Socket.io backend places that socket into a specific chat/update room for that ID.
2. Simultaneously, the background worker picks up the job from Redis.
3. The worker updates the MongoDB assignment status to `generating` and uses the `socketEmitter` to push a WebSocket event to the socket room. The frontend immediately transitions the UI into a loading spinner showing *"Our AI is crafting your questions..."*
4. The worker compiles a meticulously detailed system prompt containing subject context, structured question constraints, and strict formatting rules. It invokes `gemini-2.0-flash` on the Google Generative AI SDK.
5. Gemini processes the query and outputs a valid JSON string adhering to the requested schema.
6. The service parses the JSON response, validates its structure, and returns it to the worker.
7. The worker saves the compiled paper JSON to MongoDB and sets the assignment status to `completed`.
8. The worker broadcasts the finished status and the compiled paper payload via WebSockets.
9. The frontend receives the payload, dispatches an action to update the local Zustand store, hides the loading state, and renders the complete question paper with rich typography.

---

## 5. Mongoose Data Schema (`models/Assignment.ts`)

Assessments are stored in MongoDB using nested sub-documents to ensure structural integrity and quick loading.

```typescript
const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: Date, required: true },
  instructions: { type: String, default: "" },
  questionTypes: [{
    type: { type: String, required: true },
    count: { type: Number, required: true },
    marksEach: { type: Number, required: true }
  }],
  totalMarks: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "queued", "generating", "completed", "failed"],
    default: "pending"
  },
  jobId: { type: String },
  generatedPaper: {
    title: String,
    subject: String,
    totalMarks: Number,
    duration: String,
    sections: [{
      title: String,
      instruction: String,
      questions: [{
        text: String,
        difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
        marks: Number,
        options: [String] // Optional: Used for MCQ choices
      }]
    }]
  },
  errorMessage: { type: String },
}, { timestamps: true });
```

---

## 6. Real-time Socket Communication Contract

Client-server Socket.io events:

### Client to Server Events
- `subscribe:assignment` (Payload: `{ assignmentId: string }`): Joins a dedicated status room for real-time monitoring of a processing assessment.
- `unsubscribe:assignment` (Payload: `{ assignmentId: string }`): Leaves the room to prevent resource overhead.

### Server to Client Events
- `assignment:status` (Payload: `AssignmentStatusEvent`): Broad-casted on worker state transition.
```typescript
interface AssignmentStatusEvent {
  assignmentId: string;
  status: "queued" | "generating" | "completed" | "failed";
  paper?: object; // Attached when completed
  error?: string; // Attached when failed
}
```

---

## 7. Crucial Configuration & Operational Details

### 7.1 TLS Upstash Redis Configuration
Upstash Redis databases require TLS connection encapsulation. The `assignmentQueue.ts` has been built to detect serverless endpoints beginning with `rediss://` and dynamically inject security structures:
```typescript
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  ...(redisUrl.startsWith("rediss://") ? { tls: {} } : {}),
});
```

### 7.2 TanStack Router Nesting Strategy
By default, TanStack Router treats folders as layouts. To ensure sub-routes like `/assignments/create` and `/assignments/output/$id` render without intercepting their parent page, the list and static fallback route were extracted:
- `assignments.tsx`: Layout file rendering `<Outlet />` only.
- `assignments.index.tsx`: Render list on `/assignments` exactly.
- `assignments.output.tsx`: Layout wrapper for output sub-routes.
- `assignments.output.index.tsx`: Fallback dynamic output landing page.
- `assignments.output.$id.tsx`: Individual assessment viewer.
