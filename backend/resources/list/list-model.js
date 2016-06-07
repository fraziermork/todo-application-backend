'use strict';

const mongoose    = require('mongoose');
const debug       = require('debug')('List');

const listSchema  = new mongoose.Schema({
  name:         { type: String, required: true },
  creationDate: { type: Date, default: Date.now },
  description:  String,
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  // items:        [{ ref: 'Item', type: mongoose.Schema.Types.ObjectId}]
});

debug('exporting listSchema');
module.exports    = mongoose.model('List', listSchema);
