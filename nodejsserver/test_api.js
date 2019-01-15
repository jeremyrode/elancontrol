const addon = require('./build/Release/send_zpad_command_napi');
const channel = 5;
const command = 2;
console.log(addon.my_function(command,channel));
