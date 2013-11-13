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

    canvas.addEventListener('mousedown', function() {
        clicked = true;
    }, false);

    canvas.addEventListener('mouseup', function() {
        clicked = false;
    }, false);

    canvas.addEventListener('mousemove', mmove, false);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})();

function cutreSocket() {
    socket = io.connect('http://cutrepaint.herokuapp.com');

    socket.emit('ROOM', { room: room_id });
    socket.on('P', function (data) {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.lineTo(data.w, data.h);
        ctx.stroke();
        //socket.emit('my other event', { my: 'data' });
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