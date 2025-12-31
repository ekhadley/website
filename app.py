import os

import flask
from flask import Flask, abort

import frigbot

app = Flask(
    __name__,
    template_folder="./frontend/templates",
    static_folder="./frontend/static",
)
auth_token = os.getenv("AUTH")

@app.route("/")
def index():
    return flask.send_file("./frontend/static/index.html")
    #return "Hello World!"

@app.route("/frigbot")
def frigbot_route():
    return frigbot.route()

@app.route("/kissyreport")
def kissyreport():
    provided_key = flask.request.args.get('key')
    if provided_key != auth_token:
        abort(403)
    return flask.send_file("./frontend/static/kissyreport.html")

@app.route("/api/friglogs/chunk")
def frigbot_logs_chunk():
    """API endpoint to fetch log chunks for lazy loading."""
    provided_key = flask.request.args.get('key')
    if provided_key != auth_token:
        abort(403)

    try:
        offset = int(flask.request.args.get('offset', 0))
        limit = int(flask.request.args.get('limit', 100))

        # Validate parameters
        offset = max(0, offset)
        limit = max(1, min(limit, 500))  # Cap at 500 lines per request

        result = frigbot.get_log_chunk(offset=offset, limit=limit)
        return flask.jsonify(result)

    except ValueError:
        return flask.jsonify({
            "lines": [],
            "has_more": False,
            "total_lines": 0,
            "offset": 0,
            "error": "Invalid offset or limit parameter"
        }), 400

if __name__ == "__main__":
    app.run(host="localhost", port=8000)
