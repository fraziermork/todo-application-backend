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
  debug('tokenAuthMidware, req.headers: ', req.headers);

  console.log('cookie: ', req.headers.cookie);
  console.log(req.cookies);
  if (!req.cookies) return next(new AppError(401, 'No cookie present on request'));
  // TODO: 'XSRF-TOKEN' is the default name for cookies sent with angular, but can be configured to any name
  let reqCookie     = req.cookies['XSRF-TOKEN'];
  // TODO: 'X-XSRF-TOKEN' is how angular attaches the token to the headers, but any name can be used
  let headerCookie  = req.headers['x-xsrf-token'];
  debug('REQUEST COOKIE XSRF-TOKEN: ', reqCookie);
  debug('HEADER COOKIE X-XSRF-TOKEN: ', headerCookie);
  
  if (!reqCookie || !headerCookie || reqCookie !== headerCookie) {
    debug(`REJECTING with 401 from tokenAuthMidware, reqCookie: ${!!reqCookie}, headerCookie: ${!!headerCookie}, match: ${reqCookie === headerCookie}`);
    return next(new AppError(401, 'Authorization cookies missing or didnt match'));
  }

  userCtrl.findByAuthToken(headerCookie)
    .then((user) => {
      req.user = user;
      return next();
    })
    .catch(next);
  
}
