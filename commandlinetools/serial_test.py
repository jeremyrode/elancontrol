#!/usr/bin/env python3
import time
import serial

ser = serial.Serial(
	port='/dev/ttyAMA0',
	baudrate = 19200,
	parity=serial.PARITY_NONE,
	stopbits=serial.STOPBITS_ONE,#35B (minus 6 bits) with two stop bits 
	bytesize=serial.EIGHTBITS,	# 38 bytes with one stop bit
	timeout=1
	)

old=ser.read(38)
old_bin_string = bin(int(old.hex(),16))
banner = 0;
while True:
	x = ser.read(38)
	if (x != old): # Only print when we change
		#if banner%10 == 0: #print out a 
			
		bin_string = bin(int(x.hex(),16))
		bin_string = bin_string[3:]; #Cut off 0B
		for y in range(len(bin_string)):
			if bin_string[y] == old_bin_string[y]:
				print(' ',end='')
			else:
				print('|',end='')
			if y%8 ==7:
				print(' ',end='')
		print('')
		for y in range(len(bin_string)):
			print(bin_string[y],end='')
			if y%8 == 7:
				print('|',end='')
		print('',flush=True)
		old_bin_string = bin_string
		old = x
		banner = banner + 1


