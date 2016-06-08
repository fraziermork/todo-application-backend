'use strict';

const mongoose    = require('mongoose');
// const debug       = require('debug')('List');

// TODO: allow users to share lists/for there to be more than one owner? Permissions for read, write, etc? 

const listSchema  = new mongoose.Schema({
  name:           { type: String, required: true },
  creationDate:   { type: Date, default: Date.now },
  description:    String,
  owner:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:          [{ ref: 'Item', type: mongoose.Schema.Types.ObjectId}]
});

module.exports    = mongoose.model('List', listSchema);
