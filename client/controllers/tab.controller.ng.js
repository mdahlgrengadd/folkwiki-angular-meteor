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
  .controller('TabCtrl', TabCtrl);
 
function TabCtrl ($scope, $state, $stateParams, $ionicLoading, $ionicModal, $meteor, $ionicSideMenuDelegate) {

 
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

	$scope.SayHallo = function () {
		    $ionicModal.fromTemplateUrl('my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		    if(!Meteor.user()) {
		        $scope.modal.show();
		    } else {
		    	$state.go('tab.profile');
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









	var vm = this;
 
    vm.credentials = {
      email: '',
      password: ''
    };
 
    vm.error = '';
 
    vm.login = function () {
      console.log(vm.credentials);

      $meteor.loginWithPassword(vm.credentials.email, vm.credentials.password).then(
        function () {
        	$scope.modal.hide();
          $state.go('tab.profile');
        },
        function (err) {
        	  $scope.loadingOptions = {
			    duration: 3000,
			    delay: 0,
			    template: '<h3>Login failed!</h3><p>'+ err +'</p>',
			    noBackdrop: false
			  };

			  
			    $ionicLoading.show($scope.loadingOptions);

        }
      );
    };










}