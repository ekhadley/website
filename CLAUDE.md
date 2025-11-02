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

## Running the Application

```bash
# Development server (localhost:8000)
python app.py

# Production server with Gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## Project Structure

- `app.py` - Main Flask application entry point
- `frontend/static/` - Static assets (HTML, CSS, JS, images)
- `frontend/templates/` - Jinja2 templates for rendered pages
- `pyproject.toml` - Project dependencies and configuration
- `.venv/` - Virtual environment (excluded from git)

## Architecture Notes

### Flask Application

The Flask app (`app.py`) is configured with hardcoded absolute paths for template and static folders:
- Templates: `/home/ek/wgmn/website/frontend/templates`
- Static files: `/home/ek/wgmn/website/frontend/static`

**Important**: When modifying Flask configuration, these paths may need to be updated to use relative paths or environment variables for better portability.

### Frontend Serving

The application uses a hybrid approach:
- The root route (`/`) serves a static `index.html` file directly from `frontend/static/`
- The `/friglogs` route uses Jinja2 template rendering to display logs from `/home/ek/wgmn/frigbot/logs/frigbot.log`

### Routes

- `/` - Homepage (static HTML)
- `/friglogs` - Log viewer for the frigbot Discord bot, reads and displays the entire log file with error handling

### Socket.IO (Currently Disabled)

The codebase includes Flask-SocketIO as a dependency and has commented-out socket initialization code in `app.py:12-20`. If real-time features are needed, this can be re-enabled.

## Type Checking

The project includes `basedpyright` for static type checking:

```bash
# Run type checker
basedpyright
```
