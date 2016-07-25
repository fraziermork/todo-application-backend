'use strict';

const debug     = require('debug')('todo:tokenAuthMidware');
const userCtrl  = require(`${__dirname}/../resources/user/user-controller`);
const AppError  = require(`${__dirname}/app-error`);


module.exports  = tokenAuthMidware;



/**
 * tokenAuthMidware - purpose is to take an incoming authenticated request, decode the token, and either attach the user as req.user or call the error response midware with a 401 error
 *                    
 * 
 * @param  {type} req  description 
 * @param  {type} res  description 
 * @param  {type} next description 
 * @return {type}      description 
 */ 
function tokenAuthMidware(req, res, next) {
  debug('tokenAuthMidware');
  if (!req.cookies) return next(new AppError(401, 'No cookie present on request'));
  // TODO: 'XSRF-TOKEN' is the default name for cookies sent with angular, but can be configured to any name
  let cookieJWT = req.cookies['XSRF-TOKEN'];
  // TODO: 'X-XSRF-TOKEN' is how angular attaches the token to the headers, but any name can be used
  let headerJWT = req.headers['x-xsrf-token'];
  debug('REQUEST COOKIE XSRF-TOKEN: ', cookieJWT);
  debug('HEADER X-XSRF-TOKEN: ', headerJWT);
  
  if (!cookieJWT || !headerJWT || cookieJWT !== headerJWT) {
    debug(`REJECTING with 401 from tokenAuthMidware, cookieJWT: ${!!cookieJWT}, headerCookie: ${!!headerJWT}, match: ${cookieJWT === headerJWT}`);
    return next(new AppError(401, 'Authorization cookies missing or didnt match'));
  }

  userCtrl.findByAuthToken(headerJWT)
    .then((user) => {
      req.user = user;
      return next();
    })
    .catch(next);
  
}
