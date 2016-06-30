'use strict';

const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const debug     = require('debug')('todo:User');
const listCtrl  = require(`${__dirname}/../list/list-controller`);

// TODO: write validator to check if email is a valid email
const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  creationDate: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  debug('pre user save');
  bcrypt.hash(this.password, 10, (err, hashedPassword) => {
    this.password = hashedPassword;
    next();
  });
});

userSchema.pre('remove', function(next) {
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

userSchema.methods.comparePassword = function(password) {
  debug('userSchema comparePassword');
  return bcrypt.compareSync(password, this.password, bcrypt.genSaltSync(10));
};

userSchema.methods.generateToken = function() {
  debug('userSchema generateToken');
  return jwt.sign({ _id: this._id }, process.env.JWT_TOKEN_SECRET || '0112358');
};

module.exports = mongoose.model('User', userSchema);
