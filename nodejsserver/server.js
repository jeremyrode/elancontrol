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
const old_data = Buffer.alloc(35); //Serial buffer to compair for changes
var clients = [ ]; //Who's connected
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
	console.log((new Date()) + ' Connection accepted.');
	console.log('Client List: ');
	for (var i = 0; i < clients.length; i++) {
		console.log(clients[i].remoteAddress)
	}
	connection.sendUTF(JSON.stringify(status)); //Send the current status to new clients
	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			var commnds = message.utf8Data.split(":");
			var command = parseInt(commnds[0]);
			var channel = parseInt(commnds[1]);
			addon.send_zpad_command_napi(channel,command);
		}
		else {
			console.log('Got non utf8 message');
		}
	});
	// user disconnected
	connection.on('close', function(reasonCode, description) {
		console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
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
  for (var i = 0; i < 6; i++) {
    cstatus.volume[i] = 48 - sdata[i*6+2] & 0b00111111;
    cstatus.mute[i] = (sdata[i*6] & 0b00010000) >>> 4;
    cstatus.input[i] = sdata[i*6] & 0b00000111;
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
  if (old_data.compare(sdata) != 0) { //If the serial data changes (doesn't mean status has changed)
    var new_data = extractData(sdata); //Get the new status
    if (diffData(new_data,status)) { //If new status is different
      status = new_data; //Store new status
      var json = JSON.stringify(status); // encode new status
      for (var i=0; i < clients.length; i++) { //Send the status to clients
        clients[i].sendUTF(json);
      }
    }
    sdata.copy(old_data); // Save the serial data for compairson
  }
}

parser.on('data', function(data) {onDiffData(data);});
