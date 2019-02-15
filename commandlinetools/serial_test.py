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
old_bin_string = bin(int(old.hex(),16))
while True:
	x = ser.read(38)
	if (x != old): # Only print when we change
		bin_string = bin(int(x.hex(),16))
		bin_string = bin_string[3:]; #Cut off 0B
		for y in range(len(bin_string)):
			if bin_string[y] == old_bin_string[y]:
				print("\033[0;41;40m" + bin_string[y] + "\033[0;47;40m",end='')
			else:
				print(bin_string[y],end='')
			if y%8 == 7:
				print('|',end='')
		print('')
		old_bin_string = bin_string
		old = x


