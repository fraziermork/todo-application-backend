'use strict';

// const Promise             = require('bluebird');
const debug               = require('debug')('itemCtrl');
const Item                = require(`${__dirname}/item-model`);
const listCtrl            = require(`${__dirname}/../list/list-controller`);
const AppError            = require(`${__dirname}/../../lib/app-error`);

const itemCtrl            = module.exports = {};

itemCtrl.newItem          = newItem;
itemCtrl.getItem          = getItem;
itemCtrl.updateItem       = updateItem;
itemCtrl.deleteItem       = deleteItem;

/**
 * newItem - creates a new item
 *  
 * @param  {object}   itemParams  an object with properties for all the fields of the item to be created 
 * @return {promise}              a promise that resolves with a newly saved item or rejects with an appError 
 */ 
function newItem(itemParams) {
  debug('newItem');
  return new Promise((resolve, reject) => {
    Item.createAsync(itemParams)
      .catch((err) => {
        debug('newItem catch, mongo error');
        return reject(new AppError(400, err));
      })
      .then((item) => {
        debug('newItem then into updateListItems', item);
        debug(`listId: ${item.list.toString()}, itemId: ${item._id.toString()}`);
        itemParams = item;
        return listCtrl.updateListItems(item.list.toString(), item._id.toString());
      })
      .then((list) => {
        debug('newItem then, resolving w/ saved item');
        return resolve(itemParams);
      })
      .catch(reject);
  });
}



/**
 * getList - finds an item by id
 *  
 * @param  {type}     itemId  the _id of the item to find 
 * @return {promise}          a promise that resolves with a found item or rejects with an appError 
 */ 
function getItem(itemId) {
  debug('getItem');
  return new Promise((resolve, reject) => {
    if (!itemId) return reject(new AppError(400, 'no itemId provided'));
    Item.findById(itemId, (err, item) => {
      if (err || !item) {
        return reject(new AppError(404, err || 'no item found'));
      } 
      return resolve(item);
    });
  });
}


/**
 * updateItem - updates an item's properties
 *  
 * @param  {string}     itemId      the _id of the item to update
 * @param  {object}     itemParams  the incoming request body detailing the changes to make 
 * @return {promise}                a promise that resolves with the updated item or rejects with an appError 
 */ 
function updateItem(itemId, itemParams) {
  debug('updateItem');
  return new Promise((resolve, reject) => {
    if (!itemParams || Object.keys(itemParams).length === 0) {
      return reject(new AppError(400, 'no update content provided'));
    }
    // TODO: figure out if I need to be more careful about which updates are being allowed through 
    Item.findOneAndUpdate({ _id: itemId }, 
      { $set: itemParams }, 
      { runValidators: true, new: true }, 
      (err, item) => {
        if (err || !item) {
          return reject(new AppError(400, err || 'no item existed, shouldnt have happened'));
        }
        return resolve(item);
      });
  });
}



/**
 * deleteItem - deletes a item from the database, removes references to it from its list
 *  
 * @param  {string} itemId  the _id of the item to delete  
 * @return {promise}        a promise that rejects with an appError or resolves with nothing 
 */ 
function deleteItem(itemId) {
  debug('deleteItem');
  // TODO: need to remove references from list 
  return new Promise((resolve, reject) => {
    Item.findOneAndRemoveAsync({ _id: itemId })
      .then((item) => {
        debug('Item.findOneAndRemoveAsync then');
        return listCtrl.updateListItems(item.list.toString(), itemId, true);
      })
      .then(() => {
        debug('listCtrl.updateListItems then');
        return resolve();
      })
      .catch((err) => {
        return reject(new AppError(400, err));
      });
  });
}
