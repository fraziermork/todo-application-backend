'use strict';


module.exports = request;

/**
 * request - prefixes superagent with a base url and switches it to use 
 *  
 * @param  {type} baseUrl the root url for the api 
 * @return {type}         returns a wrapper for superagent 
 */ 
function request(baseUrl) {
  
  const SARequest = require('superagent-use');
  const SAPrefix  = require('superagent-prefix');
  const SAPromise = require('superagent-promise-plugin');
  SARequest.use(SAPrefix(baseUrl));
  SARequest.use(SAPromise);
  return SARequest;
}
// const superagent = require('superagent');
// 
// module.exports = returnRequest;
// 
// function returnRequest() {
//   
//   return function request() {
//     
//   }
//   
// }
