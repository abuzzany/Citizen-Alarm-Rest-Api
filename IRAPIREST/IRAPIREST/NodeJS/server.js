var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('connected: ' + socket.id);

  //////////////////////////Listeners//////////////////////////
  socket.on('onJoin', function(data){
      console.log('onJoin: ' + data.userId);
      console.log(data.userId + ' latitude: ' + data.latitude);
      console.log(data.userId + ' longitude: ' + data.longitude);
  
      //Create client object
      var client ={
        userId:data.userId,
        socketId:socket.id,
        latitude:data.latitude,
        longitude:data.longitude
      };

      //Add client to client's list
      clients.push(client);
  });

  socket.on('onAlert', function(data){
      console.log("onAlert");
      console.log('socketId: ' + socket.id);
      console.log('alertTypeId: ' + data.alertTypeId);
      console.log('latitude: ' + data.latitude);
      console.log('longitude: ' + data.longitude);

      //Send alert to clients arround 1 km
      for (var i = 0; i< clients.length; i++) { 
        var client = clients[i];

        var dsitance = distanceBetweenTwoPoints(data.latitude, data.longitude, client.latitude, client.longitude);

        //Verify if client is arround 1 km
        if(dsitance <= 1)
            io.sockets.connected[clients[i].socketId].emit('onAlert', data);
      }
  });

  socket.on('onGetUsersConnected', function (data) {
      console.log("onGetUsersConnected");
  });

  socket.on('disconnect', function(){
    console.log('client disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

///////////////////Methods///////////////////////////
function distanceBetweenTwoPoints(lat1, lon1, lat2, lon2) {
    //R = earth's radius (mean radius = 6,371km)  
    var R = 6371;
    var dLat = (lat2-lat1)*Math.PI/180;  
    var dLon = (lon2-lon1)*Math.PI/180;   
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +  
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *   
            Math.sin(dLon/2) * Math.sin(dLon/2);   
    var c = 2 * Math.asin(Math.sqrt(a));   
    var d = R * c; 

    return d;
}