# Deployment Guide

Community Connect is deployed in three parts:

| Part | Host | Folder |
|---|---|---|
| Frontend (React + Vite) | [Vercel](https://vercel.com) | `client/` |
| Backend API (Express) | [Render](https://render.com) | `server/` |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | — |

Deploy in this order: database → backend → frontend → update the backend's `CLIENT_URL`.

## 1. Database: MongoDB Atlas

1. Create a free **M0** cluster.
2. **Database Access** → add a database user with a strong password.
3. **Network Access** → add `0.0.0.0/0` (Render's free plan has no fixed IP).
4. **Connect → Drivers** → copy the connection string and add a database name, for example:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/community-connect`

## 2. Backend: Render

The repository contains a Render Blueprint (`render.yaml`).

1. Render dashboard → **New + → Blueprint** → select this GitHub repository.
2. Render reads `render.yaml` and creates the `community-connect-api` web service
   (root directory `server`, build `npm ci --omit=dev`, start `npm start`,
   health check `/api/health`).
3. Fill in the environment variables it asks for:

| Variable | Value |
|---|---|
| `MONGO_URI` | Atlas connection string from step 1 |
| `JWT_SECRET` | generated automatically by Render |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional — Google sign-in is disabled without it) |
| `CLIENT_URL` | the deployed frontend URL (add it after the frontend is deployed) |

4. Click **Apply**. When the deploy finishes, open
   `https://<service-name>.onrender.com/api/health` — it should return
   `{"status":"ok","database":"connected"}`.

Notes:
- Free Render services sleep after 15 minutes without traffic; the first request afterwards takes about a minute.
- Every push to `main` redeploys automatically.
- Uploaded CSV files are stored in MongoDB, so they are not lost when Render restarts the service.

## 3. Frontend: Vercel

The client folder contains `vercel.json` (Vite build, output `dist`).

1. Vercel dashboard → **Add New → Project** → import this GitHub repository.
2. Set **Root Directory** to `client`. Vercel detects Vite automatically.
3. Add the environment variables (Settings → Environment Variables):

| Variable | Value |
|---|---|
| `VITE_API_URL` | the Render URL, e.g. `https://community-connect-api.onrender.com` (no trailing slash) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |

4. Click **Deploy** and copy the site URL, e.g. `https://community-connect.vercel.app`.
5. Back in Render, set `CLIENT_URL` to that URL so CORS allows it, and redeploy the backend.

`VITE_` variables are built into the JavaScript bundle, so redeploy the frontend after changing them.

## 4. Google sign-in (optional)

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → your OAuth 2.0 Client ID:

- **Authorized JavaScript origins:** add `http://localhost:5173` and the Vercel URL.
- Use the same client ID for `GOOGLE_CLIENT_ID` (Render) and `VITE_GOOGLE_CLIENT_ID` (Vercel).

## 5. Check the deployment

- `https://<render-service>.onrender.com/api/health` returns `{"status":"ok","database":"connected"}`.
- Open the Vercel URL, register through the API (or the Bruno **Production** environment), log in and create a program.
- In `bruno/environments/Production.bru`, set `baseUrl` to the Render URL and run
  `npx @usebruno/cli run --env Production` from the `bruno` folder.

## Running the production build locally

```bash
# Backend
cd server
cp .env.example .env   # then fill in the values
npm ci
npm start

# Frontend (in another terminal)
cd client
cp .env.example .env
npm ci
npm run build
npm run preview        # serves dist/ on http://localhost:4173
```
