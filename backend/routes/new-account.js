'use strict';

const debug             = require('debug')('newAccountRouter');
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
      debug('newAccountRouter POST then');
      delete user.password;
      let resBody = {
        user, 
        token: user.generateToken()
      };
      return res.status(200).json(resBody);
    })
    .catch((err) => {
      debug('newAccountRouter POST catch');
      next(err);
    });
});
