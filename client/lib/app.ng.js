// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


var app = angular
  .module('starter', [
    'ionic', 
    // 'starter.controllers',
    'starter.services',
    'angular-meteor',
    'ui.router',
    'ng-mfb',
    'plangular',
    'ng-polymer-elements',
    'abcjs'
    ]);


 
function onReady() {
  angular.bootstrap(document, ['starter'], {
    //strictDi: true
  });
  Meteor.startup(function () {
      console.log("strictDi mode didnt work with ng-abcjs: function $interpolate isnt explicitly declared.")
  });
}
 
if (Meteor.isCordova)
  angular.element(document).on("deviceready", onReady);
else
  angular.element(document).ready(onReady);