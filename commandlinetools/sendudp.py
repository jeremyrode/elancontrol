#!/usr/bin/python
import socket
import sys

if len(sys.argv) != 3:
    print "Two args"
    exit()

UDP_IP = "127.0.0.1"
UDP_PORT = 6969
MESSAGE = chr(int(sys.argv[1])) + chr(int(sys.argv[2]))

print "UDP target IP:", UDP_IP
print "UDP target port:", UDP_PORT
print "message:", MESSAGE

sock = socket.socket(socket.AF_INET, # Internet
                     socket.SOCK_DGRAM) # UDP
sock.sendto(MESSAGE, (UDP_IP, UDP_PORT))
