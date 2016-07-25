'use strict';

const mongoose    = require('mongoose');
const debug       = require('debug')('todo:List');
const itemCtrl    = require(`${__dirname}/../item/item-controller`);

// TODO: allow users to share lists/for there to be more than one owner? Permissions for read, write, etc? 

const listSchema  = new mongoose.Schema({
  name:           { type: String, required: true },
  description:    String,
  owner:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  items:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
}, {
  timestamps: { createdAt: 'creationDate' }, 
  toObject:   { 
    getters:  true, 
    minimize: false
  }
});

// TODO: figure out if should be throwing the error here for the error to bubble up to the controller
listSchema.pre('remove', function(next) {
  debug('List pre remove');
  itemCtrl.deleteAllItems(this._id)
    .then((items) => {
      debug('sucessfully deleted all items belonging to list pre list remove');
      next();
    })
    .catch((err) => {
      debug('ERROR removing items belonging to list ', this._id, err);
      next();
    });
});

// Automatically adds an empty array to the list representation as the items property so that it doesn't mess with ng repeats
listSchema.virtual('items').get(() => {
  return [];
});

module.exports    = mongoose.model('List', listSchema);
