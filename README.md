# FeedPulse — AI-Powered Product Feedback Platform

> Collect, analyse, and manage product feedback with the power of Google Gemini AI.

![FeedPulse](https://img.shields.io/badge/Status-Active-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Node.js](https://img.shields.io/badge/Node.js-20-green) ![MongoDB](https://img.shields.io/badge/MongoDB-7-green) ![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-blue) ![Docker](https://img.shields.io/badge/Docker-Compose-blue)

---

## Description

FeedPulse is a full-stack B2B feedback management platform that lets users submit product feedback through a public form, and gives admins an AI-enriched dashboard to triage, filter, and act on that feedback. Every submission is automatically analysed by Google Gemini AI — returning a sentiment score, priority rating (1–10), category classification, one-sentence summary, and keyword tags — all stored alongside the original feedback in MongoDB.

> **Note on Gemini model:** The assignment specifies `gemini-1.5-flash`, however Google has deprecated and removed this model — it returns a 404 on both the `v1` and `v1beta` API endpoints as of April 2026. This project uses `gemini-2.5-flash` instead, which is the current recommended free-tier model in Google AI Studio and produces identical output. The integration logic, prompt structure, and JSON response parsing are unchanged.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Backend   | Node.js, Express, TypeScript      |
| Database  | MongoDB 7 + Mongoose              |
| AI        | Google Gemini 2.5 Flash           |
| Auth      | JWT (`jsonwebtoken`)              |
| DevOps    | Docker + Docker Compose           |

---

## Features

### Public Feedback Form
- Submit feedback with title, description, category, name, and email
- Client-side validation (required fields, min/max lengths, email format)
- Character counter on the description field
- Success and error states after submission
- Rate limited to 5 submissions per IP per hour

### AI Analysis (Google Gemini)
- Automatically triggered on every new submission
- Stores 5 AI fields per item: `ai_category`, `ai_sentiment`, `ai_priority`, `ai_summary`, `ai_tags`
- Feedback is saved even if the AI call fails (non-fatal)
- Admin can re-trigger AI analysis on any individual item
- On-demand weekly summary of top themes across the last 7 days

### Admin Dashboard
- JWT-protected — redirects to `/login` if unauthenticated
- Lists all feedback with title, category, sentiment badge, priority score, and date
- Filter by category, status, and sentiment
- Sort by newest, oldest, highest priority, or sentiment
- Full-text search across title and AI summary
- Update status per item: `New` → `In Review` → `Resolved`
- Delete feedback items
- Stats bar: total items, open count, average AI priority, top tag
- Pagination (10 items per page)

---

## Screenshots

> _Add at least 2 screenshots here after running the app._

**Public Feedback Form** (`/`)

![Feedback Form Screenshot](./screenshots/feedback-form.png)

**Admin Dashboard** (`/dashboard`)

![Admin Dashboard Screenshot](./screenshots/admin-dashboard.png)

---

## Getting Started

### Prerequisites

- Node.js v20+
- npm v10+
- MongoDB (local or Atlas)
- Google Gemini API key — [get one free](https://aistudio.google.com)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/feedpulse.git
cd feedpulse
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env (see Environment Variables section)
npm run dev
```

Backend runs at `http://localhost:4000`

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Environment Variables

### Backend — `backend/.env`

| Variable          | Description                                   | Example                                   |
|-------------------|-----------------------------------------------|-------------------------------------------|
| `PORT`            | Port the Express server listens on            | `4000`                                    |
| `MONGO_URI`       | MongoDB connection string                     | `mongodb://localhost:27017/feedpulse`     |
| `GEMINI_API_KEY`  | Google Gemini API key                         | `AIza...`                                 |
| `JWT_SECRET`      | Secret used to sign JWTs — make it long       | `super_long_random_string`                |
| `ADMIN_EMAIL`     | Hardcoded admin login email                   | `admin@feedpulse.com`                     |
| `ADMIN_PASSWORD`  | Hardcoded admin login password                | `admin123`                                |
| `FRONTEND_URL`    | Allowed CORS origin                           | `http://localhost:3000`                   |

### Frontend — `frontend/.env.local`

| Variable                | Description                    | Example                          |
|-------------------------|--------------------------------|----------------------------------|
| `NEXT_PUBLIC_API_URL`   | Base URL of the backend API    | `http://localhost:4000/api`      |

> **Never commit `.env` or `.env.local` to Git.** Both are covered by `.gitignore`.

---

## API Endpoints

| Method | Path                          | Auth     | Description                              |
|--------|-------------------------------|----------|------------------------------------------|
| POST   | `/api/auth/login`             | Public   | Admin login — returns JWT                |
| POST   | `/api/feedback`               | Public   | Submit new feedback (rate limited)       |
| GET    | `/api/feedback`               | Admin    | List all feedback with filters + pagination |
| GET    | `/api/feedback/stats`         | Admin    | Stats bar data (total, open, avg priority, top tag) |
| GET    | `/api/feedback/summary`       | Admin    | AI weekly theme summary (last 7 days)    |
| GET    | `/api/feedback/:id`           | Admin    | Get a single feedback item               |
| PATCH  | `/api/feedback/:id`           | Admin    | Update status (`New / In Review / Resolved`) |
| POST   | `/api/feedback/:id/reanalyse` | Admin    | Re-trigger Gemini AI analysis            |
| DELETE | `/api/feedback/:id`           | Admin    | Delete a feedback item                   |
| GET    | `/api/health`                 | Public   | Health check                             |

All responses follow the format:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "message": "..."
}
```

---

## Running Tests

```bash
cd backend
npm test
```

Tests use an in-memory MongoDB instance via `mongodb-memory-server` — no real database needed.

**Test coverage:**
1. Valid feedback submission saves and triggers AI analysis
2. Rejects feedback with empty title (400)
3. Status update from `New` to `In Review`
4. Correctly structured Gemini AI analysis response
5. Auth middleware rejects unauthenticated requests (401)

---

## Docker

Run the full stack (frontend + backend + MongoDB) with a single command:

```bash
# Create a root-level .env with your secrets
echo "GEMINI_API_KEY=your_key_here" > .env
echo "JWT_SECRET=your_long_random_secret" >> .env

# Build and start
docker-compose up --build

# Or in the background
docker-compose up --build -d

# Stop everything
docker-compose down
```

Services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- MongoDB: `localhost:27017`

---

## Default Admin Credentials

```
Email:    admin@feedpulse.com
Password: admin123
```

> Change these in your `.env` before deploying anywhere.

---

## What I Would Build Next

- **Email notifications** — notify admins when high-priority feedback arrives (Nodemailer / SendGrid)
- **Upvoting** — let users vote on existing feedback to surface the most-wanted features
- **Analytics dashboard** — charts for sentiment trends, category breakdown, and submission volume over time
- **Webhooks** — push feedback events to Slack or other tools on status change
- **RBAC** — role-based access control for multi-user teams (viewer, editor, admin)
- **Public roadmap** — show resolved/in-review items publicly to close the feedback loop
- **Export** — download filtered feedback as CSV for stakeholder reports

---

## Project Structure

```
feedpulse/
├── backend/
│   ├── src/
│   │   ├── controllers/     # feedback.controller.ts, auth.controller.ts
│   │   ├── middleware/      # auth.middleware.ts (JWT guard)
│   │   ├── models/          # Feedback.ts, User.ts
│   │   ├── routes/          # feedback.routes.ts, auth.routes.ts
│   │   ├── services/        # gemini.service.ts
│   │   ├── utils/           # response.ts (standard response helper)
│   │   ├── __tests__/       # feedback.test.ts (5 unit tests)
│   │   └── server.ts
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Public feedback form
│   │   │   ├── login/page.tsx    # Admin login
│   │   │   └── dashboard/page.tsx# Admin dashboard (protected)
│   │   ├── components/
│   │   │   ├── FeedbackCard.tsx
│   │   │   ├── SentimentBadge.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── Pagination.tsx
│   │   ├── lib/api.ts            # Axios instance + typed API functions
│   │   └── types/index.ts
│   ├── Dockerfile
│   └── .env.local.example
└── docker-compose.yml
```

---

## License

MIT