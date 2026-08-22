# 🌍 GlobeTrotter — Personalized Multi-City Travel Planning Platform

GlobeTrotter is a production-quality, personalized, collaborative, multi-city travel planning web platform built with a relational PostgreSQL database, Prisma ORM, Node.js + Express backend architecture, and a modern React + Vite + Tailwind CSS frontend.

---

## 1. Project Overview & Technical Rationale

Planning complex multi-city trips involves juggling dates, destination cities, daily scheduled activities, transport, accommodation, and per-day budgets across different regions. Simple mock applications or rigid single-city tools fail to enforce relational date constraints, city-activity matching, dynamic budget calculations, or transactional trip sharing.

GlobeTrotter demonstrates **database-first relational engineering** with:
- **Real Local PostgreSQL 18 Database** with strict relational integrity, custom indexes, date boundary checks, and cascading deletions.
- **Modular REST API** built with Express.js separating Routes, Controllers, Services, Repositories, and Zod Validators.
- **Transactional Copy Trip Feature** (`$transaction`) allowing users to copy complete public itineraries into their account atomically.
- **Dynamic Budget Calculation Engine** computing per-day spending, category breakdowns, daily averages, and over-budget warnings without hardcoded values.
- **Interactive Drag-and-Drop Itinerary Builder** powered by `@hello-pangea/dnd`.

### Why Local PostgreSQL & Prisma Over BaaS?
Unlike Backend-as-a-Service (BaaS) platforms (Firebase, Supabase, MongoDB Atlas), PostgreSQL running locally gives complete control over relational schemas, composite indexes, foreign key cascading behavior, complex multi-table SQL aggregations, and ACID transaction boundaries.

---

## 2. Technology Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18, Vite, React Router v6, Axios, TanStack React Query v5, Tailwind CSS, React Hook Form, Zod, Recharts, `@hello-pangea/dnd`, React Hot Toast, Lucide Icons |
| **Backend** | Node.js, Express.js (Modular Route-Controller-Service-Repository), Prisma ORM, JWT (Cookie + Bearer fallback), bcryptjs, Zod validation, Multer file uploads, Express Rate Limit |
| **Database** | PostgreSQL 18 (Local database `globetrotter_db`), Prisma Client, Custom Indexes, Foreign Key Constraints, Relational Seed Script |
| **Testing & Tooling** | Vitest + Supertest integration tests, `.http` API collection, Docker Compose |

---

## 3. Database Architecture & ER Diagram

```text
  ┌─────────────┐       1:N       ┌─────────────┐       1:N       ┌─────────────┐
  │    User     │ ───────────────>│    Trip     │ ───────────────>│  TripStop   │
  └─────────────┘                 └─────────────┘                 └─────────────┘
         │                               │                               │
         │ 1:N                           │ 1:N                           │ 1:N
         v                               v                               v
  ┌─────────────┐                 ┌─────────────┐                 ┌─────────────┐
  │  TripShare  │                 │    City     │                 │TripStopAct. │
  └─────────────┘                 └─────────────┘                 └─────────────┘
                                         │                               │
                                         │ 1:N                           │ N:1
                                         v                               v
                                  ┌─────────────┐ ───────────────────────┘
                                  │  Activity   │
                                  └─────────────┘
```

### Relational Schema Design & Constraints
1. **`User`**: UUID primary key, `email` unique index (normalized lower-case), hashed password via `bcryptjs`.
2. **`Trip`**: UUID primary key, foreign key `userId` (cascades on deletion), `publicSlug` unique index, constraint `startDate <= endDate`.
3. **`City`**: UUID primary key, indexes on `name`, `country`, `region`, `popularityScore`. Includes cost multiplier index.
4. **`TripStop`**: Foreign keys `tripId` (cascade) and `cityId`. Constraint `arrivalDate <= departureDate`. Validated against parent trip date boundary.
5. **`Activity`**: Foreign key `cityId` (cascade). Categories: `sightseeing`, `food`, `adventure`, `culture`, `nightlife`, `relaxation`, `shopping`, `other`.
6. **`TripStopActivity`**: Links activity to trip stop. Foreign key `tripStopId` (cascade) and `activityId`. Enforces activity city matching and stop date boundaries.
7. **`TripShare`**: Tracks original trip, copied trip, and requesting user for shared trip analytics.

