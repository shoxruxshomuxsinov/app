import express     from 'express';
import WebSocket   from 'ws';
import bodyParser  from 'body-parser';
import multer      from 'multer';
import path        from 'path';
import * as config from '../config';
import User        from '../myModule/user';


const pgp    = require("pg-promise")(/*options*/);
const upload = multer();
const app    = express();
const db     = pgp('postgres://ruslan:qwerty123$@' + config.dbserver.host + ':' + config.dbserver.port + '/' + config.dbserver.dbname);



app.use('/static', express.static(path.join(__dirname, '/../public')));
let date = new Date();


//регистрация пользователя
export async function regUser(req, res){
  if(req.body.login != "" && req.body.password != ""){
      let user = new User(req.body.login, req.body.password, new Date().getFullYear() + "-" + new Date().getMonth() + "-" + new Date().getDate());

    try {
      let result = await addUser(user);
      res.sendFile(path.join(__dirname + '/../public/auth.html'));

    }catch(ex){
       console.log(ex);
       res.send(ex);
    }
  } else {
    res.send("Zapolnite vse polya");
  }
}

// вспомогательная функция для regUser
export async function addUser (user) {
   await db.any("insert into users (login, password, regdate) values  ('" + user.login + "','" + user.password + "','" + user.regdate + "')")
  .then((date) => {
    console.log("ok");
  }).catch((err) => {
    console.log(err);
  });
}

//авторизация пользователя
export async function authUser(req, res){
  let login = req.body.login;

  try{
    let result = await checkUser(login);

    if(result.password == req.body.password){
      req.session.username = req.body.login;

      req.session.isAuthorized = true;
      res.sendFile(path.join(__dirname + '/../public/test.html'));

    } else{
        res.sendFile(path.join(__dirname + '/../public/auth.html'));
    }
  } catch(ex){
      console.log(ex);
      res.send(ex);
  }
}

// вспомогательная функция для authUser
export async function checkUser(login){
  try{
    let userPassword = await db.one("select password from users where login='" + login + "'");
    return userPassword;

  } catch(ex){
    console.log(ex);
    throw new Error("Error authUser " + ex);
  }
}

//добавлять сообщения в базу данных
export async function addMessageToHistory(message){
  await db.any("insert into chat (username, message, date, gr) values ('" + message.username + "','" + message.mes + "','" +  message.date + "','"  + message.gr + "')")
  .then((date) => {
    console.log("ok");
  }).catch((err) => {
    console.log(err);
  });
}

//получать сообщения из истории
export async function getMessageFromHistory(group){
  try{
    let result = await db.any("select * from chat where gr='" + group + "'");
    return result;

  } catch(ex){
    console.log(ex);
  }
}

//отправить данные на чат
export function sendDataToChat(rooms, data, req){
    for(let i in rooms[req.session.group].members){
      rooms[req.session.group].members[i].send(data);
    }
}

//переключиться в другую группу
export function switchGroup(message, rooms, req){
    if(!rooms[message.gr].members[req.session.username]){

      rooms[message.gr].members[req.session.username] = rooms[req.session.group].members[req.session.username];
      delete rooms[req.session.group].members[req.session.username];

      req.session.group = message.gr;

      let online = getOnlineUsers(rooms, req);
      sendDataToChat(rooms, online, req);

      let msg = JSON.stringify({"username":req.session.username, "event":"switchGroup", "gr": message.gr});
      rooms[message.gr].members[req.session.username].send(msg);
    }
}

//отправить историю переписок на пользователя
export function sendHistoryToUser(result, rooms, req){
    if(result.length > 0){
      let msg = JSON.stringify({"event": "sendHistory", "mes": result, "gr": req.session.group});
      rooms[req.session.group].members[req.session.username].send(msg);

    } else{
        let m = JSON.stringify({"event": "switchGroup", "gr":req.session.group});
        rooms[req.session.group].members[req.session.username].send(m);
    }
}

//добавить пользователя в группу
export function addToPrivateGroup(message, rooms, req){
    let foundGroup = checkGroup(rooms, req);

    if(foundGroup == false && message.who != req.session.username){
      let roomname = req.session.username;
      rooms[roomname] = {"members":{}};

      let msg = {"event": "newGroup", "gr": roomname};
      msg = JSON.stringify(msg);

      rooms[req.session.group].members[message.who].send(msg);
      rooms[req.session.group].members[roomname].send(msg);
    }
}

//проверка на существование группы
export function checkGroup(rooms, req){
  let found = false;

  for(let i in rooms){
    if(rooms[i] == req.session.username){
      found == true;
    }
  }
  return found;
}

//достать список пользователей
export function getOnlineUsers(rooms, req){

  let onlineUsers = Object.keys(rooms[req.session.group].members);
  let online = JSON.stringify({"onlineUsers": onlineUsers});

  return online;
}
