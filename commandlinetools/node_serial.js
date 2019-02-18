const SerialPort = require('serialport');
const Delimiter = require('@serialport/parser-delimiter');

const old_data = Buffer.alloc(35); //38 for delim

function parseVolume(data) {
	var volume =[0,0,0,0,0,0];
	for (i = 0; i < 6; i++) {
		volume[i] = 48 - data[i*6+2] & 0b00111111;
	}	
	return volume;
}

function parseMute(data) {
	var mute =[0,0,0,0,0,0];
	for (i = 0; i < 6; i++) {
		mute[i] = (data[i*6] & 0b00010000) >>> 4;
	}	
	return mute;
}

function parseInput(data) {
	var input =[0,0,0,0,0,0];
	for (i = 0; i < 6; i++) {
		input[i] = data[i*6] & 0b00000111;
	}	
	return input;
}

function onDiffData(sdata) {
	if (old_data.compare(sdata) != 0) {
		//console.log(sdata);
		console.log('Volumes ' + parseVolume(sdata));
		console.log('Mute Status ' + parseMute(sdata));
		console.log('Input Selections ' + parseInput(sdata));
		sdata.copy(old_data);
	}
}


const port = new SerialPort('/dev/ttyAMA0', {
  baudRate: 19200
})

const parser = port.pipe(new Delimiter({delimiter: new Buffer('E00081','hex') }));
//const parser = port.pipe(new ByteLength({length: 38}));

parser.on('data', function(data) {onDiffData(data);});



