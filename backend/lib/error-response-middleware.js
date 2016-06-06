'use strict';

const debug     = require('debug')('ERROR:');
const AppError  = require(`${__dirname}/app-error`);
const log       = require(`${__dirname}/log`);

module.exports  = errMidware;

function errMidware(err, req, res, next) {
  debug('errMidware');
  log.error(err.message);
  
  if (AppError.isAppError(err)) {
    debug('err was a valid AppError');
    return res.status(err.status).send(err.publicMessage);
  } 
  
  res.status(500).send('Internal Server Error');
  return next();
}
