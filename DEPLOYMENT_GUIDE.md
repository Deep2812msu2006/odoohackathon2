# 🚀 GlobeTrotter - Hackarina Deployment Guide (Render + Supabase)

This guide walks you step-by-step through deploying your full-stack GlobeTrotter application live for your **Hackarina** college hackathon pitch & judging panel.

---

## 🟢 Step 1: Database (Supabase PostgreSQL) — ✅ DONE!

Your Supabase PostgreSQL database is **already connected, migrated, and fully seeded** with live demo data:
- **Supabase Host**: `db.wqhsbcmsqeavijgpuwsv.supabase.co`
- **Demo User Account**: `demo@globetrotter.com` / `Password123!`
- **Secondary Account**: `sophia@globetrotter.com` / `Password123!`
- **Pre-populated Data**: 16 Cities, 34 Activities, and "Grand European Escapade 2026" trip itinerary.

---

## 🌐 Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository (`globetrotter_odoo`).
3. Configure the backend Web Service:
   - **Name**: `globetrotter-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx prisma db push && npm start`
4. Add **Environment Variables**:
   - `DATABASE_URL`: `postgresql://postgres:Deep%40globel@db.wqhsbcmsqeavijgpuwsv.supabase.co:5432/postgres?schema=public`
   - `JWT_SECRET`: `globetrotter_production_secret_key_2026_hackarina`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://globetrotter-frontend.onrender.com` (or your Vercel URL)
5. Click **Deploy Web Service**.
6. Copy your live backend URL (e.g., `https://globetrotter-backend.onrender.com`).

---

## 🎨 Step 3: Deploy Frontend to Render (or Vercel)

### Option A: Render (Static Site)
1. In Render Dashboard, click **New +** -> **Static Site**.
2. Select your repository.
3. Configure settings:
   - **Name**: `globetrotter-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL`: `https://globetrotter-backend.onrender.com/api` (Replace with your actual Render backend URL)
5. Add **Rewrite Rule**:
   - Source: `/*` -> Destination: `/index.html` (for SPA client-side routing).
6. Click **Create Static Site**.

### Option B: Vercel (Alternative, Ultra-Fast CDN)
1. Import repository in Vercel.
2. Set Root Directory to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL` = `https://globetrotter-backend.onrender.com/api`
4. Click **Deploy**.

---

## 🏆 Hackarina Pitch & Live Demo Tips

1. **Live Demo Login Credentials**:
   - **Email**: `demo@globetrotter.com`
   - **Password**: `Password123!`
2. **Public Share Link**: Showcase the instant public itinerary copy feature by opening a public trip slug in an incognito tab!
3. **Health Check**: Test `https://<your-backend-url>/api/health` before presenting to ensure PostgreSQL connection returns `200 OK`.
