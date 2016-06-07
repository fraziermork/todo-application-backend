'use strict';

const debug     = require('debug')('tokenAuthMidware');
const userCtrl  = require(`${__dirname}/../resources/user/user-controller`);
const AppError  = require(`${__dirname}/app-error`);


module.exports  = tokenAuthMidware;

function tokenAuthMidware(req, res, next) {
  debug('tokenAuthMidware');
  if (!req.headers.authorization) {
    return next(new AppError(401, 'no authorization token provided'));
  }
  
  let token = req.headers.authorization.split(' ')[1];
  userCtrl.findByAuthToken(token)
    .then((user) => {
      req.user = user;
      return next();
    })
    .catch(next);
}