---

## 4. API Endpoints Overview

### Authentication & Users
- `POST /api/auth/signup` — Register new user account.
- `POST /api/auth/login` — Authenticate and receive JWT token / HTTP-only cookie.
- `POST /api/auth/logout` — Invalidate session cookie.
- `GET  /api/auth/me` — Get authenticated user details.
- `PATCH /api/users/me` — Update name, photo, language preference.
- `DELETE /api/users/me` — Permanently delete user and associated data.

### Trips & Itinerary Stops
- `GET    /api/trips` — Fetch user's planned trips.
- `POST   /api/trips` — Create new trip with date validations and cover photo.
- `GET    /api/trips/:id` — Get trip details with stop hierarchy & activities.
- `PATCH  /api/trips/:id` — Update trip details.
- `DELETE /api/trips/:id` — Delete trip and cascade stops/activities.
- `PATCH  /api/trips/:id/publish` — Toggle public share link status.
- `POST   /api/trips/:id/stops` — Add city stop (validates dates & city existence).
- `PATCH  /api/trips/:id/stops/reorder` — Transactional batch reordering of stops.
- `DELETE /api/trips/:id/stops/:stopId` — Remove stop from itinerary.

### Activity Scheduling & Budget Engine
- `POST   /api/trips/:id/stops/:stopId/activities` — Schedule activity (validates city matching & date range).
- `DELETE /api/trips/:id/stops/:stopId/activities/:linkId` — Remove activity link.
- `GET    /api/trips/:id/budget` — Dynamic budget breakdown (category totals, per-day spending, over-budget detection).

### Public Sharing & Copying
- `GET  /api/public/trips/:slug` — Read-only public trip view.
- `POST /api/public/trips/:slug/copy` — Transactionally copy public trip into authenticated user's account.

### Admin Analytics
- `GET /api/admin/analytics` — PostgreSQL SQL aggregate analytics (users, trips, popular cities & activities).

---

## 5. Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- PostgreSQL 18 (Running on `localhost:5432` with user `postgres`)

### Step 1: Clone Repository
```bash
git clone https://github.com/Deep2812msu2006/odoohackathon2.git
cd odoohackathon2
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:Deep%401511@localhost:5432/globetrotter_db?schema=public"
JWT_SECRET="globetrotter_secret_key_super_secure_jwt_token_2026_hackathon"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
UPLOAD_DIR="uploads"
```

### Step 3: Setup Backend & Database
```bash
cd backend
npm install
npx prisma db push
npx prisma generate
node prisma/seed.js
```

### Step 4: Run Integration Tests
```bash
npm test
```

### Step 5: Start Backend API Server
```bash
npm run dev
```

### Step 6: Setup & Run Frontend
In a new terminal tab:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 6. Docker Setup

To run the full stack via Docker Compose:
```bash
docker-compose up --build
```
Services:
- `postgres`: PostgreSQL 18 database on port `5432`
- `backend`: Express REST API on port `5000`
- `frontend`: Vite React application on port `5173`

---

## 7. Git Workflow & Branching Strategy

To maintain team collaboration hygiene:
- `main`: Production ready release branch.
- `develop`: Integration branch for feature merging.
- `feature/auth`: Authentication & JWT security.
- `feature/database`: Prisma schema, migrations & seeds.
- `feature/itinerary`: Drag-and-drop itinerary builder & stop reordering.
- `feature/budget`: Dynamic budget calculation engine & Recharts integration.
- `feature/public-sharing`: Transactional copy trip feature & public share links.

---

## 8. Scalability & Future Improvements

- **Redis Caching**: Cache popular city search queries and public trip endpoints in Redis.
- **WebSockets / Socket.io**: Real-time collaborative itinerary editing between travel partners.
- **Weather & Flight API Integrations**: Optional live weather forecasts and flight price comparisons.
- **S3 / Cloudinary Uploads**: Move local image uploads to AWS S3 storage for multi-instance backend scaling.