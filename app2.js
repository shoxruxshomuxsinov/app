import express from 'express';
import WebSocket from 'ws';
import bodyParser from 'body-parser';
import multer from 'multer';
import * as config from './config';
import * as myModule from './myModule';
import User from './myModule/user';
import * as dbFunctions from './myModule/dbFunctions';

const pgp = require("pg-promise")(/*options*/);
// const db = pgp('postgres://ruslan:qwerty123$@' + config.dbserver.host + ':' + config.dbserver.port + '/' + config.dbserver.dbname);
const upload = multer();
const app = express();

// parse application/jsonssssss
app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }));


let db = [];
app.use(express.cookieParser());

app.use(express.session({
  secret: "SecretSecret";
  key: "sid";
  cookie: {
    "path":"/",
    "httpOnly": true,
    "maxAge": null
  }
}));
app.use((req, res, next) => {
  if(req.url == '/'){
    res.send('hello2');
  } else if(req.url == '/hello'){
    res.send("hello3");
  } else {
    next();
  }

});
app.use('/regUser', (req, res, next) => {
  if(req.body){
    console.log(req.body);
    let user = new User(req.body.login, req.body.password, "2017-10-11");
    db.push(user);
    console.log(db);
  } else {
    next();
  }
});

app.use('/showUsers', async(req, res, next) => {
  try {
    var users = await dbFunctions.showAllUsers();
    res.send(users);
    res.render('index.jade');
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

app.use('/authUser', async(req, res, next) => {
  try {
    if(req.body){
      let found = false;
      for(let i = 0; i < db.length; i++){
        if(req.body.login == db[i].login && req.body.password == db[i].password){
          found = true;
        }
      }
      if(found){

      }
    }
  } catch (ex) {
    console.log(ex);
  }
})




app.use((err, req, res, next) => {
  res.send(err);
})

// app.get('/', (req, res) => {
//   res.render('index.jade');
// })

app.listen(config.server.port, () => {
  console.log('server is started on port ' + config.server.port);
});
