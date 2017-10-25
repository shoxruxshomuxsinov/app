import express from 'express';
import WebSocket from 'ws';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import * as config from '../config';
import User from '../myModule/user';


const pgp = require("pg-promise")(/*options*/);
const upload = multer();
const app = express();
const db = pgp('postgres://ruslan:qwerty123$@' + config.dbserver.host + ':' + config.dbserver.port + '/' + config.dbserver.dbname);


app.use('/static', express.static(path.join(__dirname, '/../public')));
let date = new Date();

export async function showAllUsers(){
  try {
    let users = await db.many('SELECT * FROM users');
    return users;
  }
  catch(e) {
    console.log(e);
    throw new Error('Show users error: ' + e);
  }
}

export async function checkUser(login){
  try{
    let userPassword = await db.one("select password from users where login='" + login + "'");
    return userPassword;
  }catch(ex){
    console.log(ex);
    throw new Error("Error authUser " + ex);
  }

}

export async function addUser (user) {
   await db.any("insert into users (login, password, regdate) values  ('" + user.login + "'" + "," + "'" + user.password + "'" + "," + "'" + user.regdate + "'" + ")")
  .then((date) => {
    console.log("ok");
  }).catch((err) => {
    console.log(err);
  });
}
export async function addMessageToDB(req, message){
  await db.any("insert into chathistory (message, time, username) values ('" + message + "'" + "," + "'" +  date.getHours() + ":" + date.getMinutes() + "'" + "," + "'" + req.session.username + "'" + ")")
  .then((date) => {
    console.log("ok");
  }).catch((err) => {
    console.log(err);
  });
}

export async function getMessageFromHistory(){
  try{
    let result = await db.any("select * from chathistory");
    return result;
  } catch(ex){
    console.log(ex);
  }
}

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

export async function authUser(req, res){
  let login = req.body.login;
  try{
    let result = await checkUser(login);
    if(result.password == req.body.password){
      req.session.username = req.body.login;
      req.session.isAuthorized = true;
      res.sendFile(path.join(__dirname + '/../public/chat.html'));
    } else{
        res.sendFile(path.join(__dirname + '/../public/auth.html'));
    }
  } catch(ex){
      console.log(ex);
      res.send(ex);
  }
}
