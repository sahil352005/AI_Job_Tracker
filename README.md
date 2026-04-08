# 🎯 JobTrack AI

A full-stack AI-powered job application tracker built with the MERN stack and TypeScript. Track your job applications on a Kanban board, auto-fill card details by pasting a job description, and get tailored resume bullet point suggestions — all powered by AI.

---

## ✨ Features

- **Kanban Board** — Drag and drop applications across 5 stages: Applied → Phone Screen → Interview → Offer → Rejected
- **AI Job Description Parser** — Paste any JD and AI extracts company, role, skills, seniority, and location automatically
- **AI Resume Suggestions** — Generates 4 tailored resume bullet points specific to the role and required skills
- **Multi-Provider AI** — Supports OpenAI (GPT-4o-mini), Groq (LLaMA 3.3), and Google Gemini with automatic fallback
- **JWT Authentication** — Register/login with email and password, stays logged in across page refreshes
- **Full CRUD** — Create, view, edit, and delete job applications
- **Per-user data** — Each user only sees their own applications

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite |
| State Management | TanStack React Query v5 |
| Drag & Drop | @hello-pangea/dnd |
| HTTP Client | Axios |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB with Mongoose |
| Authentication | JWT + bcryptjs |
| AI Providers | OpenAI API, Groq SDK, Google Generative AI |

---

## 📁 Project Structure

```
AiJobTrack/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.ts             # Axios instance with JWT interceptor
│   │   │   └── index.ts             # API functions (auth, applications, AI)
│   │   ├── components/
│   │   │   ├── ApplicationCard.tsx  # Kanban card component
│   │   │   ├── ApplicationDetail.tsx# Detail/view modal
│   │   │   └── ApplicationForm.tsx  # Create/edit modal with AI parser
│   │   ├── pages/
│   │   │   ├── AuthPage.tsx         # Login & register page
│   │   │   └── KanbanPage.tsx       # Main Kanban board
│   │   ├── store/
│   │   │   └── AuthContext.tsx      # Auth state (token, email, login, logout)
│   │   ├── types/
│   │   │   └── index.ts             # Shared TypeScript interfaces
│   │   ├── App.tsx                  # Root component with providers
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Tailwind + Inter font
│   ├── .env.example
│   ├── vite.config.ts               # Vite config with Tailwind plugin + API proxy
│   └── package.json
│
└── server/                          # Express backend
    ├── src/
    │   ├── config/
    │   │   └── db.ts                # MongoDB connection
    │   ├── controllers/
    │   │   ├── auth.controller.ts   # Register & login handlers
    │   │   ├── application.controller.ts # CRUD handlers
    │   │   └── ai.controller.ts     # AI parse endpoint handler
    │   ├── middleware/
    │   │   └── auth.middleware.ts   # JWT verification middleware
    │   ├── models/
    │   │   ├── User.ts              # User schema (email, hashed password)
    │   │   └── Application.ts       # Application schema
    │   ├── routes/
    │   │   ├── auth.routes.ts       # POST /api/auth/register|login
    │   │   ├── application.routes.ts# GET/POST/PUT/DELETE /api/applications
    │   │   └── ai.routes.ts         # POST /api/ai/parse
    │   ├── services/
    │   │   └── ai.service.ts        # AI logic (OpenAI / Groq / Gemini)
    │   └── server.ts                # Express app entry point
    ├── .env.example
    ├── tsconfig.json
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- MongoDB running locally **or** a MongoDB Atlas URI
- At least one AI provider API key (Groq is free — recommended for getting started)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AiJobTrack.git
cd AiJobTrack
```

### 2. Setup the backend

```bash
cd server
cp .env.example .env
```

