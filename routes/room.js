var rooms = {};
var users = {};

exports.new = function(req, res) {
	var room_number = Math.floor((Math.random()*100000000)+100000000);
	rooms[room_number] = {
		users: []
	};
	res.redirect('/' + room_number);
}

exports.view = function(req, res) {
	var id = req.params.id[0];
	if (rooms[id] === undefined) res.send('Room not found');
	else {
		console.log(rooms[id]);
		res.render('paint');
	}
}

exports.add_to_room = function(user, room, socket) {
	users[user] = {
		room: room,
		socket: socket
	}
	rooms[room].users.push(user);
}

exports.send_to_others = function(user, data) {
	var room = users[user].room;

	for (var i = 0; i < rooms[room].users.length; ++i) {
		var usr = rooms[room].users[i];

		if (usr != user) {
			var sck = users[usr].socket;
			console.log(sck);
			sck.emit('P', data);
		}
	}
}