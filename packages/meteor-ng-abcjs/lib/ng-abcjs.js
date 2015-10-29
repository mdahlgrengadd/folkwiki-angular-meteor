/*
 * angular-abcjs-directive v0.3.1
 * (c) 2015-2016 Martin Dahlgren 
 * License: MIT
 *
 * usage:
 *  <abcjs>
 *  X:1
 *  ...
 *  </abcjs>
 *
 * or:
 * <abcjs abc-src="X:1 ..."></abcjs>
 *
*/


//'use strict';

angular.module('abcjs', [])

  .controller('Ctrl', ['$scope', '$window', '$http', '$sce',
    function($scope, $window, $http, $sce) {
        $scope.name = "CTRL-SCOPE";
        $scope.abcSource = "";
    }
  ])

  .directive('abcjs', function ($interpolate) {
      return {
            restrict: 'E',
            link: link,
            priority: 1,
             scope: {
                abcSource: "@abcSrc"
              },
            controller: 'Ctrl'
          };

    /*
    function compile (tElem, tAttrs) {
      var interpolateFn = $interpolate(tElem.text(), true);
      }
*/
      function link($scope, element, attr){
        tElem = element;

        
        console.log("abcjs-directive-scope = " + $scope.name);
          $scope.$watch(function() { return tElem.text().length + attr.width; }, function (value) {
          console.log("Dont forget to clean up and remove watches");

              abcPlugin = new ABCJS.Plugin();
              abcPlugin.init(jQuery);
              abcPlugin.render_options = { 
                      staffwidth: attr.width-30,
                      paddingtop: 30,
                      paddingbottom: 0,
                      //selectListener: {highlight: function (data) {alert("select!");console.log(data);} }, 
                      scale: 0.925 

              };
          
        var abc = "";
        var hasAbcAttr = attr.abcSrc;

        if(hasAbcAttr)
          abc = attr.abcSrc;
        else
          abc = tElem.text();

          abcPlugin.render_small_screen(tElem, abc);
          tElem.hide(); // hide the abc text
        });


            }


      
    
  });



