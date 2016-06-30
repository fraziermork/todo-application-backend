'use strict';

const debug     = require('debug')('todo:basicAuthMidware');
const AppError  = require(`${__dirname}/app-error`);
const userCtrl  = require(`${__dirname}/../resources/user/user-controller`);

module.exports  = basicAuthMidware;



/**
 * basicAuthMidware - parses authorization headers w/ basic auth protocol
 *  
 * if user found and password matches, attaches user to request object 
 * if headers missing, formatted incorrectly, if user not found, or if password doesn't match, errors out
 */ 
function basicAuthMidware(req, res, next) {
  debug('basicAuthMidware');
  try {
    if (!req.headers.authorization) {
      debug('no authorization headers present');
      return next(new AppError(401, 'no authorization headers present'));
    }
    let b64AuthString           = req.headers.authorization.split(' ')[1];
    let authBuffer              = new Buffer(b64AuthString, 'base64');
    let [ username, password ]  = authBuffer.toString().split(':');
    authBuffer.fill(0);
    userCtrl.findByUsername(username, password)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch(next);
  } catch (err) {
    debug('basicAuthMidware catch block', err);
    return next(new AppError(400, 'failed to parse authorization headers as base64'));
  }
}
