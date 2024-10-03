import requests
import time
from flask import Flask
from flask import request
import psutil
import socket
import sys
from waitress import serve

IP_ADDRESS = "http://servicenata2-internal:8000/"

def getIpAddress():
    hostName = socket.gethostname()
    ip = socket.gethostbyname(hostName)
    return ip

def getProcesses():
    output = []
    for proc in psutil.process_iter(['pid', 'name', 'username']):
        output.append(proc.info)
    return output

def getFreeDiskSpace():
    stats = psutil.disk_usage('/')
    gigabytes = round(stats.free / 1000000000, 2)
    return str(gigabytes) + " Gb"

def getLastBootTimeSince():
    uptime_seconds = time.time() - psutil.boot_time()
    return str(round(uptime_seconds, 2)) + " s"

def getRequestObject():
    service1 = {
        "ip_address": "",
        "processes" : "",
        "disk_space" : "",
        "last_boot_since" : ""
    }
    try:
        response = requests.get(IP_ADDRESS)
        return response.json()
    except Exception as e:
        print(e)
    return service1

def getLocalObject():
    return {
        "ip_address": getIpAddress(),
        "processes" : getProcesses(),
        "disk_space" : getFreeDiskSpace(),
        "last_boot_since" : getLastBootTimeSince()
    }

app = Flask(__name__)

@app.route('/')
def handle_request():
    s1 = getLocalObject()
    s2 = getRequestObject()
    output = {
        "service1" : s1,
        "service2" : s2
    }
    return output

if __name__ == '__main__':
    serve(app, host="0.0.0.0", port=8000)
    #print("External server started")
    # app.run(port=8000, host='0.0.0.0')
