'use strict';

const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt');
const jwt       = require('jwt');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  email:    { type: String, required: true, unique: true },
  // lists:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }], 
  creationDate: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(20));
  next();
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password, bcrypt.genSaltSync(10));
};

userSchema.methods.generateToken = function() {
  return jwt.sign({ _id: this._id }, process.env.JWT_TOKEN_SECRET || '0112358');
};

module.exports = mongoose.model('User', userSchema);
