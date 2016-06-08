'use strict';

const debug       = require('debug')('loginRouter');
// const AppError    = require(`${__dirname}/../lib/app-error`);

const loginRouter = require('express').Router();
module.exports    = loginRouter;

/**
 * /login GET route
 * 
 * responds with JSON like { user: mongo user document, token: authorization token for subsequent requests }
 */ 
loginRouter.get('/', (req, res, next) => {
  debug('GET made to /login');
  delete req.user.password;
  let resBody = {
    user:   req.user, 
    token:  req.user.generateToken()
  };
  return res.status(200).json(resBody);
});
