# Community Connect: Community Engagement Analytics System

Community organizations run workshops, awareness campaigns, training sessions and volunteer events,
but often cannot tell which activities people actually engage with. **Community Connect** is a
MERN-stack web application that collects program and participation data and turns it into
dashboards, reports and AI-generated recommendations, so organizers can plan better programs.

- **Mock UX (Figma):** https://www.figma.com/design/3gFczvtn6FtBrjWclOeh7g/UI--UX-Community-Connect?node-id=3-486&t=2gOafFU8gmTLWRmJ-1
- **API documentation:** Bruno collection in [`bruno/`](bruno)
- **Deployment guide:** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) · **Docker:** [`docs/DOCKER.md`](docs/DOCKER.md)
- **Architecture and technical decisions:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## Features

| Area | What it does |
|---|---|
| **Accounts** | Sign up and sign in with username/password (bcrypt-hashed) or **Sign in with Google**. Sessions use JWTs that expire after 1 hour. |
| **Programs** | Create, edit, delete, search and filter community programs (category, status, dates, capacity). |
| **Participants** | Enrol participants in programs and track sessions attended, engagement score (0–100), satisfaction (1–5) and feedback. |
| **CSV upload** | Import engagement data in bulk from a CSV file. Rows are validated, errors are reported per row, and the original files are kept with download and delete. |
| **Dashboard and analytics** | Live KPIs, a 6-month engagement trend, category breakdown and program ranking. |
| **AI insights** | Google Gemini reads the real statistics and writes a summary, highlights, concerns and recommendations. |
| **Reports** | Download Engagement, Participant and Program Performance reports as CSV. |

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, plain CSS |
| Backend | Node.js 20, Express 5 |
| Database | MongoDB with Mongoose |
| Auth | bcryptjs, JSON Web Tokens, Google Identity Services (`google-auth-library`) |
| Files | Multer (memory storage) and csv-parse |
| AI | Google Gemini API (`generateContent`) |
| Testing | Jest, Supertest, mongodb-memory-server; Bruno CLI for API tests |
| DevOps | Docker, Docker Compose, GitHub Actions, Render (API), Vercel (frontend), MongoDB Atlas |

## Project structure

```
├── client/                 React frontend (Vite)
│   └── src/
│       ├── api.js          API base URL, JWT headers, auto sign-out on 401
│       ├── App.jsx         Layout, navigation, login state
│       ├── Dashboard.jsx   Programs.jsx  Participants.jsx  Analytics.jsx
│       ├── Reports.jsx     upload.jsx    HelpCenter.jsx
│       ├── components/     Login page and reusable components
│       ├── reportData.js   Report and CSV row builders
│       └── download.js     File download helpers
├── server/                 Express API
│   ├── app.js              Routes and middleware (exported for tests)
│   ├── index.js            Connects to MongoDB and starts the server
│   ├── models/             User, Program, Engagement, Upload
│   ├── utils/              csvImport, analytics, aiInsights
│   └── tests/              Jest + Supertest tests
├── bruno/                  API documentation and tests (Bruno)
├── docs/                   Deployment, Docker and architecture docs
├── docker-compose.yml      MongoDB + API + frontend
└── render.yaml             Render blueprint for the API
```

## Data model

```
User ──< Engagement >── Program          Upload ── uploadedBy ──> User
```

- **User**: name, username, email, password (hashed, never returned), role (`participant`, `organizer`, `admin`)
- **Program**: name, description, category, start and end dates, capacity, status (`upcoming`, `active`, `completed`)
- **Engagement**: links a user to a program, with sessions attended and total, engagement score, satisfaction score, feedback and last attended date
- **Upload**: an uploaded CSV file (stored in MongoDB) with import counts

## Getting started

Requirements: **Node.js 20+** and a MongoDB database (local, or a free MongoDB Atlas cluster).

