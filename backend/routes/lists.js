'use strict';

const debug       = require('debug')('listsRouter');
const AppError    = require(`${__dirname}/../lib/app-error`);
const listCtrl    = require(`${__dirname}/../resources/list/list-controller`);
debug('listsRouter required in');

const listsRouter = require('express').Router();
module.exports    = listsRouter;




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







listsRouter.route('/:id')
  // GET route for retrieving a single list owned by the authenticated user
  .get((req, res, next) => {
    debug('GET made to /lists/:id'); 
    listCtrl.getList(req.params.id)
      .then((list) => {
        debug('GET /lists/:id then');
        if (list.owner.toString() !== req.user._id.toString()) {
          throw new AppError(401, 'user tried to access a list that doesnt belong to them');
        }
        return res.status(200).json(list);
      })
      .catch(next);
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
    
    listCtrl.getList(req.params.id)
      .then((list) => {
        debug('PUT /lists/:id then, list found');
        if (list.owner.toString() !== req.user._id.toString()) {
          throw new AppError(401, 'user tried to change a list that doesnt belong to them');
        } 
        return listCtrl.updateList(req.params.id, req.body);
      })
      .then((list) => {
        debug('PUT /lists/:id then, list updated');
        return res.status(200).json(list);
      })
      .catch(next);
  })
  
  // DELETE route for deleting a single list owned by the authenticated user
  .delete((req, res, next) => {
    debug('DELETE made to /lists/:id');
    listCtrl.getList(req.params.id)
      .then((list) => {
        if (list.owner.toString() !== req.user._id.toString()) {
          throw new AppError(401, 'user tried to delete a list that doesnt belong to them');
        } 
        return listCtrl.deleteList(req.params.id);
      })
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });
  
// TODO: refactor so that the shared code between the get, put, and delete routes is handled by a middleware  
