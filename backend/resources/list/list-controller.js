'use strict';


const debug               = require('debug')('todo:listCtrl');
const List                = require(`${__dirname}/list-model`);
const itemCtrl            = require(`${__dirname}/../item/item-controller`);
const AppError            = require(`${__dirname}/../../lib/app-error`);


const listCtrl            = module.exports = {};
listCtrl.newList          = newList;
listCtrl.getAllLists      = getAllLists;
listCtrl.getList          = getList;
listCtrl.updateList       = updateList;
listCtrl.deleteList       = deleteList;
listCtrl.deleteAllLists   = deleteAllLists;

/**
 * newList - creates a new list 
 *  
 * @param  {object} listParams    an object with properties for the new list
 * @return {promise}              a promise that resolves with the new list or rejects with an appError 
 */ 
function newList(listParams) {
  debug('newList', listParams);
  return new Promise((resolve, reject) => {
    List.createAsync(listParams)
      .then((list) => {
        return resolve(list);
      })
      .catch((err) => {
        return reject(new AppError(400, err));
      });
  });
}



/**
 * getAllLists - returns all lists that belong to a user 
 *  
 * @param  {string}  userId the _id of the user whose lists you want to find
 * @return {promise}        a promise that resolves with an array of all lists belonging to that user or rejects with an appError 
 */ 
function getAllLists(userId) {
  debug('getAllLists');
  return new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new AppError(404, 'no user id provided'));
    }
    List.find({ owner: userId })
      .exec((err, lists) => {
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
  // TODO: need to delete all items in the list 
  return new Promise((resolve, reject) => {
    List.findOneAndRemoveAsync({ _id: listId })
      .then((list) => {
        return itemCtrl.deleteAllItems(listId);
      })
      .then((items) => {
        return resolve();
      })
      .catch((err) => {
        return reject(new AppError(400, err));
      });
  });
}


/**
 * deleteAllLists - deletes all lists belonging to a user
 *  
 * @param  {string} userId  the id of the user 
 * @return {promise}        a promise that resolves with the deleted lists or rejects with an appError 
 */ 
function deleteAllLists(userId) {
  debug('deleteAllLists');
  return new Promise((resolve, reject) => {
    List.find({ owner: userId })
      .remove()
      .exec((err, lists) => {
        if (err) {
          return reject(new AppError(400, 'error deleting all lists'));
        }
        return resolve(lists);
      });
  });
}
