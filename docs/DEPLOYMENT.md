# Deployment Guide

Community Connect is deployed as two parts:

| Part | Host | Folder |
|---|---|---|
| Backend API (Express) | [Render](https://render.com) | `server/` |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | — |

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

## Running the production build locally

```bash
cd server
cp .env.example .env   # then fill in the values
npm ci
npm start
```
