'use strict';

const debug             = require('debug')('todo:newAccountRouter');
// const AppError          = require(`${__dirname}/../lib/app-error`);
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
      console.log('GOT HERE', user);
      delete user.password;
      let token = user.generateToken();
      console.log('got here 3');
      res.status(200)
        .cookie('XSRF-TOKEN', token)
        .json(user);
        
      console.log('GOT HERE 2');  
        
      return;
    })
    .catch(next);
});
