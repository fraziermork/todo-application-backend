'use strict';

const debug       = require('debug')('todo:loginRouter');
const AppError    = require(`${__dirname}/../lib/app-error`);
const listCtrl    = require(`${__dirname}/../resources/list/list-controller`);

const loginRouter = require('express').Router();
module.exports    = loginRouter;

/**
 * /login GET route
 * 
 * responds with JSON like { user: mongo user document, token: authorization token for subsequent requests }
 */ 
loginRouter.get('/', (req, res, next) => {
  debug('GET made to /login');
  listCtrl.getAllLists(req.user._id.toString())
    .then((lists) => {
      let token  = req.user.generateToken();
      let user   = req.user.toObject();
      user.lists = lists;
      return res
        .status(200)
        .cookie('XSRF-TOKEN', token)
        .json(user);
    })
    .catch(next);
});

loginRouter.all('*', (req, res, next) => {
  return next(new AppError(404, 'request to /login with wrong http verb'));
});
