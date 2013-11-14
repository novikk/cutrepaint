var rooms = {};
var users = {};

exports.new = function(req, res) {
	var room_number = Math.floor((Math.random()*100000000)+100000000);
	rooms[room_number] = {
		users: [],
		actions: []
	};
	res.redirect('/' + room_number);
}

exports.view = function(req, res) {
	var id = req.params.id[0];
	if (rooms[id] === undefined) res.send('Room not found');
	else {
		res.render('paint');
	}
}

exports.add_to_room = function(user, room, socket) {
	users[user] = {
		room: room,
		socket: socket,
		action: undefined
	}
	rooms[room].users.push(user);
}

exports.send_to_others = function(user, data) {
	var room = users[user].room;

	for (var i = 0; i < rooms[room].users.length; ++i) {
		var usr = rooms[room].users[i];

		if (usr != user) {
			var sck = users[usr].socket;

			sck.emit('P', data);
		}
	}
}

exports.paint = function(user, data) {
	users[user].action.points.push(data.w);
	users[user].action.points.push(data.h);
}

exports.start_action = function(user, data) {
	if (users[user].action == undefined) {
		users[user].action = {points: [data.x, data.y]};
	}
}

exports.end_action = function(user) {
	var room = users[user].room;

	rooms[room].actions.push(users[user].action);
	delete users[user].action;
}

exports.get_data = function(user) {
	var room = users[user].room;
	var sck = users[user].socket;

	sck.emit('CURRENT', {actions: rooms[room].actions});
}

exports.remove_user = function(user) {
	var room = users[user].room;
	delete users[user];

	var index = rooms[room].users.indexOf(user);
	if (index > -1) rooms[room].users.splice(index);
	if (rooms[room].users.length == 0) delete rooms[room];

	console.log("Users in room: " + rooms[room]);
}