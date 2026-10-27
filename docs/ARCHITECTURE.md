# Architecture and Technical Decisions

## Overview

```
 Browser (React + Vite)
    │  fetch() with "Authorization: Bearer <JWT>"     src/api.js
    ▼
 Express API (Node 20)                                server/app.js
    │  authenticateToken → route handler
    │  utils/csvImport · utils/analytics · utils/aiInsights
    ▼
 MongoDB (Mongoose)            Google Identity      Google Gemini API
 users · programs ·            (verify ID token)    (generate insights)
 engagements · uploads
```

The frontend is a single-page app. `App.jsx` keeps the login state and the active page.
Every request goes through `apiFetch()` in `src/api.js`, which:
- adds the base URL (`VITE_API_URL`) and the JWT
- turns error responses into exceptions carrying the server's message
- signs the user out when the server answers **401** (expired or invalid token)

## Request lifecycle: creating a program

1. `Programs.jsx` submits the form: `apiFetch("/api/programs", { method: "POST", body })`.
2. `authenticateToken` reads the `Bearer` token and runs `jwt.verify` with `JWT_SECRET`. It puts the user in `req.user`, or answers 401.
3. The handler builds a `Program` document. Mongoose validators (required fields, `status` enum) reject bad input, and the handler answers 400.
4. The saved document comes back with 201, and React adds it to state without reloading the list.

## Key decisions

| Decision | Why | Alternative considered |
|---|---|---|
| **Separate `app.js` and `index.js`** | Tests import the Express app with Supertest without opening a port or connecting to the real database. | One file that listens on import. That makes testing hard. |
| **JWT in `localStorage`, 1-hour expiry** | Simple for a single-page app with a separate API host (Vercel + Render). The short expiry limits the damage of a stolen token. | httpOnly cookies. Safer against XSS but need same-site setup and CSRF protection across two domains. |
| **bcrypt with cost 10; `select: false` on password** | Hashes are slow to brute-force, and the password field is never returned unless asked for explicitly. | Plain SHA hashing. Too fast to be safe. |
| **Admin role cannot be self-assigned** | Public registration and `POST /api/users` only create admins when the caller is already an admin. | Trusting `role` from the request body. That's a privilege escalation bug. |
| **Google sign-in verified on the server** | The client sends Google's ID token. The server checks its signature and audience with `google-auth-library`, then issues its own JWT, so the rest of the API needs just one kind of token. | Trusting the profile sent by the client. That's easy to forge. |
| **401 vs 403** | 401 means "who are you?" (missing, invalid or expired token), so the client signs out. 403 means "you can't do this" (deleting someone else's upload), so the user stays signed in. | Using 403 for both. The client couldn't tell when to sign out. |
| **CSV files stored in MongoDB** | Render's free disk is wiped on every deploy or restart. Files are limited to 2 MB, well under MongoDB's 16 MB document limit, and are excluded from queries with `select: false`. | Local disk (lost on redeploy) or S3 (needs another account and keys). |
| **Upsert engagements on import** | Each (user, program) pair has one engagement. Re-uploading a corrected file updates the records instead of creating duplicates. | Inserting every row. Duplicates would skew the averages. |
| **Per-row import errors** | One bad row shouldn't reject a whole file. The response lists row numbers and reasons. | All-or-nothing transactions. Frustrating for non-technical users. |
| **Analytics computed on read** | Data volumes for a community organization are small, so calculating the summary on each request keeps it always correct with no extra storage. | Pre-computed or cached aggregates. Worth it only at much larger scale. |
| **Gemini via REST `fetch`** | No extra SDK dependency, an explicit 30-second timeout, and the API key goes in a header and is never logged. The model is set by `GEMINI_MODEL`, so a deprecated model is a config change, not a code change. | The provider's SDK. |
| **Only statistics are sent to the AI** | The prompt contains aggregated numbers, program names and short feedback snippets. No emails or user IDs are sent. | Sending raw records. Shares personal data unnecessarily. |
| **AI rate limit (1 request / 10 s per user)** | Protects the API quota from repeated clicks. | No limit. |
| **One in-memory MongoDB for the test run** | Tests run against real MongoDB behaviour (validators, unique indexes, populate) with no setup, and each test file gets its own database. | Mocking Mongoose. That misses real query and validation behaviour. |
| **CORS allow-list from `CLIENT_URL`** | In production only the deployed frontend can call the API from a browser. In development every origin is allowed. | `cors()` allowing everything in production. |

## Security checklist

- Passwords hashed with bcrypt and never returned in responses.
- Every data route requires a valid JWT. Tokens expire after 1 hour.
- Role escalation to admin is blocked.
- Uploads: `.csv` only, 2 MB and 1,000-row limits, and only the uploader or an admin can delete.
- Regex input is escaped when matching program names from CSV files.
- Malformed JSON returns 400, and unknown routes return a JSON 404. Errors never expose stack traces.
- Secrets live only in environment variables. `.env` files are git-ignored and `.env.example` files document them.
- Docker images run as a non-root user.

## Known limitations and next steps

- No password reset by email yet. An administrator must help.
- The JWT can't be revoked before it expires. A refresh-token flow or token blacklist would fix that.
- The AI rate limit is kept in memory, so it resets on restart and isn't shared between instances. Redis would fix that at scale.
- Analytics are recalculated on every request. Use MongoDB aggregation pipelines or caching if the data grows large.
- Programs aren't owned by an organization. Multi-organization support would add an `organization` reference to every model.
