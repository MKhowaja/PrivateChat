var express = require('express'),
	app=express();

var port=process.env.PORT || 5000;

var socketio = require('socket.io').listen(app.listen(port));

require('./config')(app, socketio);
require('./routes')(app, socketio);

console.log ("Running at " + port);
