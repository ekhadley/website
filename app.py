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

if __name__ == "__main__":
    #socket.run(app, host="localhost", port=8000)
    app.run(host="localhost", port=8000)
