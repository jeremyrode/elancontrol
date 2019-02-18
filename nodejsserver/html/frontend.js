	
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
	connection = new WebSocket('ws://192.168.1.157:1338');
	connection.onopen = function(evt) { onOpen(evt); };
	connection.onerror = function(evt) { onError(evt); };
	connection.onmessage = function(evt) { onMessage(evt); };
	if (checkStatus == 0) {
		checkStatus = setInterval(checkTimeout, 3000);
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
};
  
function onError(evt) {
	content.html($('<p>', {
		text: 'Sorry, but there\'s some problem with your connection or the server is down.'
	}));
};
  
function onMessage(message) {
	statust.innerHTML = "Message!";
	try {
		var json = JSON.parse(message.data);
	} catch (e) {
		console.log('Invalid JSON: ', message.data);
		statust.innerHTML = "Invalid Message";
		return;
	}
	//console.log(json.volume[0]);
	zone1s.value = json.volume[0];
	zone2s.value = json.volume[1];
	zone3s.value = json.volume[2];
	zone4s.value = json.volume[3];
	zone5s.value = json.volume[4];
	zone6s.value = json.volume[5];
};
 
function clickFun(channel,command){
	if (connection.readyState == 1) {
		connection.send(channel + ':' + command);
		statust.innerHTML = "Sent";
	}
	else {
		console.log('Got Click, connection not ready');
		statust.innerHTML = 'Got Click, connection not ready';
		start();
	}
};
