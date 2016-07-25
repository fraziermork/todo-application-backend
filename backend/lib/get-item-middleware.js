'use strict';

const debug       = require('debug')('todo:getItemMidware');
const AppError    = require(`${__dirname}/app-error`);
const itemCtrl    = require(`${__dirname}/../resources/item/item-controller`);

module.exports    = getItemMidware;


/**
 * getItemMidware - purpose is to find the item that is being operated on and either attach it as req.item or call the error response midware with a 40o error if the item isn't attached to the requested list
 * intended to be used only on the /lists/:id routes 
 * 
 * @param  {object}   req  the express request object 
 * @param  {object}   res  the express response object 
 * @param  {function} next the function to tell express to move on to the next middleware--if called with an error, moves on to the error middleware
 */ 
function getItemMidware(req, res, next) {
  debug('getItemMidware');
  itemCtrl.getItem(req.params.itemId)
    .then((item) => {
      let itemInListFlag = req.list.items.some((listItem) => {
        return listItem._id.toString() === item._id.toString();
      });
      
      if (!itemInListFlag) {
        debug('getItemMidware item.list: ', item.list.toString());
        debug('getItemMidware req.list._id: ', req.list._id.toString());
        throw new AppError(400, 'specified item isnt attached to the specified list');
      }
      req.item = item;
      return next();
    })
    .catch(next);
}
