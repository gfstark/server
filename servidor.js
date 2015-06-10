var PORT = process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT  || 8080;
var IPADDRESS = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
  
  var io = require('socket.io').listen(8000);

   var players = {}, count = 0;

io.sockets.on('connection',
    function (socket)
    {   
        var id = count++; //assign number
        var player = players[id] = new Player(id, 10, 10, 1); //create new      player
    player.socket = socket;


    socket.on('chat',
        function (data)
        {
            var message = player.name + ': ' + data.message;
            socket.emit('chat', { message: message});
            socket.broadcast.emit('chat', { message: message});
        });

    socket.on('position',
        function (data)
        {
            player.x = data.playerX;
            player.y = data.playerY;
            player.z = data.z;


            socket.emit('position', {pid : player.id, playerX : player.x, playerY : player.y, z : player.z});
            socket.broadcast.emit('position', {pid : player.id, playerX : player.x, playerY : player.y, z : player.z});
        }); 

    socket.on('register',
        function (name)
        {
            player.name = name;
            player.registered = true;
            socket.emit('chat', { message : "Server: bem vindo ao server " + player.name + '!'});
            socket.broadcast.emit('chat', { message : "Server: bem vindo ao server " + player.name + '!'});

            for(var p in players)
            {
                //send initial update
                if(!players[p].disconnected)
                { 
                    socket.emit('addPlayer', {pid: players[p].id, x: players[p].x, y: players[p].y, name: players[p].name, sessionid: socket.id});
                    if(players[p].id != player.id)
                        players[p].socket.emit('addPlayer', {pid: player.id, x: player.x, y: player.y, name: player.name})
                }
            }

        });

    socket.on('disconnect',
        function (socket)
        {
            player.disconnected = true;
            delete players[player.id];
            player = null;
        });

});



 function Player(id, x, y, z) {
    this.id = id;
   this.x = x;
   this.y = y;
   this.z = z;
    this.name = "";
    this.disconnected = false;
    this.registered = false;
    this.socket = null;
 }
