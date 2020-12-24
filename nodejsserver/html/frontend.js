
statust = document.getElementById("statusspan");

zone1 = document.getElementById("zone1");
zone2 = document.getElementById("zone2");
zone3 = document.getElementById("zone3");
zone4 = document.getElementById("zone4");
zone5 = document.getElementById("zone5");
zone6 = document.getElementById("zone6");

zone1s = document.getElementById("zone1s");
zone2s = document.getElementById("zone2s");
zone3s = document.getElementById("zone3s");
zone4s = document.getElementById("zone4s");
zone5s = document.getElementById("zone5s");
zone6s = document.getElementById("zone6s");
var connection;
var checkStatus = 0;

statust.innerHTML = "PreOpen";
// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;
if (window.WebSocket === undefined) {
	content.html($('<p>',{ text:'Sorry, but your browser doesn\'t support WebSocket.'}));
	exit;
	}
else {
	window.addEventListener("load", start, false);
	statust.innerHTML = "Listener Added";
}

function start() {
	statust.innerHTML = "Connecting";
	connection = new WebSocket('ws://192.168.86.2:1338');
	connection.onopen = function(evt) { onOpen(evt); };
	connection.onerror = function(evt) { onError(evt); };
	connection.onmessage = function(evt) { onMessage(evt); };
	if (checkStatus == 0) {
		checkStatus = setInterval(checkTimeout, 10000);
	}
}

 function checkTimeout() {
    if (connection.readyState !== 1) {
		statust.innerHTML = "Connection Timeout";
		console.log('Connection Timeout');
		start();
		console.log('Restarted');
    }
}

function onOpen(evt) {
	statust.innerHTML = "Connected";
	//Handle User dragging the slider, send a 3 part command to server
	zone1s.onchange = function() {
		connection.send(0 + ':' + 1 + ':' + this.value );
	};
	zone2s.onchange = function() {
		connection.send(0 + ':' + 2 + ':' + this.value );
	};
	zone3s.onchange = function() {
		connection.send(0 + ':' + 3 + ':' + this.value );
	};
	zone4s.onchange = function() {
		connection.send(0 + ':' + 4 + ':' + this.value );
	};
	zone5s.onchange = function() {
		connection.send(0 + ':' + 5 + ':' + this.value );
	};
	zone6s.onchange = function() {
		connection.send(0 + ':' + 6 + ':' + this.value );
	};
};

function onError(evt) {
	statust.innerHTML = "Connection Error";
};

function onMessage(message) {
	try {
		var json = JSON.parse(message.data);
	} catch (e) {
		console.log('Invalid JSON: ', message.data);
		statust.innerHTML = "Invalid Message";
		return;
	}
	if (json.on == true) {
		statust.innerHTML = "System On";
	}
	else {
		statust.innerHTML = "System Off";
	}
	zone1s.value = json.volume[0];
	zone2s.value = json.volume[1];
	zone3s.value = json.volume[2];
	zone4s.value = json.volume[3];
	zone5s.value = json.volume[4];
	zone6s.value = json.volume[5];
	switch (json.input[0]) {
		case 1:
		zone1.innerHTML = 'ON';
		break;
		case 0:
		zone1.innerHTML = 'OFF';
		break;
		default:
		zone1.innerHTML = 'ALT Input';
	}
	if (json.mute[0] == 1) {
		zone1.innerHTML = zone1.innerHTML + ' MUTE';
	}
	switch (json.input[1]) {
		case 1:
		zone2.innerHTML = 'ON';
		break;
		case 0:
		zone2.innerHTML = 'OFF';
		break;
		default:
		zone2.innerHTML = 'ALT Input';
	}
	if (json.mute[1] == 1) {
		zone2.innerHTML = zone2.innerHTML + ' MUTE';
	}
	switch (json.input[2]) {
		case 1:
		zone3.innerHTML = 'ON';
		break;
		case 0:
		zone3.innerHTML = 'OFF';
		break;
		default:
		zone3.innerHTML = 'ALT Input';
	}
	if (json.mute[2] == 1) {
		zone3.innerHTML = zone3.innerHTML + ' MUTE';
	}
	switch (json.input[3]) {
		case 1:
		zone4.innerHTML = 'ON';
		break;
		case 0:
		zone4.innerHTML = 'OFF';
		break;
		default:
		zone4.innerHTML = 'ALT Input';
	}
	if (json.mute[3] == 1) {
		zone4.innerHTML = zone4.innerHTML + ' MUTE';
	}
	switch (json.input[4]) {
		case 1:
		zone5.innerHTML = 'ON';
		break;
		case 0:
		zone5.innerHTML = 'OFF';
		break;
		default:
		zone5.innerHTML = 'ALT Input';
	}
	if (json.mute[4] == 1) {
		zone5.innerHTML = zone5.innerHTML + ' MUTE';
	}
	switch (json.input[5]) {
		case 1:
		zone6.innerHTML = 'ON';
		break;
		case 0:
		zone6.innerHTML = 'OFF';
		break;
		default:
		zone6.innerHTML = 'ALT Input';
	}
	if (json.mute[5] == 1) {
		zone6.innerHTML = zone6.innerHTML + ' MUTE';
	}
};

function clickFun(command,channel){
	if (connection.readyState == 1) {
		connection.send(command + ':' + channel);
	}
	else {
		console.log('Got Click, connection not ready');
		statust.innerHTML = 'Connection not ready';
	}
};
