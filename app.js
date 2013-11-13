
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var room = require('./routes/room');
var http = require('http');
var path = require('path');

var app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server, { log: false });

io.configure(function () { 
	io.set("transports", ["xhr-polling"]); 
	io.set("polling duration", 10); 
});


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.param(function(name, fn){
  if (fn instanceof RegExp) {
    return function(req, res, next, val){
      var captures;
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures;
        next();
      } else {
        next('route');
      }
    }
  }
});

server.listen(app.get('port'));

app.param('id', /^[0-9]{9}$/);

app.get('/', routes.index);
app.get('/new', room.new);
app.get('/:id', room.view);

io.sockets.on('connection', function (socket) {
	var id = socket.id;
	socket.on('ROOM', function(data) {
		room.add_to_room(id, data.room, socket);
	});

	socket.on('P', function (data) {
		room.send_to_others(id, data);
	});
});