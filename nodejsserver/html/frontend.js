	
statust = document.getElementById("statusspan");
var connection;
statust.innerHTML = "Jer";
// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;
if (window.WebSocket === undefined) {
	content.html($('<p>',{ text:'Sorry, but your browser doesn\'t support WebSocket.'}));
	exit;
	}
else {
  window.addEventListener("load", onLoad, false);
}
   
function onLoad() {
	statust.innerHTML = "Connecting";
	connection = new WebSocket('ws://192.168.1.157:1338');
	connection.onopen = function(evt) { onOpen(evt) };
	connection.onerror = function(evt) { onError(evt) };
	connection.onmessage = function(evt) { onError(evt) };
	setInterval(function() {
    if (connection.readyState !== 1) {
      statust.innerHTML = "Connection Timeout";
      console.log('Connection Timeout');
    }
  }, 3000);
};
  
  function onOpen(evt) {
    statust.innerHTML = "Connected";
  };
  
  function onError(evt) {
    content.html($('<p>', {
      text: 'Sorry, but there\'s some problem with your connection or the server is down.'
    }));
  };
  
  function onMessage(evt) {
      console.log('Got a message:', message);
  };
 
  function clickFun(channel,command){
	  if (connection.readyState == 1) {
		  connection.send(channel + ':' + command);
		  statust.innerHTML = "Sent";
	      console.log('Got Click');
	  }
	  else {
		  console.log('Got Click, connection not ready');
		  statust.innerHTML = "Connection Error";
	  }
  };
