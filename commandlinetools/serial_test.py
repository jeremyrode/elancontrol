#!/usr/bin/env python3
import time
import serial


ser = serial.Serial(
    port='/dev/ttyAMA0',
    baudrate = 19200,
    parity=serial.PARITY_NONE,
    stopbits=serial.STOPBITS_ONE,
    bytesize=serial.EIGHTBITS,
    timeout=1
    )

old=ser.read(38)
while True:
    x = ser.read(38)
    if (x != old): # Only print when we change
       print(x.hex())
    old = x
    

