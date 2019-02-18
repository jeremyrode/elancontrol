"use strict";
const SerialPort = require('serialport');
const Delimiter = require('@serialport/parser-delimiter');
// We need the C bitbanger function via N-API
const addon = require('./build/Release/send_zpad_command_napi');

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-bitbanging-server';
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
// Old data so we only decode data if a change
const old_data = Buffer.alloc(35);
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
	connection.sendUTF(JSON.stringify(status));
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

function onDiffData(sdata) {
	if (old_data.compare(sdata) != 0) {
		var i;
		for (i = 0; i < 6; i++) {
			status.volume[i] = 48 - sdata[i*6+2] & 0b00111111;
			status.mute[i] = (sdata[i*6] & 0b00010000) >>> 4;
			status.input[i] = sdata[i*6] & 0b00000111;
		}
		console.log(status);
		var json = JSON.stringify(status);
		for (var i=0; i < clients.length; i++) {
			clients[i].sendUTF(json);
        }
		sdata.copy(old_data);
	}
}

parser.on('data', function(data) {onDiffData(data);});
