


//---- Program set up and global variables -------------------------
var hubPort = 8082	//	Synched with Device Handlers.
var http = require('http')
var net = require('net')
var server = http.createServer(onRequest)
var nodeApp = "elancontrol"


//---- Start the HTTP Server Listening to Smart Hub --------------
server.listen(hubPort)
console.log("SmartThings Server Test")

//---- Command interface to Smart Things ---------------------------
function onRequest(request, response){
	var command = request.headers["command"]
	var deviceIP = request.headers["tplink-iot-ip"]
	console.log(request)
	response.setHeader("action", command)
	response.setHeader("cmd-response", "1")
	response.end()
}
