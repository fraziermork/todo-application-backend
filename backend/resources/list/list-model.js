'use strict';
// TODO: allow users to share lists/for there to be more than one owner? Permissions for read, write, etc? 

const mongoose    = require('mongoose');
// const debug       = require('debug')('todo:List');
// const itemCtrl    = require(`${__dirname}/../item/item-controller`);

const listSchema  = new mongoose.Schema({
  name:           { type: String, required: true },
  description:    String,
  items:          [{ 
    type:     mongoose.Schema.Types.ObjectId, 
    ref:      'Item',
    unique:   true, 
    dropDups: true 
  }]

}, {
  timestamps: { createdAt: 'creationDate' }, 
  toObject:   { 
    getters:  true, 
    minimize: false
  }
});

// TODO: figure out if should be throwing the error here for the error to bubble up to the controller
// listSchema.pre('remove', function(next) {
//   debug('List pre remove');
//   itemCtrl.deleteAllItems(this._id)
//     .then((items) => {
//       debug('sucessfully deleted all items belonging to list pre list remove');
//       next();
//     })
//     .catch((err) => {
//       debug('ERROR removing items belonging to list ', this._id, err);
//       next();
//     });
// });

module.exports = mongoose.model('List', listSchema);
