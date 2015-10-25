angular
//   .module('starter')
//   .controller('ChatsCtrl', ChatsCtrl);

// function ChatsCtrl ($scope, Chats) {
//   // With the new view caching in Ionic, Controllers are only called
//   // when they are recreated or on app start, instead of every page change.
//   // To listen for when this page is active (for example, to refresh data),
//   // listen for the $ionicView.enter event:
//   //
//   //$scope.$on('$ionicView.enter', function(e) {
//   //});

//   $scope.chats = $scope.$meteorCollection(Chats, false);
//   $scope.remove = function(chat) {
//     Chats.remove(chat);
//   };
// };

  .module('starter')
  .controller('ChatsCtrl', ChatsCtrl);
 
function ChatsCtrl ($scope) {
  $scope.chats = $scope.$meteorCollection(Products, false);
 
  $scope.remove = remove;
 
  ////////////
 
  function remove (chat) {
    $scope.chats.remove(chat);
  }
}