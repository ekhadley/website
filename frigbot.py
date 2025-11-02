import sys
from pathlib import Path
import os
import glob
import subprocess
from datetime import datetime

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

def get_systemd_info():
    """
    Returns a dict with information about the frigbot systemd service.
    
    Returns:
        dict with keys:
            - 'is_active': bool indicating if service is currently active/running
            - 'start_time': datetime object of when service was started, or None
        Returns None if there's an error querying the service.
    """
    try:
        # Query systemd for the service's ActiveState and ActiveEnterTimestamp
        result = subprocess.run(
            ['systemctl', 'show', 'frigbot', '--property=ActiveState,ActiveEnterTimestamp'],
            capture_output=True,
            text=True,
            check=True
        )
        
        output = result.stdout.strip()
        if not output:
            return None
        
        # Parse the properties
        properties = {}
        for line in output.split('\n'):
            if '=' in line:
                key, value = line.split('=', 1)
                properties[key] = value
        
        # Check if service is active
        active_state = properties.get('ActiveState', '')
        is_active = active_state == 'active'
        
        # Parse the start timestamp
        timestamp_str = properties.get('ActiveEnterTimestamp', '')
        start_time = None
        
        # If the service has been started, parse the timestamp
        if timestamp_str and timestamp_str != 'n/a':
            try:
                # Parse the timestamp (e.g., "Sun 2025-11-02 14:30:45 GMT")
                start_time = datetime.strptime(timestamp_str, '%a %Y-%m-%d %H:%M:%S %Z')
            except ValueError:
                # Failed to parse timestamp, leave as None
                pass
        
        return is_active, start_time
        
    except subprocess.CalledProcessError:
        # Service doesn't exist or systemctl command failed
        return None
    except Exception:
        # Any other error
        return None


def format_time_since(start_time):
    """
    Formats a time difference into a human-readable string like "2h 15m" or "3d 4h"
    """
    if not start_time:
        return None
    
    now = datetime.now(start_time.tzinfo) if start_time.tzinfo else datetime.now()
    delta = now - start_time
    
    total_seconds = int(delta.total_seconds())
    days = total_seconds // 86400
    hours = (total_seconds % 86400) // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    
    return f"{days}d {hours}h {minutes}m {seconds}s"

def route():
    log_content = load_log_content()
    systemd_info = get_systemd_info()
    
    is_active = False
    start_time = None
    start_time_formatted = None
    time_since = None
    
    if systemd_info:
        is_active, start_time = systemd_info
        if start_time:
            start_time_formatted = start_time.strftime("%Y-%m-%d %H:%M:%S")
            time_since = format_time_since(start_time)
    
    return flask.render_template(
        "frigbot.html", 
        log_content=log_content, 
        systemd_is_active=is_active, 
        systemd_start_time=start_time_formatted,
        systemd_time_since=time_since
    )

if __name__ == "__main__":
    print(get_systemd_info())