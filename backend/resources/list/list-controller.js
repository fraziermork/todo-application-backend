'use strict';

// const Promise             = require('bluebird');
const debug               = require('debug')('listCtrl');
const List                = require(`${__dirname}/list-model`);
// const itemCtrl            = require(`${__dirname}/../item/item-controller`);
const userCtrl            = require(`${__dirname}/../user/user-controller`);
const AppError            = require(`${__dirname}/../../lib/app-error`);


const listCtrl            = module.exports = {};
listCtrl.newList          = newList;
listCtrl.getAllLists      = getAllLists;
listCtrl.getList          = getList;
listCtrl.updateList       = updateList;
listCtrl.deleteList       = deleteList;
listCtrl.updateListItems  = updateListItems;


/**
 * newList - creates a new list 
 *  
 * @param  {object} listParams    an object with properties for the new list
 * @return {promise}              a promise that resolves with the new list or rejects with an appError 
 */ 
function newList(listParams) {
  debug('newList');
  return new Promise((resolve, reject) => {
    
    List.createAsync(listParams)
      .catch((err) => {
        debug('newList catch, mongo error');
        return reject(new AppError(400, err));
      })
      .then((list) => {
        debug('newList then into updateUserLists');
        listParams = list;
        return userCtrl.updateUserLists(listParams.owner, list._id);
      })
      .then((user) => {
        debug('newList then, resolving with saved list');
        return resolve(listParams);
      })
      .catch(reject);
  });
}



/**
 * getAllLists - returns all lists that belong to a user, fully populated with all of the items in them. 
 *  
 * @param  {array} listIds  an array of list _ids belonging to the authenticated user 
 * @return {promsie}          a promise that resolves with n array of all lists belonging to that user with items populated or rejects with an appError 
 */ 
function getAllLists(listIds) {
  debug('getAllLists');
  return new Promise((resolve, reject) => {
    if (listIds.length === 0) {
      return resolve([]);
    }
    List.find({ _id: { $in: listIds }})
      .populate('items')
      .exec((err, lists) => {
        debug('getAllLists callback');
        if (err) return reject(new AppError(404, err));
        return resolve(lists);
      });
  });
}




/**
 * getList - finds a list by id
 *  
 * @param  {type}     listId  the _id of the list to find 
 * @return {promise}          a promise that resolves with a found list or rejects with an appError 
 */ 
function getList(listId) {
  debug('getList');
  return new Promise((resolve, reject) => {
    if (!listId) return reject(new AppError(400, 'no listId provided'));
    List.findById(listId)
      .populate('items')
      .exec((err, list) => {
        if (err || !list) {
          return reject(new AppError(404, err || 'no list found'));
        } 
        return resolve(list);
      });
  });
}


/**
 * updateList - updates a lists properties, not to be used to modify a list's items 
 *  
 * @param  {string}     listId      the _id of the list to update
 * @param  {object}     listParams  the incoming request body detailing the changes to make 
 * @return {promise}                a promise that resolves with the updated list or rejects with an appError 
 */ 
function updateList(listId, listParams) {
  debug('updateList');
  return new Promise((resolve, reject) => {
    if (!listParams || Object.keys(listParams).length === 0) {
      return reject(new AppError(400, 'no update content provided'));
    }
    // TODO: figure out if I need to be more careful about which updates are being allowed through 
    List.findOneAndUpdate({ _id: listId }, 
      { $set: listParams }, 
      { runValidators: true, new: true }, 
      (err, list) => {
        if (err || !list) {
          return reject(new AppError(400, err || 'no list existed, shouldnt have happened'));
        }
        return resolve(list);
      });
  });
}



/**
 * deleteList - deletes a list from the database, removes references to it from its owner, and deletes all its items
 *  
 * @param  {string} listId  the _id of the list to delete  
 * @return {promise}        a promise that rejects with an appError or resolves with nothing 
 */ 
function deleteList(listId) {
  debug('deleteList');
  // TODO: need to remove references from user 
  // TODO: need to delete all items in the list 
  return new Promise((resolve, reject) => {
    List.findOneAndRemoveAsync({ _id: listId })
      .then((list) => {
        debug('List.findOneAndRemoveAsync then');
        return userCtrl.updateUserLists(list.owner.toString(), listId, true);
      })
      .then(() => {
        debug('userCtrl.updateUserLists then');
        return resolve();
      })
      .catch((err) => {
        return reject(new AppError(400, err));
      });
  });
}




/**
 * updateListItems - Adds or removes the reference to an item from a list document
 * TODO: refactor so that this is handled by save and remove hooks on Item?
 *  
 * @param  {string}   listId      the _id of the a list to add or remove an item from
 * @param  {string}   itemId      the _id of an item to add or remove from a list
 * @param  {boolean}  removeFlag  whether to remove the itemId (pull from document) from the list or not
 * @return {promise}              a promise that resolves with the list or rejects with an appError 
 */ 
function updateListItems(listId, itemId, removeFlag) {
  debug('updateListItems');
  return new Promise((resolve, reject) => {
    let update        = {};
    let operation     = removeFlag ? '$pull' : '$push'; 
    update[operation] = { items: itemId };
    
    List.findOneAndUpdateAsync({ _id: listId }, update, { runValidators: true, new: true })
      .then((list) => {
        debug('updateListItems then');
        return resolve(list);
      })
      .catch((err) => {
        debug('updateListItems catch');
        return reject(new AppError(404, err));
      });
  });
}
