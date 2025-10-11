import sys
from pathlib import Path
from flask_socketio import SocketIO
from flask import Flask, render_template

app = Flask(
    __name__,
    template_folder="website/templates",
    static_folder="website/static",
)
#socket = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    #return render_template("index.html")
    return "Hello World!"

if __name__ == "__main__":
    #socket.run(app, host="localhost", port=8000)
    app.run(host="localhost", port=8000)
