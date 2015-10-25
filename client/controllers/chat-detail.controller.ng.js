// angular.module('starter.controllers', [])

// .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
//   $scope.chat = Chats.get($stateParams.chatId);
// });

angular
  .module('starter')
  .controller('ChatDetailCtrl', ChatDetailCtrl);
 

Meteor.startup(function() {
    abcPlugin = new ABCJS.Plugin();
    abcPlugin.init(jQuery);
});


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




function ChatDetailCtrl ($scope, $stateParams, $ionicLoading, $meteor) {
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

  $scope.showLoading = function() {
    $ionicLoading.show($scope.loadingOptions);
  };

  abcPlugin.render_options = { 
        staffwidth: $(window).width()-50,
        paddingtop: 30,
        paddingbottom: 0,
        //selectListener: {highlight: function (data) {alert("select!");console.log(data);} }, 
        scale: 0.925 

      };
  //var doc = Products.find({_id: Router.current().params._id}).fetch()[0];
  //console.log(Router.current().params._id);

  //var doc = Products.find({_id: $stateParams.chatId}).fetch()[0];
  doc = Products.findOne({_id: $stateParams.chatId});
  console.log("DOC is...");
  console.log(doc);
  abcPlugin.render_small_screen("#ABCNotation", doc.tagline);

     $(window).on("resize.doResize", function (){
     	$scope.showLoading();
     	waitForFinalEvent(function(){
     		
				    $("#ABCNotation").hide();

				$scope.windowWidth = $(window).width();
				    
				 abcPlugin.render_options = { 
				        staffwidth: $scope.windowWidth-50,
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
    });


}