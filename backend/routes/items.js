'use strict';

const debug           = require('debug')('todo:itemsRouter');
// const AppError        = require(`${__dirname}/../lib/app-error`);
const itemCtrl        = require(`${__dirname}/../resources/item/item-controller`);
const getItemMidware  = require(`${__dirname}/../lib/get-item-middleware`);

const itemsRouter     = require('express').Router();
module.exports        = itemsRouter;

itemsRouter.route('/')
  // POST route to create a new item in a list
  .post((req, res, next) => {
    debug('POST to /lists/:listId/items');
    let itemParams  = req.body;
    itemParams.list = req.list._id.toString();
    itemCtrl.newItem(itemParams, req.list)
      .then((item) => {
        return res.status(200).json(item);
      })
      .catch(next);
  })
  
  // GET route for all items in a list, req.list should exist from getListMidware, and if an error were to happen, it should have happened by now
  .get((req, res, next) => {
    debug('GET to /lists/:listId/items');
    itemCtrl.getAllItems(req.list._id.toString())
      .then((items) => {
        return res.status(200).json(items);
      })
      .catch(next);
  });

itemsRouter.use('/:itemId', getItemMidware);

itemsRouter.route('/:itemId')
  // GET route for all items in a list 
  .get((req, res, next) => {
    debug('GET to /lists/:listId/items/:itemId');
    return res.status(200).json(req.item);
  })

  // PUT route to create a new item in a list
  .put((req, res, next) => {
    debug('PUT to /lists/:listId/items/:itemId');
    
    // remove params that they shouldn't be able to change 
    delete req.body._id;
    delete req.body.creationDate;
    
    itemCtrl.updateItem(req.params.itemId, req.body)
      .then((item) => {
        return res.status(200).json(item);
      })
      .catch(next);
  })

  // DELETE route to create a new item in a list
  .delete((req, res, next) => {
    debug('DELETE to /lists/:listId/items/:itemId');
    itemCtrl.deleteItem(req.params.itemId)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });
