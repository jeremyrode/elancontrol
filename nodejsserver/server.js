"use strict";
const SerialPort = require('serialport');
const Delimiter = require('@serialport/parser-delimiter');
// We need the C bitbanger function via N-API
const addon = require('./build/Release/send_zpad_command_napi');

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'elan-websocket';
// Port where we'll run the websocket server
var webSocketsServerPort = 1338;
// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
// Status Object
var status = new Object();
status.volume = [0,0,0,0,0,0];
status.mute = [0,0,0,0,0,0];
status.input = [0,0,0,0,0,0];
status.on = false;
var last_update = 0; //Timestamp of last serial update
const old_data = Buffer.alloc(35); //Serial buffer to compair for changes
var clients = [ ]; //Who's connected
var onStatusCheck; //Interval that checks if system is still on
//  HTTP server
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(webSocketsServerPort, function() {
	console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});
// WebSocket server
var wsServer = new webSocketServer({
	httpServer: server
});

wsServer.on('request', function(request) {
	console.log((new Date()) + ' Connection from origin ' + request.remoteAddress );
	// accept connection - you should check 'request.origin' to
	// make sure that client is connecting from your website
	// (http://en.wikipedia.org/wiki/Same_origin_policy)
	var connection = request.accept(null, request.origin);
	// we need to know client index to remove them on 'close' event
	var index = clients.push(connection) - 1;
	/* console.log((new Date()) + ' Connection accepted.');
	console.log('Client List: ');
	for (var i = 0; i < clients.length; i++) {
		console.log(clients[i].remoteAddress)
	} */
	connection.sendUTF(JSON.stringify(status)); //Send the current status to new clients
	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			var commnds = message.utf8Data.split(":"); //Yes, I should have used JSON
      if commnds.length == 2 { //If only one colon, it's a straight command
        var command = parseInt(commnds[0]);
        var channel = parseInt(commnds[1]);
        addon.send_zpad_command_napi(channel,command); //Calls my C bitbanger
      }
		}

		console.log('Got malformatted command from client');

	});
	// user disconnected (this doesn't get all disconnects)
	connection.on('close', function(reasonCode, description) {
		// console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
		// remove user from the list of connected clients
		clients.splice(index, 1);
	});
});

const port = new SerialPort('/dev/ttyAMA0', {
	baudRate: 19200
})

const parser = port.pipe(new Delimiter({delimiter: new Buffer('E00081','hex') }));

function extractData(sdata) {
  var cstatus = new Object();
  cstatus.volume = [0,0,0,0,0,0];
  cstatus.mute = [0,0,0,0,0,0];
  cstatus.input = [0,0,0,0,0,0];
  cstatus.on = true; //We're on if we're extrcting data
  for (var i = 0; i < 6; i++) {
    cstatus.volume[i] = 48 - sdata[i*6+2] & 0b00111111; //Volume is sent as a 6-bit attenuation value in LSBs
    cstatus.mute[i] = (sdata[i*6] & 0b00010000) >>> 4; // Mute is just a bit
    cstatus.input[i] = sdata[i*6] & 0b00000111; // Status is 3 LSBs
  }
  return cstatus;
}

function diffData(data1,data2) {
  var is_diff = false;
  for (var i = 0; i < 6; i++) {
    is_diff = is_diff || (data1.volume[i] !== data2.volume[i]);
    is_diff = is_diff || (data1.mute[i] !== data2.mute[i]);
    is_diff = is_diff || (data1.input[i] !== data2.input[i]);
  }
  return is_diff;
}

function onDiffData(sdata) {
  last_update = Date.now(); //We are getting serial data, note the time
  if (status.on == false) { //If we have differing data, we turned on!
    status.on = true; // We're on now!
    onStatusCheck = setInterval(isOn,2000); // Check to see if we're off every 2s
  }
  if (old_data.compare(sdata) != 0) { // If the serial data changes (doesn't mean status has changed)
    var new_data = extractData(sdata); // Get the new status
    if (diffData(new_data,status)) { // If new status is different
      status = new_data; //Store new status
      updateClients();
    }
    sdata.copy(old_data); // Save the serial data for compairson
  }
}

setInterval(updateClients,10000); // Force an update every 10s, will also help cull clients

function updateClients() {
  var json = JSON.stringify(status); // encode new status
  for (var i=0; i < clients.length; i++) { //Send the status to clients
    if (clients[i].connected) { //only if client is connected
      clients[i].sendUTF(json);
    }
    else {
      //console.log((new Date()) + " Peer " + clients[i].remoteAddress + " culled");
      clients.splice(i, 1); // Remove the client
      /*console.log('Client List: ');
      for (var i = 0; i < clients.length; i++) {
        console.log(clients[i].remoteAddress);
      } */
    }
  }
}

parser.on('data', function(data) {onDiffData(data);});

function isOn() {
  if (Date.now() - last_update > 2000) { //If no serial data for 2s, we off
    //console.log('System is Off');
    status.volume = [0,0,0,0,0,0];
    status.mute = [0,0,0,0,0,0];
    status.input = [0,0,0,0,0,0];
    status.on = false;
    updateClients();
    clearInterval(onStatusCheck); //No need to check anymore we're off
  }
}
