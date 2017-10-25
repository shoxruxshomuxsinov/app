import bodyParser from 'body-parser';
import multer from 'multer';
import * as config from '../config';

const pgp = require("pg-promise")(/*options*/);
// const db = pgp('postgres://ruslan:qwerty123$@' + config.dbserver.host + ':' + config.dbserver.port + '/' + config.dbserver.dbname);

export default class User {
  constructor (login, password, regdate){
    this.login = login;
    this.password = password;
    this.regdate = regdate;
  }

}
