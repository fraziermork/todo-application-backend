'use strict';
/* global angular */

(function() {
  
  const app = angular.module('Todo-Application', ['ngRoute', 'taServices', 'taEntry']);
  app.controller('MainController', ['$log', MainController]);
  app.config(['$routeProvider', '$locationProvider', mainRouter]);
  
  function mainRouter($routeProvider, $locationProvider) {
    $routeProvider 
    
      .when('/login', {
        controller:   'EntryController',
        controllerAs: 'entryCtrl',
        templateUrl:  'entry/entry-view.html'
      })
      
      .otherwise('/login');
      
    
  }
  
  
  
  function MainController($log) {
    const vm        = this;
    vm.test         = 'testing';
    
  }
  
})();
