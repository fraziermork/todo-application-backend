'use strict';
/* global angular */



(function() {
  angular.module('taServices')
    .factory('apiRequest', ['$log', '$http', '$window', apiRequest]);
  
  
  
  function apiRequest($log, $http, $window) {
    
    
    /**    
     * apiRequest - a shared service to make api requests to     
     *      
     * @param  {string}   method    the http method to use     
     * @param  {string}   endpoint  the api endpoint to hit     
     * @param  {object}   options   an object with the options      
     * @return {promise}            description     
     */     
    function apiRequest(method, endpoint, options) {
      $log.log('apiRequest');
      
      let requestParams = {
        method:   method.toUpperCase(),
        url:      `http://localhost:3000/${endpoint}`, 
        headers:  {}
      };
      
      // TODO: require lodash and put all the options onto the default? 
      if (options.headers) {
        requestParams.headers = options.headers;
      }
      let authToken = angular.fromJson($window.sessionStorage.getItem('todo-application-authToken'));
      if (authToken) {
        requestParams.headers.Authorization = `Token ${authToken}`;
      }
      $log.log('apiRequest requestParams: ', requestParams);
      return new Promise((resolve, reject) => {
        $http(requestParams)
          .then((res) => {
            if (res.headers.authToken && endpoint === 'login') {
              res.data.authToken = res.headers.authToken;
            }
            return resolve(res.data);
          })
          .catch((err) => {
            $log.error('ERROR in apiRequest: ', err);
            return reject(err);
          });
      });
    }
    return apiRequest;
  }
  
})();
