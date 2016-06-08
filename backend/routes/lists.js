'use strict';

const debug           = require('debug')('listsRouter');
const getListMidware  = require(`${__dirname}/../lib/get-list-middleware`);
const AppError        = require(`${__dirname}/../lib/app-error`);
const listCtrl        = require(`${__dirname}/../resources/list/list-controller`);

const listsRouter     = require('express').Router();
module.exports        = listsRouter;




listsRouter.route('/')
  // POST route for creating a new list owned by the authenticated user
  .post((req, res, next) => {
    debug('POST made to /lists');
    let listContents    = req.body;
    listContents.owner  = req.user._id;
    listCtrl.newList(listContents)
      .then((list) => {
        debug('list POST then');
        return res.status(200).json(list);
      })
      .catch(next);
  })
  
  // GET route for getting all of the authenticated user's lists
  .get((req, res, next) => {
    debug('GET made to /lists');    
    let listIds = req.user.lists.map((list) => {
      return list._id.toString();
    });
    listCtrl.getAllLists(listIds)
      .then((lists) => {
        debug('list GET all then');
        return res.status(200).json(lists);
      })
      .catch(next);
  });

// Attaches requested list to req, ensures that authenticated user owns that list
listsRouter.use('/:id', getListMidware);

listsRouter.route('/:id')
  
  // GET route for retrieving a single list owned by the authenticated user
  .get((req, res, next) => {
    debug('GET made to /lists/:id');
    if (!req.list) {
      return next(new AppError(500, 'get list middleware broke'));
    }
    return res.status(200).json(req.list);
  })
  
  // PUT route for updating a single list owned by the authenticated user
  .put((req, res, next) => {
    debug('PUT made to /lists/:id'); 
    
    // remove properties that they shouldn't be able to change
    // Item manipulation should be done through item routes, not through list routes
    delete req.body._id;
    delete req.body.creationDate;
    delete req.body.owner;
    delete req.body.items;
    
    listCtrl.updateList(req.params.id, req.body)
      .then((list) => {
        debug('PUT /lists/:id then, list updated');
        return res.status(200).json(list);
      })
      .catch(next);
  })
  
  // DELETE route for deleting a single list owned by the authenticated user
  .delete((req, res, next) => {
    debug('DELETE made to /lists/:id');
    listCtrl.deleteList(req.params.id)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });
  
