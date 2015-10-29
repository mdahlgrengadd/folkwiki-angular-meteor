// angular.module('starter.controllers', [])

// .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
//   $scope.chat = Chats.get($stateParams.chatId);
// });

angular
  .module('starter')
  .controller('ProfileCtrl', ProfileCtrl);
 

function ProfileCtrl ($scope, $stateParams, $ionicLoading, $ionicModal, $meteor) {

  $scope.mylikes = $scope.$meteorCollection(Like.collection, false).subscribe("myLikes");
}



