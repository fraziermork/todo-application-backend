'use strict';

const debug             = require('debug')('todo:newAccountRouter');
const AppError          = require(`${__dirname}/../lib/app-error`);
// const User              = require(`${__dirname}/../resources/user/user-model`);
const userCtrl = require(`${__dirname}/../resources/user/user-controller`);



const newAccountRouter  = require('express').Router();
module.exports          = newAccountRouter;



/**
 * /new-account POST route
 * 
 * responds with JSON like { user: mongo user document, token: authorization token for subsequent requests }
 */ 
newAccountRouter.post('/', (req, res, next) => {
  debug('POST made to /new-account', req.body);
  userCtrl.newUser(req.body)
    .then((user) => {
      let token  = user.generateToken();
      return res.status(200)
        .cookie('XSRF-TOKEN', token)
        .json(user);
    })
    .catch(next);
});

newAccountRouter.all('*', (req, res, next) => {
  return next(new AppError(404, 'request to /new-account with wrong http verb'));
});
