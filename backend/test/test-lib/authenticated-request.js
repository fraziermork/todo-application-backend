'use strict';

const debug     = require('debug')('todo:authenticatedRequest');
const _         = require('lodash');
module.exports  = authenticatedRequestTakesRequest;


/**
 * authenticatedRequestTakesRequest - a helper module to make authenticated http requests 
 *  
 * @param  {function} request the chai-http request method
 * @param  {string}   baseurl the root url to make requests to 
 * @return {function}         a curried function that accepts the endpoint 
 */ 
function authenticatedRequestTakesRequest(requestFunction, baseurl) {
  debug('authenticatedRequestTakesRequest');
  let request = requestFunction(baseurl);
  
  
  /**  
   * authenticatedRequestTakesEndpoint - description  
   *    
   * @param  {string}   endpoint a string describing the endpoint to hit off of the base url
   * @return {function}          a curried function that takes    
   */   
  return function authenticatedRequestTakesEndpoint(endpoint, jwtCookieValue) {
    debug('authenticatedRequestTakesEndpoint');
    // default params for requests
    // key is the header name or just a description if oneArg is true
    // value is what to send 
    // method is the method on the superagent request object
    const defaultKeyToReqMethod = {
      cookie:         {
        method:   'set',
        twoArgs: true
      }, 
      data:           {
        method:   'send', 
        twoArgs: false 
      }, 
      'X-XSRF-TOKEN': {
        method:   'set',
        twoArgs: true
      }
    };
    const defaults  = {
      data:           null,
      cookie:         `XSRF-TOKEN=${jwtCookieValue}`,
      'X-XSRF-TOKEN': jwtCookieValue
    };
    const keys      = Object.keys(defaults);
    
    /**    
     * authenticatedRequest - description    
     *      
     * @param     {string}    method                a string indicating the http method     
     * @param     {function}  done                  the mocha done method     
     * @param     {object}    [options={}]          options to pass in to make the request
     * @property  {boolean}   [cookie=true]         whether to set the cookie header XSRF-TOKEN=jwtCookieValue
     * @property  {boolean}   [X-XSRF-TOKEN=true]   whether to set the header X-XSRF-TOKEN to jwtCookieValue
     * @property  {object}    [data=null]           request body
     * @return    {object}                          a superagent request       
     */     
    return function authenticatedRequest(method, done, options = {}) {
      debug(`authenticatedRequest method: ${method}, endpoint: ${endpoint}`);
      _.defaults(options, defaults);
      let currentRequest = request[method.toLowerCase()](endpoint).withCredentials();
      debug('Request options: ', options);
      keys.forEach((key) => {
        let currentOption = options[key];
        if (currentOption) {
          let argumentsForCurrentOption = [currentOption];
          if (defaultKeyToReqMethod[key].twoArgs) {
            argumentsForCurrentOption.unshift(key);
          }
          let superagentMethodForOption = defaultKeyToReqMethod[key].method;
          currentRequest[superagentMethodForOption](...argumentsForCurrentOption);
        }
      });
      console.log(currentRequest);
      return currentRequest;
    };
  };
  
}
