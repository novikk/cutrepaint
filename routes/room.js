var rooms = {};
var users = {};
var debug = true;

function log(str) {
	if (debug) console.log(str);
}

exports.new = function(req, res) {
	// create a new room
	var room_number = Math.floor((Math.random()*100000000)+100000000);
	rooms[room_number] = {
		users: [],
		actions: []
	};

	log("Created room with number " + room_number);
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
	// add a new user to the system, save his room, his socket and his current action
	users[user] = {
		room: room,
		socket: socket,
		action: undefined
	}

	// add this user to the room
	rooms[room].users.push(user);

	log("User " + user + " has joined room " + room);
}

exports.send_to_others = function(user, data) {
	// send a packet to everyone in a room except user
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

	// if user has started an action
	if (users[user].action != undefined) {
		rooms[room].actions.push(users[user].action);
		delete users[user].action;
	}
}

exports.get_data = function(user) {
	var room = users[user].room;
	var sck = users[user].socket;

	sck.emit('CURRENT', {actions: rooms[room].actions});
}

exports.remove_user = function(user) {
	var room = users[user].room;
	log("User left room " + room);
	delete users[user];

	var index = rooms[room].users.indexOf(user);
	if (index > -1) rooms[room].users.splice(index, 1);
	if (rooms[room].users.length == 0) delete rooms[room];

	if (rooms[room] != undefined)
		log("Users in room " + room + ": " + rooms[room].users.length);
	else
		log("Room " + room + " is now empty");
	
}