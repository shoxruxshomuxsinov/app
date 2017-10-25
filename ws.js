var WebSocketServer = new require('ws');
// подключенные клиенты
var clients = {};



// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({
  port: 8081
});
webSocketServer.on('connection', function(ws) {

  var id = Math.random();
  clients[id] = ws;
  console.log("novoe soedinenie");
  console.log(id + " online");

  ws.on('message', function(message) {
    console.log('polucheno soobshenie ot ' + id + message);
    console.log(message);

    for (var a in clients) {
      clients[a].send(message);
    }
  });

  ws.on('close', function() {
    console.log('soedinenie zakryto ' + id);
    delete clients[id];
  });

});
