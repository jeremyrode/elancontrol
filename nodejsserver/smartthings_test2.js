


//---- Program set up and global variables -------------------------
var nodeAppVer = "1"
var logFile = "yes"	//	Set to no to disable error.log file.
var bridgePort = 8082	//	Synched with Device Handlers.
var hubPort = 8082	//	Synched with Device Handlers.
var http = require('http')
var net = require('net')
var fs = require('fs')
var server = http.createServer(onRequest)
var dgram = require('dgram')
var os = require('os')
var dgram = require('dgram')
var pollPort = 9999
var nodeApp = "elancontrol"
var interfaces = os.networkInterfaces()
for (var k in interfaces) {
	for (var k2 in interfaces[k]) {
		var address = interfaces[k][k2]
		if (address.family === 'IPv4' && !address.internal) {
			var bridgeIP = address.address
			var mac = address.mac.replace(/:/g, "")
			var bridgeMac = mac.toUpperCase()
		}
	}
}


//---- Start the HTTP Server Listening to Smart Hub --------------
server.listen(hubPort)
console.log("Elan Test " + nodeAppVer)
logResponse("\n\r" + new Date() + "\rError Log")

//---- Command interface to Smart Things ---------------------------
function onRequest(request, response){
	var command = request.headers["command"]
	var deviceIP = request.headers["tplink-iot-ip"]
	if (command == "pollForDevices") {
		var cmdRcvd = "\n\r" + new Date() + "\r\nIP: " + command + "being executed"
	} else {
		var cmdRcvd = "\n\r" + new Date() + "\r\nIP: " + deviceIP + " sent command " + command
	}
	console.log(" ")
	switch(command) {
		case "hubCheck":
			response.setHeader("action", command)
			response.setHeader("cmd-response", nodeAppVer)
			response.end()
			break

		//---- TP-Link Device Command ---------------------------
		case "deviceCommand":
			processDeviceCommand(request, response)
			break


		default:
			response.setHeader("cmd-response", "InvalidHubCmd")
			response.end()
			var respMsg = "#### Invalid Command ####"
			var respMsg = new Date() + "\n\r#### Invalid Command from IP" + deviceIP + " ####\n\r"
			console.log(respMsg)
			logResponse(respMsg)
	}
}



//---- Send deviceCommand and return response to Smart Hub ---------
function processDeviceCommand(request, response) {
	var command = request.headers["tplink-command"]
	var deviceIP = request.headers["tplink-iot-ip"]
	var respMsg = "deviceCommand sending to IP: " + deviceIP + " Command: " + command
	console.log(respMsg)
	var action = request.headers["action"]
	response.setHeader("action", action)
	var socket = net.connect(9999, deviceIP) //This is the socket of the TPLINK
	socket.setKeepAlive(false)
	socket.setTimeout(6000)  // 6 seconds timeout.  TEST WITHOUT
	socket.on('connect', () => {
		socket.write(TcpEncrypt(command))
	})
	socket.on('data', (data) => {
		socket.end()
		data = decrypt(data.slice(4)).toString('ascii')
		try {
			response.setHeader("cmd-response", data)
			response.end()
		} catch (e) {
			console.log("Response not sent due to error.  Will not impact operations")
		}
		var respMsg = "Command Response sent to Smart Hub"
		console.log(respMsg)
	}).on('timeout', () => {
		try {
			response.setHeader("cmd-response", "TcpTimeout")
			response.end()
			socket.end()
		} catch (e) {
			console.log("TCP Timeout Response.  Will not impact operations")
		}
		var respMsg = new Date() + "\n#### TCP Timeout in deviceCommand for IP: " + deviceIP + " ,command: " + command
		console.log(respMsg)
		logResponse(respMsg)
	}).on('error', (err) => {
		socket.end()
		var respMsg = new Date() + "\n#### Socket Error in deviceCommand for IP: " + deviceIP + " ,command: " + command
		console.log(respMsg)
		logResponse(respMsg)
	})
}


//----- Utility - Response Logging Function ------------------------
function logResponse(respMsg) {
	if (logFile == "yes") {
		fs.appendFileSync("error.log", "\r" + respMsg)
	}
}
