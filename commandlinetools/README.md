# elancontrol
### Code to control an Elan System6 Integrated Multi-Zone Controller from RaspberryPi
Command line tools useful for E6
Mostly for those who want to explore how I figured out the protocol.
test_c_call: Calling the C bit banger from C++, when my original plan was to write the server in C++
serial_test.py: Program I wrote to figure out status bits from serial port.  Prints status packet in binary, and highlights changes from the last packet

volume_up: Sends a volume up command
send_zpad_command_CLI.c: Command line Elan command sender
send_zpad_command.c: Command sender function for C++
