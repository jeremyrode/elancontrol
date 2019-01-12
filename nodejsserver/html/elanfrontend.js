
$(function () {
  "use strict";
  // for better performance - to avoid searching in DOM
  var status = $('#status');
  
  // if user is running mozilla then use it's built-in WebSocket
  window.WebSocket = window.WebSocket || window.MozWebSocket;
  // if browser doesn't support WebSocket, just show
  // some notification and exit
  if (!window.WebSocket) {
    content.html($('<p>',
      { text:'Sorry, but your browser doesn\'t support WebSocket.'}
    ));
    return;
  }


  // open connection
  var connection = new WebSocket('ws://172.16.17.204:1338');
  connection.onopen = function () {
    status.text('Ready');
  };
  connection.onerror = function (error) {
    // just in there were some problems with connection...
    content.html($('<p>', {
      text: 'Sorry, but there\'s some problem with your '
         + 'connection or the server is down.'
    }));
  };
  // most important part - incoming messages
  connection.onmessage = function (message) {
      console.log('Got a message:', message);
  };
  //$(document).on('click', '.commandbutton', clickFun);


  /**
   * This method is optional. If the server wasn't able to
   * respond to the in 3 seconds then show some error message 
   * to notify the user that something is wrong.
   */
  setInterval(function() {
    if (connection.readyState !== 1) {
      status.text('Error');
      console.log('Connection Error');
    }
  }, 3000);
});

  function clickFun(event){
	  //if (connection.readyState == 1) {
		  //connection.send('GotClick');
		  //status.text('Got Click');
	      console.log('Got Click');
	 // }
	 // else {
	//	  console.log('Got Click, connection not ready');
		  //status.text('Connection Error');
	 // }
  };
