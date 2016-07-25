'use strict';

const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const debug     = require('debug')('todo:User');
const listCtrl  = require(`${__dirname}/../list/list-controller`);

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  email:        { 
    type:     String, 
    required: true, 
    unique:   true,
    match:    [
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 
      'User email field failed regex match'
    ] 
  }
}, {
  timestamps: { createdAt: 'creationDate' }, 
  toObject:   { 
    getters:  true, 
    minimize: false
  }
});


// Automatically adds an empty array to the user representation as the lists property so that it doesn't mess with ng repeats
userSchema.virtual('lists').get(() => {
  return [];
});

// TODO: fix this to use a setter
userSchema.pre('save', function preUserSaveHook(next) {
  debug('pre user save');
  bcrypt.hash(this.password, 10, (err, hashedPassword) => {
    this.password = hashedPassword;
    next();
  });
});

userSchema.pre('remove', function preUserRemoveHook(next) {
  debug('User pre remove');
  listCtrl.deleteAllLists(this._id)
    .then((items) => {
      debug('sucessfully deleted all lists belonging to user pre user remove');
      next();
    })
    .catch((err) => {
      debug('ERROR removing lists belonging to user ', this._id, err);
      next();
    });
});

userSchema.methods.comparePassword = function comparePassword(password) {
  debug('userSchema comparePassword');
  return bcrypt.compareSync(password, this.password, bcrypt.genSaltSync(10));
};

userSchema.methods.generateToken = function generateToken() {
  debug('userSchema generateToken');
  return jwt.sign({ _id: this._id }, process.env.JWT_TOKEN_SECRET || '0112358');
};

module.exports = mongoose.model('User', userSchema);
