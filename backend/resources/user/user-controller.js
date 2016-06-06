'use strict';

const User        = require(`${__dirname}/user-model`);
const AppError    = require(`${__dirname}/../../lib/app-error`);
const debug       = require('debug')('userCtrl');
const userCtrl    = module.exports = {};

userCtrl.newUser  = newUser;




function newUser(reqBody) {
  debug('newUser called');
  return new Promise((resolve, reject) => {
    if (!reqBody.username || !reqBody.password || !reqBody.email) {
      debug('incorrect credentions provided, rejecting');
      return reject(AppError.newAppError(400, `Either username (${reqBody.username}) or password (${reqBody.password}) or email (${reqBody.email}) not provided.`));
    }
    
    // Ensure that only the desired info gets through 
    let userInfo = { 
      username: reqBody.username,
      password: reqBody.password,
      email:    reqBody.email
    };
    
    // TODO: check the error type to determine if it failed validation or if it was a duplicate
    User.create(userInfo, (err, user) => {
      debug('user create callback');
      if (err) {
        debug('error creating user, rejecting', err);
        return reject(AppError.newAppError(400, err));
      } 
      debug('user created, resolving');
      return resolve(user);
    });
  });
}
