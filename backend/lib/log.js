'use strict';

const chalk = require('chalk');
const debug = require('debug')('todo:log');

// Translation key between log method and chalk color
const logMethodToColor = {
  warn:     chalk.bold.yellow,
  error:    chalk.bold.red,
  success:  chalk.bold.green,
  data:     chalk.cyan
};


/**
 * createLogFunction - This returns a function that logs messages beginning with the prefix to the console with the given method
 *  
 * @param  {string} prefix    the prefix to be used for all logs made with this method 
 * @param  {string} method    a method on the console object
 * @param  {string} name      the name of the log method
 */ 
function createLogFunction(prefix, method, name) {
  method = method || 'log';
  
  return function() {
    debug(`${name} log method called`);
    // Build a real array from the arguments object
    let args = Array.prototype.slice.call(arguments);
    
    // Attach the prefix and log it 
    args.unshift(prefix);
    if (process.env.ANGULAR_TODO_LOG_ERRORS) {
      console[method].apply(null, args);
    }
  };
}


module.exports = {
  warn:     createLogFunction(logMethodToColor.warn('WARNING: '), 'error', 'warn'),
  error:    createLogFunction(logMethodToColor.error('ERROR: '), 'error', 'error'),
  success:  createLogFunction(logMethodToColor.success('SUCCESS: '), 'log', 'log'),
  data (whatsBeingLogged, itsValue) {
    console.log(logMethodToColor.data(`${whatsBeingLogged}: `), itsValue);
  }
};
