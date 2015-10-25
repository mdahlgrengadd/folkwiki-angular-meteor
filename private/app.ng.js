if (Meteor.isClient) {
	angular.module('starter',['angular-meteor']);

	angular.module('starter').controller('ProductsListCtrl', function ($scope, $meteor) {
    $scope.products = $meteor.collection(Products);
  });
}