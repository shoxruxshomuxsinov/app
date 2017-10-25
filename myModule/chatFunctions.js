export function sendDataToChat(message, clients){
  message = JSON.stringify(message);
  for(let a in clients){
    if(clients[a]){
      clients[a].send(message);
    }
  }
}
