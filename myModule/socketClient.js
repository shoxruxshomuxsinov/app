export default class SocketClients {
  constructor(){
    this.socketClients = {};
  }

  addClient(client, ws){
    this.socketClients[client] = ws;
  }

  removeClient(client){
    delete this.socketClients[client];
  }

  // toArray(){
  // }

}
