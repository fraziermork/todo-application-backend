'use strict';

const debug               = require('debug')('listCtrl');
const List                = require(`${__dirname}/list-model`);
const userCtrl            = require(`${__dirname}/../user/user-controller`);
const AppError            = require(`${__dirname}/../../lib/app-error`);

const listCtrl            = module.exports = {};
listCtrl.newList          = newList;

/**
 * newList - creates a new list 
 *  
 * @param  {object} listContents  an object with properties for the new list
 * @return {promise}              a promise that resolves with the new list or rejects with an appError 
 */ 
function newList(listContents) {
  debug('newList');
  return new Promise((resolve, reject) => {
    
    List.createAsync(listContents)
      .catch((err) => {
        debug('newList catch error from mongo');
        return reject(new AppError(400, err));
      })
      .then((list) => {
        debug('newList then into updateUserLists');
        listContents = list;
        return userCtrl.updateUserLists(listContents.owner, list._id);
      })
      .then((user) => {
        debug('newList then, resolving with saved list');
        resolve(listContents);
      })
      .catch(reject);
  });
}
