/*
 * angular-markdown-directive v0.3.1
 * (c) 2013-2014 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('abcjs', []).
  directive('abcjs', [function () {
    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {
        if (attrs.abcjs) {
          scope.$watch(attrs.abcjs, function (newVal) {
            var html = newVal ? "hELLO!" : '';
            element.html(html);
          });
        } else {
          var html = "HELLO"
          element.html(html);
        }
      }
    };
  }]);