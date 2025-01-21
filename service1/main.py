import requests
import time
import threading
from flask import Flask
from flask import request, session
import psutil
import socket
import sys
from waitress import serve
import subprocess
import json

IP_ADDRESS = "http://servicenata2-internal:8000/"
server_sleeping = False
application_state = "INIT"
log_string = "Logs:"

print("Python script execution started")

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

def waitAfterRequest():
    time.sleep(2)
    global server_sleeping
    server_sleeping = False

def waitOnStagePaused():
    global application_state
    while(application_state == 'PAUSED'):
        time.sleep(1)


app = Flask(__name__)

@app.route('/state', methods=['GET', 'PUT'])
def handle_state():
    global application_state
    global log_string

    # change state requests
    if(request.method == 'PUT'):
        data = request.data.decode('utf-8')
        # debug logging
        log_string =  log_string + '{ STATE, PUT, payload: ' + data + ' }'
        # handle state changes
        if(data == "RUNNING"):
            application_state = "RUNNING"
        elif(data == "INIT"):
            application_state = "INIT"
            # force logout
            return "", 401, {'Content-Type': 'text/plain'}
        elif(data == "PAUSED"):
            application_state = "PAUSED"
            return application_state, 200, {'Content-Type': 'text/plain'}
        elif(data == "SHUTDOWN"):
            # TODO: change functionality SHUTDOWN
            application_state = "SHUTDOWN"
        # TODO: add functionality to keeping logs
    else:
        log_string =  log_string + '{ STATE, GET ' + application_state + ' }'

    if(application_state == "PAUSED"):
        waitOnStagePaused()
        return "", 500, {'Content-Type': 'text/plain'}

    # return state, always.
    return application_state, 200, {'Content-Type': 'text/plain'}

@app.route('/run-log')
def get_logs():
    # just for debugging at the moment
    if(application_state == "PAUSED"):
        waitOnStagePaused()
        return "", 500, {'Content-Type': 'text/plain'}
    if(application_state != "RUNNING"):
        return "", 404
    return log_string, 200

@app.route('/')
def handle_req():
    if(application_state == "PAUSED"):
        waitOnStagePaused()
        return "", 500, {'Content-Type': 'text/plain'}
    return "Not found", 404


@app.route('/request')
def handle_request():
    global application_state
    if(application_state == "PAUSED"):
        waitOnStagePaused()
        return "", 500, {'Content-Type': 'text/plain'}

    if(application_state != "RUNNING"):
        return "", 404, {'Content-Type': 'text/plain'}

    # TODO: move the functionality of /request
    # TODO: add functionality to run-log

    # Check for stop message
    # stopHeader = request.headers.get('StopMessage')
    # if(stopHeader == 'Yes'):
    #     subprocess.run(
    #         "docker stop $(docker ps -a -q)",
    #         shell=True
    #     )
    #     time.sleep(10)

    # fulfills the description, and no new request is returned in the next two seconds. After that working normally.
    #global server_sleeping
    #if(server_sleeping == True):
    #    time.sleep(2)
    #    server_sleeping = False
    #else:
    #    server_sleeping = True
    #    threading.Thread(target=waitAfterRequest).start()
    #

    s1 = getLocalObject()
    s2 = getRequestObject()
    output = {
        "service1" : s1,
        "service2" : s2
    }

    #@after_this_request
    #time.sleep(6)
    
    return json.dumps(output), 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    print("External server started")
    serve(app, host="0.0.0.0", port=8000) 
    # app.run(port=8000, host='0.0.0.0')
