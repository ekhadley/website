import sys
from pathlib import Path
import os
import glob

import flask

LOG_FILE_DIR = "/home/ek/wgmn/frigbot/logs"

def load_log_content():
    try:
        # Find all .jsonl files in the logs directory
        jsonl_files = glob.glob(os.path.join(LOG_FILE_DIR, "frigbot_*.jsonl"))
        
        if not jsonl_files:
            return "No log files found."
        
        # Sort by filename (descending) to get the most recent
        latest_log_file = sorted(jsonl_files, reverse=True)[0]
        
        # Read and return the contents
        with open(latest_log_file, "r") as f:
            return f.read()
    except FileNotFoundError:
        return "Log file not found."
    except Exception as e:
        return f"Error reading log file: {str(e)}"

def route():
    log_content = load_log_content()
    return flask.render_template("frigbot.html", log_content=log_content)
