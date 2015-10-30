/*
 * angular-$scope.ABCJS-directive v0.3.1
 * (c) 2015-2016 Martin Dahlgren 
 * License: MIT
 *
 * usage:
 *  <$scope.ABCJS>
 *  X:1
 *  ...
 *  </$scope.ABCJS>
 *
 * or:
 * <$scope.ABCJS abc-src="X:1 ..."></$scope.ABCJS>
 *
*/
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


//'use strict';

angular.module('abcjs', [])

  .controller('Ctrl', ['$scope', '$window', '$http', '$sce',
    function($scope, $window, $http, $sce) {
        $scope.name = "CTRL-SCOPE: "+makeid();
        $scope.abcSource = "";
        $scope.render_classname = "abcrendered";
        $scope.abcdiv = $("<div class='"+$scope.render_classname+"'></div>");

        if (!$scope.ABCJS)
            $scope.ABCJS = {};

        $scope.ABCJS.Plugin = function() {
            var is_user_script = false;
            try {
                is_user_script = $scope.ABCJS_is_user_script;
            } catch (ex) {
            }
          /*
          this.tune = {};
          this.tunebook = {};
          this.engraver_controller = {};
          this.abcParser = {};
          this.paper = {};*/
          this.show_midi = true;//!is_user_script || this.$.browser.mozilla;   // midi currently only works in Firefox, so in the userscript, don't complicate it.
          this.hide_abc = true;
          this.render_before = false;
          this.midi_options = {};
          //this.parse_options = {};
          this.render_options = {};
          
          this.text_classname = "abctext";
          this.auto_render_threshold = 20;
          this.show_text = "show score for: ";
          //this.hide_text = "hide score for: ";
        };

        $scope.ABCJS.Plugin.prototype.init = function(jq) {
            this.$ = jq;
            //var body = jq("body");
          this.errors="";
          //var elems = this.getABCContainingElements(this.$("body"));
          var self = this;
          //var divs = elems.map(function(i,elem){
              console.log("DONT AUTO CONVERT ABC ELEMENTS");
              //return self.convertToDivs(elem);
            //});
          //this.auto_render = (divs.size()<=this.auto_render_threshold);
          //divs.each(function(i,elem){
          //    self.render(elem,self.$(elem).data("abctext"));
          //  });
        };



$scope.ABCJS.Plugin.prototype.render_small_screen = function (contextnode, abcstring) {
   //$scope.abcdiv = this.$("<div class='"+$scope.render_classname+"'></div>");
    //$(".abcrendered").remove(); // clear old render

  // if (this.render_before) {
  //   contextnode.before(myabcdiv);
  // } else {
     //contextnode.after($scope.abcdiv);
  // }
  var self = this;
  try {
    //console.log(abcstring);
    var tunebook = new ABCJS.TuneBook(abcstring);
    var abcParser = new ABCJS.parse.Parse();
    abcParser.parse(tunebook.tunes[0].abc);
    //if (!(tune instanceof ABCJS.data.Tune)) 
    var tune = abcParser.getTune();

    //tune.formatting = {topmargin: 0, botmargin: 0};
    var lines_backup = tune.lines;
    //this.$(contextnode).html("");

    var firstvoice = tune.lines[0].staff[0].voices[0];
    var firstnote = firstvoice[0].startChar;

    for (var j = tune.lines.length - 1; j >= 0; j--) {
        // Add line break after every 2 bars
        var voices = tune.lines[j].staff[0].voices[0];
        for (var i = voices.length - 1; i >= 0; i--) {
          if(voices[i].el_type === "bar" && i > 0) { //dont add line break if the bar element is the first element on a new staff line
            var position = voices[i].endChar;
            if (voices[i].startEnding) { // place [1 ....] [2....] at the beginning of staff on new line, otherwise it renders poorly
                position = voices[i].startChar; 
            } 
            
            var abcstring = [abcstring.slice(0, position), "\n", abcstring.slice(position)].join('');
          }
        };
    };

    var abcheader = abcstring.substring(0, firstnote-1);
    var abcsheet =  abcstring.substring(firstnote).replace(/^\s*[\r\n]/gm, ""); // remove linebreaks because we add or own later...

      arr = abcsheet.split("\n");

      var str2 = "";

      for (var i = 0; i <= arr.length - 2;  i=i+2) {
        str2 += arr[i] + arr[i+1] + "\n";
      };

      
         
    var reformattedAbc = abcheader + "\n" + str2;
    //console.log("Reformatted------------\n"+reformattedAbc);

    tunebook = new ABCJS.TuneBook(reformattedAbc);
    abcParser = new ABCJS.parse.Parse();
    abcParser.parse(tunebook.tunes[0].abc);
    //if (!(tune instanceof ABCJS.data.Tune)) 
    tune = abcParser.getTune();
    console.log(tune);
    tune.metaText = {}; // clear all metatext :-)

    var doPrint = function() {
  try {
    var paper = Raphael($scope.abcdiv.get(0), 800, 400);
    var engraver_controller = new ABCJS.write.EngraverController(paper,self.render_options);
    engraver_controller.engraveABC(tune);
  } catch (ex) { // f*** internet explorer doesn't like innerHTML in weird situations
    // can't remember why we don't do this in the general case, but there was a good reason
    $scope.abcdiv.remove();
    $scope.abcdiv = $("<div class='"+$scope.render_classname+"'></div>");
    paper = Raphael($scope.abcdiv.get(0), 800, 400);
    //engraver_controller = new ABCJS.write.EngraverController(paper);
    //engraver_controller.engraveABC(tune);
    engraver_controller = new ABCJS.write.Printer(paper);
    engraver_controller.printABC(tune);
    contextnode.html($scope.abcdiv);

  }

      };

    doPrint();

    


    } catch (e) {
    this.errors+=e;
    console.log(this.errors);
   }
};

$scope.abcPlugin = new $scope.ABCJS.Plugin();
console.log("SCOPE ABC PLUGIN");



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
          // compile: function(element, attributes){
                  

          //        return {
          //            pre: function(scope, element, attributes, controller, transcludeFn){
         
          //            },
          //            post: function($scope, element, attributes, controller, transcludeFn){
          //                 //element.after($scope.abcdiv);
          //                 //console.log($scope.abcdiv);
          //            }
          //        }
          //    },
            controller: 'Ctrl'
          };

    /*
    function compile (tElem, tAttrs) {
      var interpolateFn = $interpolate(tElem.text(), true);
      }
*/
      function link($scope, element, attr){
        tElem = element;
        tElem.after($scope.abcdiv);  
        $scope.abcPlugin.init(angular.element);
        
        console.log("$scope.ABCJS-directive-scope = " + $scope.name);
          $scope.$watch(function() { return tElem.text().length + attr.width; }, function (value) {
          console.log("Dont forget to clean up and remove watches");

              
              
              $scope.abcPlugin.render_options = { 
                      staffwidth: attr.width,
                      paddingtop: 30,
                      paddingbottom: 150,
                      //selectListener: {highlight: function (data) {alert("select!");console.log(data);} }, 
                      scale: 0.925 

              };
          
        var abc = "";
        var hasAbcAttr = attr.abcSrc;

        if(hasAbcAttr)
          abc = attr.abcSrc;
        else
          abc = tElem.text();

          $scope.abcPlugin.render_small_screen(tElem, abc);
          tElem.hide(); // hide the abc text
        });


            }


      
    
  });



