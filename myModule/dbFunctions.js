import express from 'express';
import WebSocket from 'ws';
import bodyParser from 'body-parser';
import multer from 'multer';
import * as config from '../config';
import User from '../myModule/user';


const pgp = require("pg-promise")(/*options*/);
const upload = multer();
const app = express();
const db = pgp('postgres://ruslan:qwerty123$@' + config.dbserver.host + ':' + config.dbserver.port + '/' + config.dbserver.dbname);

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

export async function authUser(login){
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
