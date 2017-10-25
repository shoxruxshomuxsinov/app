import http from 'http';
import url from 'url';
import * as utils from './myModule/utils';


http.createServer(reqRes).listen(3000, () => {
  console.log('server is started');
});

let db = [];

function authUser(user, db){
  let found = false;
    for(let i = 0; i < db.length; i++){
      if(user.login == db[i].login && user.password == db[i].password){
        found = true;
      }
    }
    if(found){
      return true;
    } else {
      return false;
    }
}

async function reqRes(req, res){

  let pu = url.parse(req.url, true);

    if(pu.pathname == '/'){

      let content = await utils.getContent('index.html');

      res.end(content);

    } else if (pu.pathname == '/chat'){
      let content = await utils.getContent("chat.html");
      res.end(content);
    } else if (pu.pathname == '/authForm'){
      let content = await utils.getContent("auth.html");
      res.end(content);
    } else if (pu.pathname == '/reg'){
        let body = "";

        req.on('data', (part) => {
          body += part;
        });

        req.on('end', async () => {
          body = body.toString();

          let user = JSON.parse(body);
          try{
            db.push(user);
            console.log(db);
            res.end("ok",);
          } catch(ex){
            console.log(ex);
          }

        });
    } else if (pu.pathname == '/auth'){
        let body = "";

        req.on('data', (part) => {
          body += part;
        });

        req.on('end', async () => {
          body = body.toString();

          let user = JSON.parse(body);
          console.log(user);

          try{
            let found = await authUser(user, db);
              if(found == true){
                // let content = await utils.getContent("chat.html");
                // res.setHeader('content-type', 'text/html');
                res.end(toString({status: "ok"}));
              } else {
                res.end("err");
              }
          }catch(ex){
            console.log(ex);
          }

        })
    } else if (pu.pathname == '/cookies.js'){
      let content = await utils.getContent("cookies.js");
      res.end(content);
    } else if (pu.pathname == '/browser.js'){
      let content = await utils.getContent("browser.js");
      res.end(content);
    }


}
