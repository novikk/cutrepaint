var canvas, ctx;
var lx = -1, ly = -1;
var clicked = false;
var socket;
var room_id;

(function() {
    room_id = document.URL.split('/');
    room_id = room_id[room_id.length-1];

    cutreSocket();

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', function(e) {
        socket.emit("START", {
            x: e.pageX,
            y: e.pageY
        });
        clicked = true;
    }, false);

    canvas.addEventListener('mouseup', function() {
        socket.emit("END");
        clicked = false;
    }, false);

    canvas.addEventListener('mousemove', mmove, false);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})();

function cutreSocket() {
    socket = io.connect('http://localhost');

    socket.on('connect', function() {
        socket.emit('ROOM', { room: room_id });
        socket.emit('CURRENT');
    });

    socket.on('disconnect', function() {
        window.location='/?server_restart';
    });

    socket.on('P', function (data) {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.lineTo(data.w, data.h);
        ctx.stroke();
        //socket.emit('my other event', { my: 'data' });
    });

    socket.on('CURRENT', function(data) {
        var actions = data.actions;
        for (var i = 0; i < actions.length; ++i) {
            var pts = actions[i].points;
            ctx.beginPath();
            ctx.moveTo(pts[0], pts[1]);
            for (var j = 2; j < pts.length; j+=2) {
                ctx.lineTo(pts[j], pts[j+1]);
            }
            ctx.stroke();
        }
    });
}

function mmove(e) {
    if (clicked) {
        if (lx != -1 && ly != -1) {
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(e.pageX, e.pageY);
            ctx.stroke();

            if (socket) {
                socket.emit('P', {
                    x: lx,
                    y: ly,
                    w: e.pageX,
                    h: e.pageY
                })
            }
        }
    }

    lx = e.pageX;
    ly = e.pageY;
}