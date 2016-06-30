'use strict';

const mongoose    = require('mongoose');
// const debug       = require('debug')('todo:Item');

// TODO: add comments? Due dates? status complete/incomplete? labels/tags? activity log--if moved from one list to another, keeps track of history?

const itemSchema  = new mongoose.Schema({
  name:           { type: String, required: true },
  creationDate:   { type: Date, default: Date.now },
  content:        String,
  list:           { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true }
});

module.exports    = mongoose.model('Item', itemSchema);
