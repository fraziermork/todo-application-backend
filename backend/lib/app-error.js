'use strict';

const debug = require('debug')('AppError');

module.exports = AppError;

// Translation key between server error codes and public error messages
const publicErrorMessageKeyByCode = {
  400: 'Bad Request',
  401: 'Not Authorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error'
};



/**
 * AppError - Contructor function
 *  
 * @param  {string} statusCode        description 
 * @param  {string} internalMessage   description 
 * @param  {string} publicMessage     description 
 */ 
function AppError(statusCode, internalMessage, publicMessage) {
  Error.call(this);
  this.internalMessage  = internalMessage;
  this.statusCode       = statusCode;
  this.publicMessage    = publicMessage;  
}

// Build the AppError prototype and attach constructor's methods
AppError.prototype      = Object.create(Error.prototype);
AppError.newAppError    = newAppError;
AppError.isAppError     = isAppError; 


/**
 * returnAppError - returns a new AppError with the message, status code, and appropriate public error message 
 *  
 * @param  {type} code    description 
 * @param  {type} message description 
 * @return {type}         description 
 */ 
function newAppError(code, message) {
  let publicErrorMessage = publicErrorMessageKeyByCode[code];
  debug(`newAppError, CODE: ${code}, MESSAGE: ${message}`);
  
  if (!code || !message || !publicErrorMessage) {
    debug(`newAppError called with incorrect arguments, defaulting to status 500. SUPPLIED VALUES: CODE ${code} MESSAGE ${message}`);
    code = 500;
    publicErrorMessage = publicErrorMessageKeyByCode[code];
  }
  
  return new AppError(code, message, publicErrorMessage);
}

/** 
* isAppError - returns a boolean describing whether an error is an instance of the constructor above
* 
* @param  {object}  err   the error to check 
* @return {boolean}       flag for whether it is an instance of the constructor above (true) or not (false)
*/
function isAppError(err) {
  debug('isAppError ', err instanceof AppError);
  return err instanceof AppError;
}


// TODO: refactor to eliminate newAppError method, just use new, that way line number and file name of origin are preserved
// TODO: figure out how to handle 401 responses, they require https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_Error
// need to figure out what 'realm' to use http://stackoverflow.com/questions/12701085/what-is-the-realm-in-basic-authentication
