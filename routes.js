module.exports = function(app, socketio){
	app.get('/', function(req, res){
		res.render('home');
	});
	app.get('/create', function(req,res){
		var id = Math.round((Math.random() * 10000000)); //random room id
		res.redirect('/chat/'+id);
	});
	app.get('/chat/:id', function(req,res){
		res.render('chat');
	});
	var socketChat = socketio.of('/socket').on('connection', function (socket) {
		
		socket.on('load',function(data){

			var room = findClientsSocket(socketio,data,'/socket');
			socket.emit('peopleinchat', {number: room.length});
		});
		socket.on('login', function(data) {

			var room = findClientsSocket(io, data.id, '/socket');
			if (room.length < 2) {
				socket.username = data.user;
				socket.room = data.id;
				socket.join(data.id);

				if (room.length == 1) {
					var usernames = []
					usernames.push(room[0].username);
					usernames.push(socket.username);
					
					chat.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
					});
				}
			}
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});

		socket.on('disconnect', function() {
			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
			});
			// leave the room
			socket.leave(socket.room);
		});

		socket.on('msg', function(data){
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user});
		});
	});
};

function findClientsSocket(socketio,roomId, namespace) {
	var res = [],
		namespace = socketio.of(namespace ||"/");
	if (namespace) {
		for (var id in namespace.connected) {
			if(roomId) {
				var index = namespace.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(namespace.connected[id]);
				}
			}
			else {
				res.push(namespace.connected[id]);
			}
		}
	}
	return res;
}
