'use strict';

const debug     = require('debug')('tokenAuthMidware');
const userCtrl  = require(`${__dirname}/../resources/user/user-controller`);
const AppError  = require(`${__dirname}/app-error`);


module.exports  = tokenAuthMidware;



/**
 * tokenAuthMidware - purpose is to take an incoming authenticated request, decode the token, and either attach the user as req.user or call the error response midware with a 401 error
 *  
 * @param  {type} req  description 
 * @param  {type} res  description 
 * @param  {type} next description 
 * @return {type}      description 
 */ 
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
