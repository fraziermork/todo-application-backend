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
function AppError(statusCode, internalMessage) {
  Error.call(this);
  this.internalMessage  = internalMessage;
  this.statusCode       = statusCode;
  this.publicMessage    = publicErrorMessageKeyByCode[this.statusCode];
  
  if (!statusCode || !internalMessage || !publicErrorMessageKeyByCode[statusCode]) {
    debug(`AppError called with incorrect arguments, defaulting to status 500. SUPPLIED VALUES: CODE ${statusCode} MESSAGE ${internalMessage}`);
    this.statusCode     = 500;
    this.publicMessage  = publicErrorMessageKeyByCode[this.statusCode];
  }
}

// Build the AppError prototype and attach constructor's methods
AppError.prototype      = Object.create(Error.prototype);
AppError.isAppError     = isAppError; 

/** 
* isAppError - returns a boolean describing whether an error is an instance of the constructor above
* 
* @param  {object}  err   the error object to check 
* @return {boolean}       whether it is an instance of AppError or not
*/
function isAppError(err) {
  debug('isAppError ', err instanceof AppError);
  return err instanceof AppError;
}



// TODO: figure out how to handle 401 responses, they require https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_Error
// need to figure out what 'realm' to use http://stackoverflow.com/questions/12701085/what-is-the-realm-in-basic-authentication
