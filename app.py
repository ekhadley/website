import sys
from pathlib import Path

import flask
from flask import Flask, url_for

app = Flask(
    __name__,
    template_folder="/home/ek/wgmn/website/frontend/templates",
    static_folder="/home/ek/wgmn/website/frontend/static",
)
#socket = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return flask.send_file("./frontend/static/index.html")
    #return "Hello World!"

@app.route("/friglogs")
def friglogs():
    log_file_path = "/home/ek/wgmn/frigbot/logs/frigbot.log"
    try:
        with open(log_file_path, "r") as f:
            log_content = f.read()
        return flask.render_template("logs.html", log_content=log_content)
    except FileNotFoundError:
        return flask.render_template("logs.html", log_content="Log file not found.", error=True)
    except Exception as e:
        return flask.render_template("logs.html", log_content=f"Error reading log file: {str(e)}", error=True)

if __name__ == "__main__":
    #socket.run(app, host="localhost", port=8000)
    app.run(host="localhost", port=8000)
