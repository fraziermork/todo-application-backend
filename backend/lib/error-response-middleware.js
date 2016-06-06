'use strict';

const debug     = require('debug')('errMidware');
const AppError  = require(`${__dirname}/app-error`);
const log       = require(`${__dirname}/log`);

module.exports  = errMidware;

function errMidware(err, req, res, next) {
  debug('errMidware');
  log.error(err.internalMessage);
  
  if (AppError.isAppError(err)) {
    debug(`err was a valid AppError, status: ${err.statusCode} message: ${err.publicMessage}`);
    return res.status(err.statusCode).send(err.publicMessage);
  } 
  
  res.status(500).send('Internal Server Error');
  return next();
}
