// angular.module('starter.controllers', [])

// .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
//   $scope.chat = Chats.get($stateParams.chatId);
// });

angular
  .module('starter')
  .controller('ChatDetailCtrl', ChatDetailCtrl);
 

Meteor.startup(function() {
    //abcPlugin = new ABCJS.Plugin();
    //abcPlugin.init(jQuery);

    SC.initialize({
      client_id: '29690ca16f22593e7a6cf615d8fb8e33',
    });

});

function pad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  } 


var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "Don't call this twice without a uniqueId";
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();




function ChatDetailCtrl ($scope, $state, $stateParams, $ionicLoading, $ionicModal, $meteor) {

    $scope.name = "ChatDtlCtrl-SCOPE";

        $scope.enabled = true;
        $scope.info = {
            width: 0,
            height: 0,
            rate: 200
        };


  $scope.buttons = [{
  label: 'a link text',
  icon: 'ion-paper-airplane'
},{
  label: 'another link',
  icon: 'ion-plus'
},{
  label: 'a third link',
  icon: 'ion-paperclip'
}];


  
  console.log("FUXK!");
  console.log($stateParams);
  $scope.chat = $scope.$meteorObject(Products, $stateParams.chatId, false);
  //$scope.products = $meteor.collection(Products);
  $scope.loadingOptions = {
    duration: 3000,
    delay: 0,
    template: '<h3>Please wait...</h3><p>Optimizing score for display</p>',
    noBackdrop: false
  };

  $scope.isLiked = function () {
    return Products.findOne({_id: $stateParams.chatId}).isLikedBy(Meteor.users.findOne({_id:Meteor.userId()}));
  }

  $scope.myRepertoires = $scope.$meteorCollection(Repertoires, false).subscribe("myRepertoires");
  

  $scope.repertoire_name = "";

  $scope.addToRepertoire = function () {
      if ( Meteor.user() ) {


        $ionicModal.fromTemplateUrl('rep-add-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        if(Meteor.user()) {
            $scope.modal.show();
        } else {
          console.log("Not logged in!");
        }
      });
      $scope.openModal = function() {
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
        $state.go('tab.chats');

      };
      //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
        // Execute action
      });






















    }
  }
  $scope.SoundcloudURL = "";

  $scope.createRepertoire = function(title) {
      var doc = Products.findOne({_id: $stateParams.chatId});
      console.log(title);
      doc.like(title);
      console.log("testing repertoire");
      rep = new RepertoireModel({name: title});
      rep.save();
  };


  $scope.showLoading = function() {
    $ionicLoading.show($scope.loadingOptions);
  };

  //abcPlugin.render_options = { 
  //      staffwidth: $scope.info.width-50,
  //      paddingtop: 30,
  //      paddingbottom: 0,
  //      //selectListener: {highlight: function (data) {alert("select!");console.log(data);} }, 
  //      scale: 0.925 

  //    };
  //var doc = Products.find({_id: Router.current().params._id}).fetch()[0];
  //console.log(Router.current().params._id);

  //var doc = Products.find({_id: $stateParams.chatId}).fetch()[0];
  doc = Products.findOne({_id: $stateParams.chatId});
  $scope.docid = doc._id;
  //console.log("DOC is...");
  //console.log(doc);
  //abcPlugin.render_small_screen("#ABCNotation", doc.tagline);

  var query = pad(doc.fwid, 5) + " - " + doc.name; // zeropads the folkwiki id, like is the case on the soundcloud track titles

  SC.get('/tracks', {
            q: query
            }).then(function(tracks) {
                    var embed = SC.oEmbed(tracks[0].permalink_url, { auto_play: false }).then(function(oEmbed) {
                    //console.log('oEmbed response: ', oEmbed);
                    //$("#soundcloud_widget").hide();
                    //$("#soundcloud_widget").html(oEmbed.html);
                    $scope.SoundcloudURL = tracks[0].permalink_url;
                    });

            });

/*
     $(window).on("resize.doResize", function (){
     	$scope.showLoading();
     	waitForFinalEvent(function(){
     		
				    $("#ABCNotation").hide();

				//$scope.windowWidth = $scope.info.width
				    
				 abcPlugin.render_options = { 
				        staffwidth: $scope.info.width-50,
				        paddingtop: 30,
				        paddingbottom: 0,
				        //selectListener: {highlight: function (data) {alert("select!");console.log(data);} }, 
				        scale: 0.925 

				      };
				  var doc = Products.find({_id: $stateParams.chatId}).fetch()[0];
				  //console.log(Router.current().params._id);


				  abcPlugin.render_small_screen("#ABCNotation", doc.tagline);

				  $("#ABCNotation").show();



    }, 1500, "ProductResizeEvent");




       $scope.$apply(function(){
           //do something to update current scope based on the new innerWidth and let angular update the view.
        });
    });

    $scope.$on("$destroy",function (){
         $(window).off("resize.doResize"); //remove the handler added earlier
    });*/


}






angular.module('starter')
    .factory('sizeWatcher', ['$interval', function($interval) {
        return function (element, rate) {
            var self = this;
            (self.update = function() { self.dimensions = [element.offsetWidth, element.offsetHeight]; })();
            self.group = [function() { return self.dimensions[0]; }, function() { return self.dimensions[1]; }];
            self.monitor = $interval(self.update, rate);
            self.cancel = function() { $interval.cancel(self.monitor); };
        }
    }])


    .directive('directive', ['sizeWatcher', function(sizeWatcher) {
        return {
            restrict: 'C',
            scope: {
                width: '=',
                height: '=',
                rate: '='
            },
            link: function($scope, element, attr) {
              $scope.$watch('width', function(new_val, old_val){
                console.log("Something changed! "+new_val);
                console.log("directive-link-scope: " + $scope.name); 
/*                  abcPlugin.render_options = { 
                      staffwidth: new_val-50,
                      paddingtop: 30,
                      paddingbottom: 0,
                      //selectListener: {highlight: function (data) {alert("select!");console.log(data);} }, 
                      scale: 0.925 

                    };
                //var doc = Products.find({_id: Router.current().params._id}).fetch()[0];
                //console.log(Router.current().params._id);

                var doc = Products.find({_id: attr.docid}).fetch()[0];
                abcPlugin.render_small_screen("#ABCNotation", doc.tagline);
*/

              });
                var parent = element[0],
                    watcher, groupWatcher,
                    cancel = function() {
                        if(watcher) watcher.cancel();
                        if(groupWatcher) groupWatcher();
                    },
                    update = function() {
                        cancel();
                        watcher = new sizeWatcher(parent, $scope.rate);
                        $scope.$watchGroup(watcher.group, function(values) {
                            $scope.width = values[0];
                            $scope.height = values[1];
                        });
                    };
                
                $scope.$watch('rate', update);
                $scope.$on('$destroy', cancel);
            }
        }
    }]);