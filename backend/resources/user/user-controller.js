'use strict';

const jwt                 = require('jsonwebtoken');
const debug               = require('debug')('userCtrl');
const User                = require(`${__dirname}/user-model`);
const AppError            = require(`${__dirname}/../../lib/app-error`);

const userCtrl            = module.exports = {};
userCtrl.newUser          = newUser;
userCtrl.findByUsername   = findByUsername;
userCtrl.findByAuthToken  = findByAuthToken;
userCtrl.updateUserLists  = updateUserLists;

/**
 * newUser - creates a new user in the database, doesn't need to populate
 *  
 * @param  {object} reqBody the body of an incoming post request to /new-account 
 * @return {promise}        a promise that resolves with the user or rejects with an appError 
 */ 
function newUser(reqBody) {
  debug('newUser called');
  return new Promise((resolve, reject) => {
    if (!reqBody.username || !reqBody.password || !reqBody.email) {
      debug('incorrect credentions provided, rejecting');
      return reject(new AppError(400, `Either username (${reqBody.username}) or password (${reqBody.password}) or email (${reqBody.email}) not provided.`));
    }
    
    // Ensure that only the desired info gets through 
    let userInfo = { 
      username: reqBody.username,
      password: reqBody.password,
      email:    reqBody.email
    };
    
    // TODO: check the error type to determine if it failed validation or if it was a duplicate
    User.create(userInfo, (err, user) => {
      debug('user create callback');
      if (err) {
        debug('error creating user, rejecting', err);
        return reject(new AppError(400, err));
      } 
      debug('user created, resolving');
      return resolve(user);
    });
  });
}



/**
 * findByUsername - finds a user by username, checks password, then resolves w/ user
 *  
 * @param  {string} username description 
 * @param  {string} password description 
 * @return {promise}          a promise that resolves with mongo document of the user or rejects with an appError 
 */ 
function findByUsername(username, password) {
  debug('findByUsername');
  return new Promise((resolve, reject) => {
    User.findOne({ username })
    .populate('lists')
    .exec((err, user) => {
      debug('User findOne callback');
      if (err || !user || !user.comparePassword(password)) {
        debug('incorrect password');
        return reject(new AppError(401, err || 'incorrect username or password'));
      }
      return resolve(user);
    });
  });
}

function findByAuthToken(token) {
  debug('findByAuthToken');
  return new Promise((resolve, reject) => {
    let decoded = null;
    try {
      decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET || '0112358');
      debug('auth token parsed');
    } catch (err) {
      debug('failed to parse authorization token');
      return reject(new AppError(401, 'failed to parse authorization token'));
    }
    
    User.findById(decoded._id)
      .populate('lists')
      .exec((err, user) => {
        if (err || !user) {
          debug(`failure in find user by id err: ${err}, user: ${user}`);
          return reject(new AppError(401, 'No user exists with that id'));
        }
        debug('resolving with user');
        return resolve(user);
      });
  });
}




/**
 * updateUserLists - Adds or removes references to lists from a user document
 *  
 * @param  {string}   userId      the _id of the lists owner 
 * @param  {string}    listId     the _id of a list 
 * @param  {boolean}  removeFlag  whether to remove the list id (pull from document) from the user or not
 * @return {promise}              a promise that resolves with the user or rejects with an app error 
 */ 
function updateUserLists(userId, listId, removeFlag) {
  debug('updateUserLists');
  return new Promise((resolve, reject) => {
    let update        = {};
    let operation     = removeFlag ? '$set' : '$push'; 
    update[operation] = { lists: listId };
    
    User.findOneAndUpdate({ _id: userId }, update)
      .then((user) => {
        debug('updateUserLists then');
        return resolve(user);
      })
      .catch((err) => {
        debug('updateUserLists catch');
        return reject(new AppError(404, err));
      });
  });
}
