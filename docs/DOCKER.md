# Running with Docker

The repository contains a Dockerfile for each part and a `docker-compose.yml`
that runs the whole application with one command.

| Container | Image | Port |
|---|---|---|
| `client` | React build served by nginx (`client/Dockerfile`) | http://localhost:8080 |
| `server` | Express API on Node 20 (`server/Dockerfile`) | http://localhost:5000 |
| `mongo` | MongoDB 7, data kept in the `mongo-data` volume | internal only |

## Start

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine with Compose v2).

```bash
docker compose up --build
```

Open http://localhost:8080, register through the API (or Bruno), then log in.

Optional settings go in a `.env` file next to `docker-compose.yml`:

```
JWT_SECRET=a-long-random-string
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GEMINI_API_KEY=your-gemini-api-key
```

## Stop

```bash
docker compose down            # keep the database
docker compose down --volumes  # also delete the database
```

## Details

- The server image installs production dependencies only, runs as the non-root `node` user and has a health check on `/api/health`.
- The client image is built in two stages: Node builds the app, then only the static files are copied into nginx.
  `VITE_API_URL` is a build argument because Vite builds it into the bundle.
- `server` waits for MongoDB's health check before starting.
- The **Docker** GitHub Actions workflow (`.github/workflows/docker.yml`) builds both images, starts the stack and runs smoke tests on every pull request.

## Troubleshooting

- **"failed to connect to the docker API"**: Docker Desktop is not running. Start it and wait until it reports "Engine running".
- **Docker Desktop will not start on Windows**: it needs WSL 2. Run `wsl --update` in an administrator terminal and restart.
- **Port already in use**: stop whatever uses ports 5000 or 8080, or change the left side of `ports:` in `docker-compose.yml`.
