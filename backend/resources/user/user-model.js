'use strict';

const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const debug     = require('debug')('User');


// TODO: write validator to check if email is a valid email
const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  // lists:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }], 
  creationDate: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  debug('pre user save');
  bcrypt.hash(this.password, 10, (err, hashedPassword) => {
    this.password = hashedPassword;
    next();
  });
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password, bcrypt.genSaltSync(10));
};

userSchema.methods.generateToken = function() {
  return jwt.sign({ _id: this._id }, process.env.JWT_TOKEN_SECRET || '0112358');
};

module.exports = mongoose.model('User', userSchema);
