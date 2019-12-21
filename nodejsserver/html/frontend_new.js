$('.vol-slider').slider({
	disabled: true,
	min: 0,
	max: 48,
	value: 0,
	range: "min",
	slide: function(event, ui) {
	command = $(this).data('command');
	if (ui.value > lastVol[i]) {
		console.log('volume up to '+ ui.value);
		clickFun(4, command);
	} else {
		console.log('volume down to '+ ui.value);
		clickFun(36, command);
	}
}
});

$('.power').attr( "disabled", true );

$('.power').each(function(i){
	$(this).attr( "disabled", true );;
	$(this).on('click', function(){ //This is the power button click function
		clickFun(0,6);
	});
});

var connection;
var checkStatus = 0;
var statust = $("#statusspan");
var statusDiv = $('.status');

statust.html('PreOpen');
// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;
if (window.WebSocket === undefined) {
	$('body').html("Sorry, but your browser doesn\'t support WebSocket.");
	exit;
}
else {
	window.addEventListener("load", start, false);
	statust.html('Listener Added');
}

function start() {
	statust.html('Connecting');
	connection = new WebSocket('ws://192.168.1.157:1338');
	connection.onopen = function(evt) { onOpen(evt); };
	connection.onerror = function(evt) { onError(evt); };
	connection.onmessage = function(evt) { onMessage(evt); };
	if (checkStatus === 0) {
		checkStatus = setInterval(checkTimeout, 3000);
	}
}


function checkTimeout() {
	if (connection.readyState !== 1) {
		statust.html('Connection Timeout');
		console.log('Connection Timeout');
		start();
		console.log('Restarted');
		statusDiv.removeClass('error'); //New
	}
}

function onOpen(evt) {
	statust.html('Connected');
	statusDiv.removeClass('error').addClass('success');
}

function onError(evt) {
	statust.html('Connection Error');
	statusDiv.removeClass('success').addClass('error');
}

function onMessage(message) {
	// var jsonTest = {
	//     "on": true,
	//     "input" : [0, 1, 0, 1, 0, 0],
	//     "volume" : [40, 10, 30, 30, 0, 20]
	// };
	try {
		var json = JSON.parse(message.data);
	} catch (e) {
		console.log('Invalid JSON: ', message.data);
		statust.html('Invalid Message');
		statusDiv.removeClass('success').addClass('error');
		return;
	}
	if (json.on === true) {
		statust.html('System On');
		statusDiv.removeClass('error').addClass('success'); //new
		var lastVol = [];
		$('.vol-slider').each(function(i) { //If we're on enable sliders show vol
			$(this).slider({
				disabled: false,
				value: json.volume[i],
			});
		});
		$('.power').each(function(i){
			$(this).attr( "disabled", false );
			(json.input[i] === 1) ? $(this).addClass('on') : $(this).addClass('off');
		});

		// $('.mute').each(function(i){
		//     if (json.mute[i] === 1) $(this).addClass('mute');
		// });
	}
	else {
		statust.html('System Off');
		statusDiv.removeClass('success').addClass('error');
	}

}

function clickFun(channel,command){
	if (connection.readyState === 1) {
		connection.send(channel + ':' + command);
	}
	else {
		console.log('Got Click, connection not ready');
		statust.html('Connection not ready');
	}
}
