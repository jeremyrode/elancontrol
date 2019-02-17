	
statust = document.getElementById("statusspan");
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
    else {
		console.log('Connection Fine');
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
  
  function onMessage(evt) {
	  statust.innerHTML = "Message!";
      console.log('Got a message:', message);
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
