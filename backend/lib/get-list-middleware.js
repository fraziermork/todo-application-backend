'use strict';

const debug       = require('debug')('getListMidware');
const AppError    = require(`${__dirname}/app-error`);
const listCtrl    = require(`${__dirname}/../resources/list/list-controller`);

module.exports    = getListMidware;


/**
 * getListMidware - purpose is to find the list that is being operated on and either attach it as req.list or call the error response midware with a 401 error if the list doesn't belong to the authenticated user
 * intended to be used only on the /lists/:id routes 
 * 
 * @param  {object}   req  the express request object 
 * @param  {object}   res  the express response object 
 * @param  {function} next the function to tell express to move on to the next middleware--if called with an error, moves on to the error middleware
 */ 
function getListMidware(req, res, next) {
  debug('getListMidware');
  listCtrl.getList(req.params.listId)
    .then((list) => {
      if (list.owner.toString() !== req.user._id.toString()) {
        throw new AppError(401, 'user tried to access a list that doesnt belong to them');
      }
      req.list = list;
      return next();
    })
    .catch(next);
}
