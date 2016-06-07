'use strict';

const debug       = require('debug')('listsRouter');
// const appError    = require(`${__dirname}/../lib/app-error`);
const listCtrl    = require(`${__dirname}/../resources/list/list-controller`);
debug('listsRouter required in');

const listsRouter = require('express').Router();
module.exports    = listsRouter;

listsRouter.post('/', (req, res, next) => {
  debug('POST made to /lists');
  
  let listContents    = req.body;
  listContents.owner  = req.user._id;
  
  listCtrl.newList(listContents)
    .then((list) => {
      debug('list POST then');
      // TODO: figure out format of response here
      return res.status(200).json(list);
    })
    .catch(next);
});
