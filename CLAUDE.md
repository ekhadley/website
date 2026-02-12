# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Flask-based web application and homepage for ekhadley. The project uses Python 3.13+ with uv for dependency management.

## Development Setup

This project uses `uv` for dependency management. To set up:

```bash
# Install dependencies
uv sync

# Activate virtual environment
source .venv/bin/activate
```

## Environment Variables

- `AUTH` - Authentication token required for protected routes (`/frigbot`, `/kissyreport`, `/api/friglogs/chunk`, `/api/frigbot/memories`). Pass as `?key=<token>` query parameter.

## Running the Application

```bash
# Development server (localhost:8000)
AUTH=your_token python app.py

# Production server with Gunicorn
AUTH=your_token gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## Project Structure

- `app.py` - Main Flask application entry point
- `frigbot.py` - Frigbot log viewer module (log reading, systemd status, chunked API)
- `frontend/static/` - Static assets (HTML, CSS, JS, images)
- `frontend/templates/` - Jinja2 templates for rendered pages
- `pyproject.toml` - Project dependencies and configuration
- `.venv/` - Virtual environment (excluded from git)

## Architecture Notes

### Flask Application

The Flask app (`app.py`) uses relative paths for template and static folders:
- Templates: `./frontend/templates`
- Static files: `./frontend/static`

### Routes

- `/` - Homepage (static HTML)
- `/frigbot` - Log viewer for the frigbot Discord bot (requires auth). Displays systemd service status and lazy-loads logs via the chunk API.
- `/kissyreport` - Static report page (requires auth)
- `/api/friglogs/chunk` - JSON API for paginated log retrieval (requires auth). Supports `offset` and `limit` query params.
- `/api/frigbot/memories` - JSON API listing markdown memory files (requires auth).
- `/api/frigbot/memories/<filename>` - JSON API returning content of a specific memory file (requires auth).

### Frigbot Module

The `frigbot.py` module handles:
- Reading JSONL log files from `/home/ek/wgmn/frigbot/logs/` (finds latest `frigbot_*.jsonl`)
- Chunked log retrieval for lazy loading (newest-first ordering)
- Querying frigbot systemd user service status via `systemctl --user`
- Listing and reading markdown memory files from `/home/ek/wgmn/frigbot/memories/`

### Frigbot UI

The frigbot page (`/frigbot`) has a tabbed interface:
- **Logs tab** - Log viewer with sidebar filters (search, log levels, event types) and lazy-loaded log rows.
- **Memories tab** - File list of markdown memories on the left, rendered markdown content on the right. Uses `marked.js` (CDN) for client-side markdown rendering. Memories are lazy-loaded on first tab switch.

### Socket.IO

Flask-SocketIO is included as a dependency but not currently used.

## Type Checking

The project includes `basedpyright` for static type checking:

```bash
# Run type checker
basedpyright
```
