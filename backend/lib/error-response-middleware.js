'use strict';

const debug     = require('debug')('todo:errMidware');
const AppError  = require(`${__dirname}/app-error`);
const log       = require(`${__dirname}/log`);

module.exports  = errMidware;

function errMidware(err, req, res, next) {
  debug('errMidware');
  if (AppError.isAppError(err)) {
    log.error(err.internalMessage);
    debug(`err was a valid AppError, status: ${err.statusCode} message: ${err.publicMessage}`);
    return res.status(err.statusCode).send(err.publicMessage);
  } 
  log.error(err.message);
  res.status(500).send('Internal Server Error');
  return next();
}
