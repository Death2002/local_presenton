# AGENTS.md – Presenton

> Compact, high-signal guidance for OpenCode sessions. Delete or update anything that becomes stale.

---

## Repository Overview

Presenton is an **open-source AI presentation generator** (Apache 2.0). It has **two main entry points**:

1. **Docker / Web deployment** – production-ready containerized app
2. **Electron desktop app** – cross-platform desktop app (Mac/Windows/Linux)

Architecture: FastAPI backend (`servers/fastapi/`) + Next.js frontend (`servers/nextjs/`) + Electron wrapper (`electron/`).

---

## Directory Structure

| Directory | Purpose |
| --------- | ------- |
| `servers/fastapi/` | Python FastAPI backend (LLM orchestration, DB, API, MCP server) |
| `servers/nextjs/` | Next.js 16 frontend (React 19, Tailwind, Radix UI, Redux) |
| `electron/` | Electron desktop app source, build scripts, and bundled resources |
| `app_data/` | Runtime data directory (DB, uploads, exports, user config) |
| `scripts/` | Shared build/sync scripts (e.g. `sync-presentation-export.cjs`) |
| `docs/` | Extra docs (electron dependency strategy, macOS setup, etc.) |

---

## Technology Stack

- **Backend**: Python 3.11, FastAPI, SQLModel, Alembic, uv (dependency manager), Uvicorn
- **Frontend**: Next.js 16.2.6, React 19, TypeScript 5, Tailwind CSS 4 (Next.js uses v3)
- **Desktop**: Electron 42.2.0, Electron Builder 26.8.1
- **Test**: pytest (backend), Cypress (frontend – minimal test coverage)
- **Container**: Docker, Docker Compose, nginx

---

## Developer Commands

### Electron (Desktop Development)

```bash
cd electron
# First-time setup
npm run setup:env

# Dev mode: compiles TypeScript, starts Electron with built-in backend/UI
npm run dev

# Type check only
npm run typecheck

# Full desktop build
npm run build:all

# Create distributables
npm run build:all && npm run dist
```

### Docker (Web Development)

```bash
# Development (mounts code for hot-reload)
docker compose up development

# Production (no hot-reload)
docker compose up production

# With GPU
docker compose up production-gpu
```

### Backend (FastAPI)

```bash
cd servers/fastapi

# Install dependencies (requires uv)
uv sync --dev

# Run server
uv run python server.py --port 8000

# Run tests
uv run pytest tests/ -v
```

### Frontend (Next.js)

```bash
cd servers/nextjs
npm ci
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint (see note below about disabled rules)
```

---

## Testing

- **Backend**: `cd servers/fastapi && uv run pytest tests/ -v --tb=short`
- **Frontend**: Very minimal; Cypress component test infrastructure exists but has low test coverage.
- **Local pre-push**: Run `./test-local.sh` at the root. It runs FastAPI tests, Next.js lint/build, and optionally a Docker build.
- **CI**: GitHub Actions `.github/workflows/test-all.yml` mirrors `test-local.sh`. Runs on push/PR to `main`.

---

## Conventions & Quirks

### ESLint
- Config: `servers/nextjs/eslint.config.mjs`
- Uses `eslint-config-next` but **many React Hooks rules and TS strict rules are explicitly turned off** (see config). Lint is intentionally permissive.

### Python Dependency Management
- Uses `uv`, not `pip` or `poetry`. Lockfile is `servers/fastapi/uv.lock`.
- Python version is pinned to **3.11** (see `.python-version`).

### Environment Variables
- Hundreds of env vars are forwarded via `docker-compose.yml`. Key patterns:
  - `LLM` selects the provider (`openai`, `google`, `vertex`, `azure`, `bedrock`, `anthropic`, `ollama`, `custom`, etc.)
  - `IMAGE_PROVIDER` selects image backend (`dall-e-3`, `pexels`, `pixabay`, `gemini_flash`, etc.)
  - `CAN_CHANGE_KEYS=false` locks API keys in the UI (common for Docker deployments)
  - `MIGRATE_DATABASE_ON_STARTUP=true` runs Alembic on startup
  - `DATABASE_URL` defaults to SQLite in `app_data`
