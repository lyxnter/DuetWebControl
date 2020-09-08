#!/usr/bin/env python3

import datetime
import json
import os
import requests
import socket
import sys
import textwrap
import time
import traceback
import urllib3
import subprocess
import http.client

urllib3.disable_warnings()


def log_print(*msg, file=sys.stdout):
    if type(file) == type(''):
        file=open(file, "a")
        print(datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S'), *msg, file=file)
        file.close()
    else :
        print(datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S'), *msg, file=file)
    

class SimpleLineProtocol:
    def __init__(self, sock):
        self.socket = sock
        self.buffer = b''
        socket.connect()

    def write(self, msg):
        msg = msg.strip()
        msg += '\n'
        self.socket.request('GET', msg.encode())

    def read_line(self):
        while b'\n' not in self.buffer:
            d = self.socket.recv(1024)
            if not d:
                raise socket.error()
            self.buffer = self.buffer + d

        i = self.buffer.find(b'\n')
        line = self.buffer[:i]
        self.buffer = self.buffer[i:].lstrip()
        return line

    def read_json_line(self):
        raw_lines = []
        line = b''
        while b'{' not in line and b'}' not in line:
            line = self.read_line()
            raw_lines.append(line)
        json_data = json.loads(line[line.find(b'{'):].decode())
        return json_data, raw_lines


def layer_changed(timelapse_folder, webcam_url, webcam_http_auth, webcam_https_verify, resolution, file=sys.stdout):
    if webcam_url == "":
        subprocess.run('pgrep mjpg_streamer && sudo pkill mjpg_streamer && sleep 1', shell=True, stdout=subprocess.PIPE)
        dev = subprocess.run("ls /dev/video*", shell=True, stdout=subprocess.PIPE)
        dev = str(dev.stdout, 'UTF-8').split('\n')
        for video in dev:
            trash = subprocess.run('(mjpg_streamer -i "input_uvc.so -d '+video+' -r 1920x1080 -f 15" -o "output_http.so -p 8080" -b &) && sleep 1', shell=True, stdout=subprocess.PIPE)
            out = subprocess.run('pgrep mjpg_streamer', shell=True, stdout=subprocess.PIPE)
            if out.returncode == 0:
                break
        r = requests.get("http://localhost:8080/?action=stream", auth=webcam_http_auth, verify=webcam_https_verify, timeout=5, stream=True)
    else :
        r = requests.get(webcam_url, auth=webcam_http_auth, verify=webcam_https_verify, timeout=5, stream=True)
    if r.status_code == 200:
        now = datetime.datetime.now()
        pic = os.path.join(timelapse_folder, now.strftime("%Y%m%dT%H%M%S") + ".jpg")
        with open(pic, 'wb') as f:
            for chunk in r:
                f.write(chunk)
        log_print("Picture taken!", pic, file=file)
    else:
        log_print('Failed to get timelapse snapshot.', file=sys.stderr)
    if webcam_url == "":
        subprocess.run('pgrep mjpg_streamer && pkill mjpg_streamer && sleep 1', shell=True, stdout=subprocess.PIPE)
        subprocess.run('(mjpg_streamer -i "input_uvc.so -f 15 -r 640x480" -o "output_http.so -w /home/lynxter/mjpg-streamer/www" -b &) && sleep 1', shell=True, stdout=subprocess.PIPE)


def firmware_monitor( duet_host, file, inter, onLayer, min, max, resolution, snapshot_folder, target, webcam_http_auth, webcam_https_verify, webcam_url):
    #time.sleep(30)  # give devices time to boot and join the network
    last_inter = 0
    duet_http = 'http://' + duet_host
    while True:
        try:
            log_print("Connecting to {}...".format(webcam_url), file=file)
            #layer_changed(snapshot_folder, webcam_url, webcam_http_auth, webcam_https_verify)
            log_print("Connection established.", file=file)

            timelapse_folder = None
            layer = 0
            while True:
                response = requests.get(duet_http + '/rr_status?type=3')
                statusJSON = response.json()
                status = statusJSON['status']

                if status == 'P' and not timelapse_folder:
                    # a print is running, but we don't know the filename yet
                    if type(file) == type(''):
                        myFile=open(file, "w")
                        myFile.write('')
                        myFile.close()
                    response = requests.get(duet_http + '/rr_fileinfo')
                    json_data = response.json()
                    log_print("Print started:", json_data['fileName'], file=file)
                    gcode_filename = os.path.basename(json_data['fileName'])
                    current_log_print = "{}-{}".format(datetime.datetime.now().strftime("%Y-%m-%dT%H_%M"), os.path.splitext(gcode_filename)[0])
                    if onLayer :
                        timelapse_folder = os.path.expanduser(snapshot_folder)
                        timelapse_folder = os.path.abspath(os.path.join(timelapse_folder, current_log_print + '_Timelapse'))
                        os.makedirs(timelapse_folder, exist_ok=True)
                        log_print("New timelapse folder created: {}{}".format(timelapse_folder, os.path.sep), file=file)
                        log_print("Waiting for layer changes...", file=file)
                        #layer_changed(snapshot_folder, webcam_url, webcam_http_auth, webcam_https_verify)
                    
                    if inter > 0:
                        interval_folder = os.path.expanduser(snapshot_folder)
                        interval_folder = os.path.abspath(os.path.join(interval_folder, current_log_print + '_Interval'))
                        os.makedirs(interval_folder, exist_ok=True)
                        log_print("New interval folder created: {}{}".format(interval_folder, os.path.sep), file=file)
                        log_print("Waiting for interval...", file=file)
                    
                    last_inter = datetime.datetime(2000, 1, 1, 0, 0)
                if status == 'I' and timelapse_folder:
                    # a previous print finished and we need to reset and wait for a new print to start
                    log_print("Print finished.", file=file)
                    #layer_changed(snapshot_folder, webcam_url, webcam_http_auth, webcam_https_verify, file=file)
                    if onLayer :
                        ffmpeg = subprocess.Popen("ls '"+timelapse_folder+"/'*.jpg | wc -l", stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
                        stdout, stderr = ffmpeg.communicate()
                        cmdline = "ffmpeg -r "+str(min(max(int(stdout)/target,min),max))+" -y -pattern_type glob -i '"+timelapse_folder+"/*.jpg' -c:v libx264 -pix_fmt yuvj420p '"+timelapse_folder+".mp4'"
                        log_print("Generating timelapse.", file=file)
                        print(cmdline)
                        ffmpeg = subprocess.Popen(cmdline, stdout=subprocess.PIPE, shell=True)
                        stdout, stderr = ffmpeg.communicate()
                        log_print("Cleaning up ressources.", file=file)
                        #ffmpeg = subprocess.Popen("rm -r '"+timelapse_folder+"'", stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
                        stdout, stderr = ffmpeg.communicate()
                        timelapse_folder = None
                    
                    if inter > 0:
                        ffmpeg = subprocess.Popen("ls '"+interval_folder+"/'*.jpg | wc -l", stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
                        stdout, stderr = ffmpeg.communicate()
                        cmdline = "ffmpeg -r "+str(min(max(int(stdout)/target,min),max))+" -y -pattern_type glob -i '"+interval_folder+"/*.jpg' -c:v libx264 -pix_fmt yuvj420p '"+interval_folder+".mp4'"
                        log_print("Generating interval.", file=file)
                        ffmpeg = subprocess.Popen(cmdline, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
                        stdout, stderr = ffmpeg.communicate()
                        print(stdout)
                        print(stderr)
                        log_print("Cleaning up ressources.", file=file)
                        #ffmpeg = subprocess.Popen("rm -r '"+interval_folder+"'", stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
                        stdout, stderr = ffmpeg.communicate()
                        interval_folder = None
                        
                if timelapse_folder:
                    if onLayer and statusJSON['currentLayer'] > layer:
                        log_print("Layer changed " + str(statusJSON['currentLayer']), file=file)
                        layer_changed(timelapse_folder, webcam_url, webcam_http_auth, webcam_https_verify, resolution, file=file)
                        layer = statusJSON['currentLayer']
                    if inter > 0 and (last_inter + datetime.timedelta(seconds=inter) ) < datetime.datetime.now() :
                        last_inter = datetime.datetime.now()
                        os.makedirs(interval_folder, exist_ok=True)
                        layer_changed(interval_folder, webcam_url, webcam_http_auth, webcam_https_verify, resolution, file=file)

                time.sleep(1 if status == 'P' else 10)
        except Exception as e:
            log_print('ERROR', e, file=sys.stderr)
            traceback.print_exc()
        log_print("Sleeping for a bit...", file=sys.stderr)
        time.sleep(15)


################################################################################

if __name__ == "__main__":

    if len(sys.argv) < 2:
        print(textwrap.dedent("""
            Take snapshot pictures of your DuetWifi/DuetEthernet log_printer on every layer change.
            A new subfolder will be created with a timestamp and g-code filename for every new log_print.

            This script connects via Telnet to your log_printer, make sure to enable it in your config.g:
                M586 P2 S1 ; enable Telnet

            You need to inject the following G-Code before a new layer starts:
                M400 ; wait for all movement to complete
                M118 P4 S"LAYER CHANGE" ; take a picture
                G4 P500 ; wait a bit

            If you are using Cura, you can use the TimelapseLayerChange.py script with the Cura Post-Processing plugin.
            If you are using Simplify3D, you can enter the above commands in the "Layer Change Script" section of your process.
            Slicer-generated z-hops might cause erronously taken pictures, use firmware-retraction with z-hop instead.

            After the print is done, use ffmpeg to render a timelapse movie:
                $ ffmpeg -r 25 -y -pattern_type glob -i '*.jpg' -c:v libx264 output.mp4

            Usage: ./timelapse.py <folder> <duet_host> <webcam_url> [<auth>] [--no-verify]

                 -d  --duet_host     duet_host      - DuetWifi/DuetEthernet hostname or IP address, e.g., mylog_printer.local or 192.168.1.42
                 -f  --folder        folder         - folder where all pictures will be collected, e.g., ~/timelapse_pictures
                 -m  --min-max       min:max         - lowest:highest framerate to use when generating the timelapse
                 -r  --resolution    resolution     - resolution to use when taking a picture (if unavaliable will take the closest one lower)
                 -t  --target        duration       - prefered duration of the timelapse
                [-a  --auth          auth]          - optional, HTTP Basic Auth if you configured a reverse proxy with auth credentials, e.g., john:passw0rd
                [-i  --interval      interval]      - optional, takes a snapshot every interval seconds
                [-l  --log           log_file]      - optional, redirects output to the file
                [-n  --no_verify]                   - optional, disables HTTPS certificat verification
                [-w  --webcam_url    webcam_url]    - HTTP or HTTPS URL that returns a JPG picture, e.g., http://127.0.0.1:8080/?action=snapshot
                [-z --layer]                        - optional, takes a snapshot every layer change
              """).lstrip().rstrip(), file=sys.stderr)
        sys.exit(1)

    file = sys.stdout
    inter = -1
    layer = False
    webcam_http_auth = None
    webcam_https_verify = True
    webcam_url = ""
    
    x = 1
    while x < len(sys.argv) :
        if sys.argv[x] == "-a" or sys.argv[x] == "--auth":
            x = x+1
            webcam_http_auth = requests.HTTPBasicAuth(sys.argv[x].split(':'))
        elif sys.argv[x] == "-d" or sys.argv[x] == "--duet_host":
            x = x+1
            duet_host = sys.argv[x]
        elif sys.argv[x] == "-f" or sys.argv[x] == "--folder" :
            x = x+1
            snapshot_folder = sys.argv[x]
        elif sys.argv[x] == "-i" or sys.argv[x] == "--interval":
            x = x+1
            inter = int(sys.argv[x])
        elif sys.argv[x] == "-l" or sys.argv[x] == "--log" :
            x = x+1
            file = sys.argv[x]
        elif sys.argv[x] == "-m" or sys.argv[x] == "--min-max":
            x = x+1
            min = sys.argv[x].split(':')[0]
            max = sys.argv[x].split(':')[1]
        elif sys.argv[x] == "-n" or sys.argv[x] == "--no_verify":
            webcam_https_verify = False
        elif sys.argv[x] == "-r" or sys.argv[x] == "--resolution":
            x = x+1
            resolution = sys.argv[x]
        elif sys.argv[x] == "-t" or sys.argv[x] == "--target":
            x = x+1
            target = int(sys.argv[x])            
        elif sys.argv[x] == "-w" or sys.argv[x] == "--webcam_url":
            x = x+1
            webcam_url = sys.argv[x]
        elif sys.argv[x] == "-z" or sys.argv[x] == "--layer":
            layer = True
        else :
            print(textwrap.dedent("""
                Usage: ./timelapse.py -f <folder> -d <duet_host> -w <webcam_url> [-a <auth>] [-n] [-i <interval>] [-l <log_file>]
                    
                     -d  --duet_host     duet_host      - DuetWifi/DuetEthernet hostname or IP address, e.g., mylog_printer.local or 192.168.1.42
                     -f  --folder        folder         - folder where all pictures will be collected, e.g., ~/timelapse_pictures
                     -m  --min-max       min:max         - lowest:highest framerate to use when generating the timelapse
                     -r  --resolution    resolution     - resolution to use when taking a picture (if unavaliable will take the closest one lower)
                     -t  --target        duration       - prefered duration of the timelapse
                     -w  --webcam_url    webcam_url     - HTTP or HTTPS URL that returns a JPG picture, e.g., http://127.0.0.1:8080/?action=snapshot
                    [-a  --auth          auth]          - optional, HTTP Basic Auth if you configured a reverse proxy with auth credentials, e.g., john:passw0rd
                    [-i  --interval      interval]      - optional, takes a snapshot every interval seconds
                    [-l --log            log_file]      - optional, redirects output to the file
                    [-n  --no_verify]                   - optional, disables HTTPS certificat verification
                    [-z --layer]                        - optional, takes a snapshot every layer change
                  """).lstrip().rstrip(), file=sys.stderr)
            sys.exit(1)
        x = x+1

    firmware_monitor(
        duet_host=duet_host,
        file=file,
        inter=inter,
        onLayer=layer,
        min=min,
        max=max,
        resolution=resolution,
        snapshot_folder=snapshot_folder,
        target=target,
        webcam_http_auth=webcam_http_auth,
        webcam_https_verify=webcam_https_verify,
        webcam_url=webcam_url
    )

