import session           from 'express-session';
import express           from 'express';
import path              from 'path';
import multer            from 'multer';
import logger            from 'morgan';
import cookieParser      from 'cookie-parser';
import bodyParser        from 'body-parser';
import User              from './myModule/user';
import * as dbFunctions  from './myModule/dbFunctions';
import * as chatFunction from './myModule/chatFunctions';
import * as config       from './config';

const pgp    = require("pg-promise")(/*options*/);
const db     = pgp('postgres://dbtest:1234@' + config.dbserver.host + ':' + config.dbserver.port + '/' + config.dbserver.dbname);
const upload = multer();
const app    = express();

let expressWs = require('express-ws')(app);
let index     = require('./routes/index');
let clients   = {};
// let users     = [];
let users = new chatFunction.UserArr();

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

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/reg', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/reg.html'));
});

app.use('/registratsiya', async(req, res) => {
  try{
    await dbFunctions.regUser(req, res);
  }catch(ex){
    console.log(ex);
  }
});

app.get('/auth', async(req, res) => {
  res.sendFile(path.join(__dirname + '/public/auth.html'));
});

app.use('/auth', async(req, res) => {
  try{
    await dbFunctions.authUser(req, res);
  } catch(ex){
    console.log(ex);
  }
});

app.get('/',(req, res) => {
  res.sendFile(path.join(__dirname + '/public/auth.html'));
});

app.ws('/', async(ws, req) => {

  var username = req.session.username;
  clients[username] = ws;

  users.addUserToArr(req);
  console.log("novoe soedinenie");

  ws.on('message', async (message) => {
    if(message != "" || message != " "){
      chatFunction.wsSendMessToClients(message, req, users, clients);
    }
  });

  ws.on('close', () => {
    users.deleteUserFromArr(users, req);

    chatFunction.deleteUserFromWS(clients, req);

    let msg = {'online-users': users};
    chatFunction.sendDataToChat(msg, clients);
  });
});

app.listen(3000, () => {
  console.log("server is started on port 3000");
});