- Full env docs are in `README.md`, but the **source of truth** is `servers/fastapi/utils/get_env.py` and `servers/nextjs/` utilities.

### Database Migrations
- Alembic is used. Migration files live in `servers/fastapi/alembic/versions/`.
- Startup migration logic in `migrations.py` handles legacy databases by inferring schema state and stamping the correct baseline revision.
- Manual CLI: `cd servers/fastapi && alembic revision --autogenerate` (uses `alembic.ini`)

### Auth Model
- **Single admin account** per instance. Credentials stored in `app_data/userConfig.json`.
- Bootstrapped via `AUTH_USERNAME` + `AUTH_PASSWORD` env vars.
- Recovery: `RESET_AUTH=true` (single boot), or `AUTH_OVERRIDE_FROM_ENV=true` to overwrite.

### MCP Server
- The backend includes an MCP (Model Context Protocol) server (`mcp_server.py`) exposing presentation generation functionality.

### Electron App Architecture
- **Source**: `electron/app/` (TypeScript)
- **Compiled output**: `electron/app_dist/` (deleted and recompiled on each build)
- **Resources**: `electron/resources/` includes Next.js built output, FastAPI built binary, Chromium for export, ImageMagick, and document extraction tools.
- Key build scripts:
  - `npm run build:nextjs` – builds Next.js into `resources/nextjs/`
  - `npm run build:fastapi` – bundles FastAPI with PyInstaller into `resources/fastapi/`
  - `npm run build:export-runtime` – syncs the PPTX export runtime
  - `npm run prepare:export-chromium` / `prepare:imagemagick` – downloads platform-specific bundled binaries

### Export / Presentation Runtime
- PPTX export uses a bundled runtime (`presentation-export/`). Synchronized via `scripts/sync-presentation-export.cjs`.
- The Electron app and Docker image both use `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` for export rendering.

### Next.js Path alias
- `@/` maps to the root of `servers/nextjs/` (configured in `tsconfig.json` paths).

---

## Important Constraints

- **Contributions outside `electron/` may not be accepted** (per `CONTRIBUTING.md`). The Electron app is the primary contribution surface.
- Node.js **20** is required.
- Python **3.11** is required for the backend.
- The Next.js frontend builds to a **standalone output** (`.next-build/standalone/` in production Docker builds).
- The `development` Docker service mount-binds the entire repo (`./:/app`), so `node_modules` and `.venv` are mounted over by Docker named volumes to avoid host/container conflicts.
- The `start.js` script at the root is the Docker entrypoint. It orchestrates both FastAPI and Next.js servers.

---

## Entry Points

| Component | Entry File | Description |
| --------- | ---------- | ----------- |
| FastAPI | `servers/fastapi/server.py` | CLI: `--port` and `--reload` flags |
| Next.js | `servers/nextjs/app/page.tsx` | Main app page |
| Electron | `electron/app/main.ts` | Main Electron process |
| MCP Server | `servers/fastapi/mcp_server.py` | Standalone MCP server |

---

## Gotchas

- **Do NOT use `pip install` in `servers/fastapi/`**. Use `uv sync --dev` or `uv run <command>`.
- **Docker development**: Code is live-mounted, but `node_modules` and Python `.venv` inside the container are separate from the host. Changes to `package.json` or `pyproject.toml` require rebuilding the image or running install inside the container.
- **Electron build**: Requires all three build steps (Next.js, FastAPI, Electron) in sequence. `build:all` runs the full chain.
- **Alembic**: Has special handling for legacy databases that don't have a `alembic_version` table. The migration code infers the current schema state and stamps the appropriate baseline.
