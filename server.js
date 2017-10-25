import session          from 'express-session';
import express          from 'express';
import path             from 'path';
import multer           from 'multer';
import logger           from 'morgan';
import cookieParser     from 'cookie-parser';
import bodyParser       from 'body-parser';
import User             from './myModule/user';
import SocketClients    from './myModule/socketClient';
import * as utils       from './myModule/utils';
import * as dbFunctions from './myModule/dbFunctions';
import * as config      from './config';

const pgp    = require("pg-promise")(/*options*/);
const db     = pgp('postgres://dbtest:1234@' + config.dbserver.host + ':' + config.dbserver.port + '/' + config.dbserver.dbname);
const upload = multer();
const app    = express();

let expressWs     = require('express-ws')(app);
let index         = require('./routes/index');
let clients       = {};
let users         = [];

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    conString: "pg://dbtest:1234@" + "localhost" + "/" + "dbtest"
  }),
  secret: "s",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// function sendDataToChat(message, clients){
//   message = JSON.stringify(message);
//   for(let a in clients){
//     if(clients[a]){
//       clients[a].send(message);
//     }
//   }
// }
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.get('/reg', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/reg.html'));
});

app.use('/registratsiya', async(req, res) => {
  let user = new User(req.body.login, req.body.password, "2017-10-18");
  try {
    let result = await dbFunctions.addUser(user);
    res.sendFile(path.join(__dirname + '/public/auth.html'));
  }catch(ex){
     console.log(ex);
     res.send(ex);
  }
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/auth.html'));
});

app.use('/auth', async(req, res) => {
  let login = req.body.login;
  try{
    let result = await dbFunctions.authUser(login);
    if(result.password == req.body.password){
      req.session.username = req.body.login;
      req.session.isAuthorized = true;
      res.sendFile(path.join(__dirname + '/public/chat.html'));
    } else{
        res.sendFile(path.join(__dirname + '/public/auth.html'));
    }
  } catch(ex){
      console.log(ex);
      res.send(ex);
  }
});

app.get('/',(req, res) => {
  res.sendFile(path.join(__dirname + '/public/auth.html'));
});

app.ws('/', async function(ws, req){

  var username = req.session.username;
  clients[username] = ws;

  users.push(req.session.username);
  console.log("novoe soedinenie");

  ws.on('message', async (message) => {

    if(message != "" || message != " "){
      if(message == "Open"){
        try{
          let result = await dbFunctions.getMessageFromHistory();
          for (let i in result){
            let m = {'username': result[i].username, 'mes': result[i].message, 'time': result[i].time, 'typing': "history"};
            m = JSON.stringify(m);
            clients[req.session.username].send(m);
          }

          let msg = {'online-users': users};
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
  });

  ws.on('close', () => {
    for(let i = 0; i < users.length; i++){
      if(users[i] == req.session.username){
        users.splice(i, 1);
      }
    }

    console.log(users);
    delete clients[req.session.username];

    let msg = {'online-users': users};
    sendDataToChat(msg, clients);
  });
});

app.listen(3000, () => {
  console.log("server is started on port 3000");
});
