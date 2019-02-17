const SerialPort = require('serialport')
//const ByteLength = require('@serialport/parser-byte-length')
const Delimiter = require('@serialport/parser-delimiter')

const old_data = Buffer.alloc(35); //38 for delim

function parseVolume(data) {
	var volumes =[0,0,0,0,0,0];
	for (i = 1; i <= 6; i++) {
		volumes[i-1] = 48 - (data[i*6-4] & 0b00111111);
	}
	//console.log(data[2].toString(2));
	console.log(volumes);
}

function onDiffData(sdata) {
	if (old_data.compare(sdata) != 0) {
		//console.log(sdata);
		parseVolume(sdata);
		sdata.copy(old_data);
	}
}


const port = new SerialPort('/dev/ttyAMA0', {
  baudRate: 19200
})

const parser = port.pipe(new Delimiter({delimiter: new Buffer('E00081','hex') }));
//const parser = port.pipe(new ByteLength({length: 38}));

parser.on('data', function(data) {onDiffData(data);});



