# elancontrol
### Code to control an Elan System6 Integrated Multi-Zone Controller from RaspberryPi
This is the actual working system.
## What's in this folder:
- html: frontend html and javascript files (symbolically link this to a webserver)
- binding.gyp / package.json: stuff for building the N-API function
- send_zpad_command_napi: C function to bitbang commands out of GPIOs, uses N-API to interface to Node.js
- server.js: Node.js backed server accepting websocket command, sending to C function

HTML Frontend /JavaScript -> Via Websocket -> Node.js Sever -> Via N-API -> C Bitbang GPIO -> Custom Level Shifter PCB
