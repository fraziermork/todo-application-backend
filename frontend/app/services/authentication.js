'use strict';
/* global angular */

(function() {
  angular.module('taServices')
    .factory('userManager', ['$log', '$window', 'apiRequest',  userManager]);
  
  
  
  function userManager($log, $window, apiRequest) {
    const userManager = {};
    userManager.logIn = logIn;
    userManager.error = null;
    
    
    function logIn(username, password) {
      $log.info('userManager logIn');
      
      let basicAuthString = $window.btoa(`${username}:${password}`);
      
      apiRequest('GET', '/login', { Authorization: `Basic ${basicAuthString}` })
        .then((res) => {
          $log.log('Success in logIn');
          // store auth token 
          // grab user properties and put them somewhere 
          // move to next page
          
        })
        .catch((err) => {
          userManager.error = err;
        });
    }
    
    return userManager;
  }
  
})();
