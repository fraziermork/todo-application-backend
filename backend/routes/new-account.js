'use strict';

const debug             = require('debug')('NEWACCOUNT ROUTER:');
const AppError          = require(`${__dirname}/../lib/app-error`);
// const User              = require(`${__dirname}/../resources/user/user-model`);
const userCtrl = require(`${__dirname}/../resources/user/user-controller`);

const newAccountRouter  = require('express').Router();
module.exports          = newAccountRouter;


newAccountRouter.post('/', (req, res, next) => {
  debug('POST made to /new-account');
  // return res.status(200).json({ message: 'yes' });
  
  userCtrl.newUser(req.body)
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch(next);
});
