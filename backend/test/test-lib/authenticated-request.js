'use strict';

const debug     = require('debug')('todo:authenticatedRequest');
const _         = require('lodash');
module.exports  = authenticatedRequestTakesRequest;


/**
 * authenticatedRequestTakesRequest - a helper module to make authenticated http requests 
 *  
 * @param  {function} request the chai-http request method
 * @param  {string}   baseUrl the root url to make requests to 
 * @return {function}         a curried function that accepts the endpoint 
 */ 
function authenticatedRequestTakesRequest(requestFunction, baseUrl) {
  debug('authenticatedRequestTakesRequest');
  const request = requestFunction(baseUrl);
  
  /**  
   * authenticatedRequestTakesEndpoint - description  
   *    
   * @param  {string}   endpoint a string describing the endpoint to hit off of the base url
   * @return {function}          a curried function that takes    
   */   
  return function authenticatedRequestTakesEndpoint(endpoint, jwtCookieValue) {
    debug('authenticatedRequestTakesEndpoint');
    // translates between keys on default objects and info needed to call methods on superagent request
    // method is the method on the superagent request object
    // twoArgs is whether it should be called as method(key, options[key]) or just method(options[key])
    const defaultKeyToReqMethod = {
      data:           {
        method:   'send', 
        twoArgs:  false 
      }, 
      cookie:         {
        method:   'set',
        twoArgs:  true
      }, 
      'X-XSRF-TOKEN': {
        method:   'set',
        twoArgs:  true
      }
    };
    
    // defines the default values for superagent requests 
    // see authenticatedRequest below for key meanings
    const defaults  = {
      id:             null, 
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
     * @property  {string}    [id=null]             id to tack onto the endpoint to make requests for a resource by id
     * @return    {object}                          a superagent request object     
     */     
    return function authenticatedRequest(method, done, options = {}) {
      _.defaults(options, defaults);
      
      // dont want to mutate endpoint for subsequent requests
      let urlToHit  = endpoint;
      if (options.id) urlToHit += `/${options.id}`;
      debug(`authenticatedRequest method: ${method}, endpoint: ${urlToHit}`);
      
      // set up the request to hit the endpoint 
      let currentRequest = request[method.toLowerCase()](urlToHit).withCredentials();
      // debug('authenticatedRequest options: ', options);
      
      // If the option is true, call the appropriate method on the request with the corresponding arguments
      keys.forEach((key) => {
        let currentOption = options[key];
        if (currentOption && key !== 'id') {
          let argumentsForCurrentOption = [currentOption];
          if (defaultKeyToReqMethod[key].twoArgs) {
            argumentsForCurrentOption.unshift(key);
          }
          let superagentMethodForOption = defaultKeyToReqMethod[key].method;
          currentRequest[superagentMethodForOption](...argumentsForCurrentOption);
        }
      });
      
      return currentRequest;
    };
  };
  
}