```bash
git clone https://github.com/kalviumcommunity/S92_Manish_capstone_project.git
cd S92_Manish_capstone_project

# 1. Backend
cd server
cp .env.example .env        # set MONGO_URI and JWT_SECRET (see below)
npm install
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173, click **Sign Up**, create an account, then create a program and add
participants (or upload [`bruno/sample-data/engagements.csv`](bruno/sample-data/engagements.csv)
after creating a program named "Youth Coding Club").

Or run everything with Docker: `docker compose up --build`, then open http://localhost:8080.

### Environment variables

**`server/.env`**

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Long random string used to sign JWTs |
| `GOOGLE_CLIENT_ID` | no | Google OAuth client ID (enables Google sign-in) |
| `GEMINI_API_KEY` | no | Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) (enables AI insights) |
| `GEMINI_MODEL` | no | Gemini model, default `gemini-3.8-flash` |
| `CLIENT_URL` | production | Allowed frontend origin(s) for CORS, comma-separated |
| `PORT` | no | Default `5000` |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL, default `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Same Google client ID as the server (hides the Google button when empty) |

## API overview

Every route except `/`, `/api/health` and `/api/auth/*` (other than `/api/auth/me`) requires
`Authorization: Bearer <token>`. Full request and response details are in the Bruno collection.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server and database status |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, returns a JWT |
| POST | `/api/auth/google` | Log in with a Google ID token |
| GET | `/api/auth/me` | Current user |
| GET / POST | `/api/programs` | List / create programs |
| PUT / DELETE | `/api/programs/:id` | Update / delete a program |
| GET / POST | `/api/users` | List / create users |
| GET | `/api/users/:id` | Get a user |
| GET / POST | `/api/engagements` | List (with user and program) / create engagements |
| POST | `/api/uploads` | Upload a CSV and import it |
| GET | `/api/uploads` | Upload history |
| GET | `/api/uploads/:id/download` | Download the original file |
| DELETE | `/api/uploads/:id` | Delete an upload (uploader or admin) |
| GET | `/api/analytics/summary` | Live statistics |
| POST | `/api/ai/insights` | AI-generated insights (Gemini) |

## Testing

```bash
cd server && npm test           # 65 Jest tests (in-memory MongoDB, no setup needed)
cd client && npm run lint       # ESLint
cd bruno && npx @usebruno/cli run --env Local   # API tests against a running server
```

GitHub Actions runs the server tests, the client lint and build, and a Docker Compose smoke test on every pull request.

## Deployment

**Recommended:** one Netlify site serves the frontend, and the API runs as a Netlify Function (`netlify.toml`).

| Part | Netlify option | Alternative |
|---|---|---|
| Frontend | Netlify | Vercel (`client/vercel.json`) |
| API | Netlify Function (`server/functions/api.js`) | Render (`render.yaml`) |
| Database | MongoDB Atlas | MongoDB Atlas |

Step-by-step instructions: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Milestones

| # | Milestone | Where |
|---|---|---|
| 1.3–1.4 | Problem definition, mock UX | This README, Figma link |
| 2.1–2.3 | Repository, React app, components | `client/` |
| 2.4–2.5 | Schema design, database read/write | `server/models/` |
| 2.6–2.9 | GET, POST, PUT, update and delete APIs | `server/app.js`, `Programs.jsx` |
| 2.10 | Entity relationships | `Engagement` → `User`, `Program` |
| 2.11–2.13 | Password auth, JWT, Google sign-in | `/api/auth/*`, `components/login.jsx` |
| 2.14 | File upload | `/api/uploads`, `upload.jsx` |
| 2.15 | API documentation | `bruno/` |
| 2.16–2.17 | Backend and frontend deployment | `render.yaml`, `client/vercel.json`, `docs/DEPLOYMENT.md` |
| 2.18 | Automated testing | `server/tests/`, `.github/workflows/ci.yml` |
| 2.19 | Docker | `Dockerfile`s, `docker-compose.yml` |
| 2.20 | AI feature | `/api/ai/insights`, Analytics page |

## Contributors

- @ManishAravinth10
