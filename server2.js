import session           from 'express-session';
import express           from 'express';
import path              from 'path';
import multer            from 'multer';
import logger            from 'morgan';
import cookieParser      from 'cookie-parser';
import bodyParser        from 'body-parser';
import User              from './myModule/user';
import * as dbFunctions  from './myModule/dbAndChatFunctions';
import * as chatFunction from './myModule/chatFunctions';
import * as config       from './config';

const pgp    = require("pg-promise")(/*options*/);
const db     = pgp('postgres://dbtest:1234@' + config.dbserver.host + ':' + config.dbserver.port + '/' + config.dbserver.dbname);
const upload = multer();
const app    = express();

let expressWs = require('express-ws')(app);
let index     = require('./routes/index');


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

let rooms = {};
var group = "publicGroup";
rooms[group] = {"members":{}};

app.get('/',(req, res) => {
  res.sendFile(path.join(__dirname + '/public/auth.html'));
});

app.ws('/', async(ws, req) => {

  rooms.publicGroup.members[req.session.username] = ws;
  req.session.group = group;

  ws.on('message', async (message) => {
    try{

      let date = new Date();
      let time = date.getHours() + ":" + date.getMinutes();
      let msg = JSON.parse(message);

      if(msg.event == "connect"){

          let result = await dbFunctions.getMessageFromHistory(group);
          dbFunctions.sendHistoryToUser(result, rooms, req);

          let online = dbFunctions.getOnlineUsers(rooms, req);
          let msg = JSON.stringify({"event":"connect", "gr":req.session.group});

          rooms[req.session.group].members[req.session.username].send(msg);
          dbFunctions.sendDataToChat(rooms, online, req);

      } else if(msg.event == "typing" || msg.event == "clear"){

            let m = JSON.stringify({"event": msg.event, "username": req.session.username});
            dbFunctions.sendDataToChat(rooms, m, req);

      } else if(msg.event == "sendMsg" && msg.mes != "" && msg.mes != " "){

            let m = {"username":req.session.username, "mes": msg.mes, "date": time, "event":msg.event, "gr":req.session.group};
            dbFunctions.addMessageToHistory(m);

            m = JSON.stringify(m);
            dbFunctions.sendDataToChat(rooms, m, req);

      }else if(msg.event == "addToPrivateGroup"){
            dbFunctions.addToPrivateGroup(msg, rooms, req);

      }else if(msg.event == "switchGroup"){

            dbFunctions.switchGroup(msg, rooms, req);

            let result = await dbFunctions.getMessageFromHistory(req.session.group);
            dbFunctions.sendHistoryToUser(result, rooms, req);
      }
    } catch(ex){
      console.log(ex);
    }
  });

  ws.on('close', () => {

  });
});

app.listen(3000, () => {
  console.log("server is started on port 3000");
});

// -----------------------------------------------------------------------------------------------



//
// switch (ev) {
//  case (ev == "connect"):
//        let result = await dbFunctions.getMessageFromHistory(group);
//        dbFunctions.sendHistoryToUser(result, rooms, req);
//        let online = dbFunctions.getOnlineUsers(rooms, req);
//        let msg = JSON.stringify({"event":"connect", "gr":req.session.group});
//        rooms[req.session.group].members[req.session.username].send(msg);
//        dbFunctions.sendMsgToChat(rooms, online, req);
//
//  break;
//
//  case (ev == "typing" || ev == "clear"):
//      let m1 = JSON.stringify({"event": ev, "username": req.session.username});
//      dbFunctions.sendMsgToChat(rooms, m1, req);
//
//  break;
//
//  case(ev == "sendMsg" && ev!="" &&  ev!=" "):
//      let m2 = {"username":req.session.username, "mes": msg.mes, "date": time, "event":ev, "gr":req.session.group};
//      dbFunctions.addMessageToHistory(m2);
//      m2 = JSON.stringify(m2);
//      dbFunctions.sendMsgToChat(rooms, m2, req);
//
//  break;
//
//  case (ev == "addToPrivateGroup"):
//      dbFunctions.addToPrivateGroup(msg, rooms, req);
//
//  break;
//
//  case (ev == "switchGroup"):
//     dbFunctions.switchGroup(msg, rooms, req);
//     let res = await dbFunctions.getMessageFromHistory(req.session.group);
//     dbFunctions.sendHistoryToUser(res, rooms, req);
//
//  break;
// }
