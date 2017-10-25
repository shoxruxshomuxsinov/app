import * as dbFunctions  from './dbFunctions';



export class UserArr{
  constructor(){
    this.users = [];
  }

  addUserToArr(req){
    this.users.push(req.session.username);
  }

  deleteUserFromArr(users, req){
    for(let i = 0; i < users.lenth; i++){
      if(users[i] == req.session.username){
        users.splice(i, 1);
      }
    }
  }
}

export function sendDataToChat(message, clients){
  message = JSON.stringify(message);
  for(let a in clients){
    if(clients[a]){
      clients[a].send(message);
    }
  }
}

export function deleteUserFromWS(clients, req){
  delete clients[req.session.username];
}

export function sendHistoryToUsers(result, clients, req){
  for (let i in result){
    let msg = {'username': result[i].username, 'mes': result[i].message, 'time': result[i].time, 'typing': "history"};
    msg = JSON.stringify(msg);
    clients[req.session.username].send(msg);
  }
}


export async function wsSendMessToClients(message, req, users, clients){
  if(message == "Open"){
    try{
      let result = await dbFunctions.getMessageFromHistory();
      sendHistoryToUsers(result, clients, req);
      let msg = {'online-users': users.users};
      sendDataToChat(msg, clients);
    } catch(ex){
        console.log(ex);
    }
  } else if(message == "typing"){
      let msg = {'username': req.session.username, 'mes': message, 'typing': true};
      sendDataToChat(msg, clients);

  } else if(message == "clear"){
      let msg = {'username': req.session.username, 'mes': message, 'typing': false};
      sendDataToChat(msg, clients);

  } else {
      let msg = {'username': req.session.username, 'mes': message, 'typing': false};
      if(message != "clear" && message != "Open" && message != "" && message != " "){
        try{
          await dbFunctions.addMessageToDB(req, message);
        } catch(ex){
          console.log(ex);
        }
      }
      sendDataToChat(msg, clients);
  }

}