Fill in your `.env` values (see [Environment Variables](#-environment-variables) below), then:

```bash
yarn dev
```

Server starts at `http://localhost:5000`

### 3. Setup the frontend

```bash
cd client
yarn dev
```

App starts at `http://localhost:5173`

> The Vite dev server proxies all `/api` requests to `http://localhost:5000` automatically — no CORS issues in development.

---

## 🔑 Environment Variables

### `server/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/aijobtrack
JWT_SECRET=your_random_secret_here

# AI Providers — set at least one. Priority: OpenAI → Groq → Gemini
OPENAI_API_KEY=sk-...          # https://platform.openai.com/api-keys
GROQ_API_KEY=gsk_...           # https://console.groq.com (free)
GEMINI_API_KEY=AIza...         # https://aistudio.google.com/apikey (free)

CLIENT_URL=http://localhost:5173
```

> Only one AI key is required. The service automatically uses whichever is set, in order: OpenAI → Groq → Gemini.

### `client/.env` (optional)

```env
VITE_API_URL=http://localhost:5000
```

---

## 🤖 AI Provider Setup

| Provider | Cost | Model Used | Get Key |
|---|---|---|---|
| OpenAI | Paid (~$0.01/request) | gpt-4o-mini | [platform.openai.com](https://platform.openai.com) |
| Groq | **Free** | llama-3.3-70b-versatile | [console.groq.com](https://console.groq.com) |
| Gemini | Free tier | gemini-2.0-flash | [aistudio.google.com](https://aistudio.google.com) |

---

## 📡 API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password }` | Create a new account |
| POST | `/api/auth/login` | `{ email, password }` | Login, returns JWT token |

### Applications *(all routes require `Authorization: Bearer <token>`)*

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/api/applications` | — | Get all applications for logged-in user |
| POST | `/api/applications` | Application object | Create a new application |
| PUT | `/api/applications/:id` | Partial application | Update an application |
| DELETE | `/api/applications/:id` | — | Delete an application |

### AI

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/ai/parse` | `{ jobDescription }` | Parse JD and return structured data + resume suggestions |

---

## 🏗️ Architecture & Key Decisions

### AI Service Layer
All AI logic lives in `server/src/services/ai.service.ts`. Controllers stay thin — they only call the service and return the result. This makes it easy to swap or add AI providers without touching routes or controllers.

### Multi-Provider Fallback
The AI service checks for API keys in order: `OPENAI_API_KEY` → `GROQ_API_KEY` → `GEMINI_API_KEY`. The first one found is used. This means the app works out of the box with any free provider.

### JSON Mode Enforced
All AI calls use `response_format: { type: 'json_object' }` (OpenAI/Groq) or `responseMimeType: 'application/json'` (Gemini) to guarantee structured, parseable output and prevent hallucinated formats.

### React Query for Server State
TanStack React Query handles all data fetching, caching, and invalidation. After any mutation (create/update/delete), `invalidateQueries` triggers a refetch so the board stays in sync without manual state management.

### Vite Proxy
In development, Vite proxies `/api/*` to `http://localhost:5000`. This means the frontend never makes cross-origin requests in dev, avoiding CORS configuration entirely.

### JWT in localStorage
The JWT token is stored in `localStorage` and attached to every request via an Axios request interceptor in `client/src/api/axios.ts`. This keeps the user logged in across page refreshes.

### Auth Context
A React context (`AuthContext.tsx`) wraps the entire app and exposes `token`, `email`, `login`, `register`, and `logout`. The root `App.tsx` renders either `<AuthPage>` or `<KanbanPage>` based on whether a token exists.

### TypeScript Strictness
The project uses `strict: true` on the backend and `verbatimModuleSyntax: true` on the frontend. All type-only imports use `import type` syntax. `any` is avoided throughout.

---

## 📦 Scripts

### Server

```bash
yarn dev      # Start dev server with hot reload (ts-node-dev)
yarn build    # Compile TypeScript to dist/
yarn start    # Run compiled output
```

### Client

```bash
yarn dev      # Start Vite dev server
yarn build    # Type-check + build for production
yarn preview  # Preview production build locally
```

---

## 🗄️ Database Schema

### User
```
email       String  (unique, lowercase)
password    String  (bcrypt hashed)
createdAt   Date
updatedAt   Date
```

### Application
```
userId          ObjectId  (ref: User)
company         String
role            String
status          Enum: Applied | Phone Screen | Interview | Offer | Rejected
dateApplied     Date
jdLink          String?
notes           String?
salaryRange     String?
seniority       String?
location        String?
skills          String[]
niceToHaveSkills String[]
resumeSuggestions String[]
createdAt       Date
updatedAt       Date
```

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (10 salt rounds) before storage
- JWTs expire after 7 days
- All application routes verify the JWT and scope queries to `userId` — users cannot access each other's data
- API keys are loaded from `.env` and never exposed to the client
- `.env` is in `.gitignore` — never committed

---

## 📝 License

MIT
