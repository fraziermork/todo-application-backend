'use strict';

const debug       = require('debug')('LIST ROUTER:');
const appError    = require(`${__dirname}/../lib/app-error`);
const User        = require(`${__dirname}/../resources/user/user-model`);

const listsRouter = require('express').Router();
module.exports    = listsRouter;


listsRouter.get('/', (req, res) => {
  debug('');
  
  
});
