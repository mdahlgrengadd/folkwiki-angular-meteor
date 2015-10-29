angular
  .module('starter')
  .config(config);
 
function config ($stateProvider, $urlRouterProvider) {
  $stateProvider
 
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'client/templates/tabs.ng.html',
      controller: 'TabCtrl as vm'

    })

    .state('tab2', {
      url: '/tab2',
      abstract: true,
      templateUrl: 'client/templates/tabs2.ng.html',
      controller: 'TabCtrl'

    })

 
    .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'client/templates/tab-chats.ng.html',
          controller: 'ChatsCtrl'
        }
      }
    })

    .state('tab.profile', {
      url: '/profile',
      views: {
        'tab-profile': {
          templateUrl: 'client/templates/profile.ng.html',
          controller: 'ProfileCtrl'
        }
      }
    })

      .state('tab2.login', {
      url: '/login',
      views: {
        'tab2-login': {
          templateUrl: 'client/users/views/sidebar.ng.html',
          controller: 'LoginCtrl as vmx'
        }
      },

    })

    .state('tab2.register', {
      url: '/register',
      views: {
        'tab2-register': {
          templateUrl: 'client/users/views/register.ng.html',
          controller: 'RegisterCtrl as vm'
        }
      },

    })

    .state('resetpw', {
      url: '/resetpw',
      templateUrl: 'client/users/views/reset-password.ng.html',
      controller: 'ResetCtrl',
      controllerAs: 'rpc'
    })
    .state('logout', {
      url: '/logout',
      resolve: {
        "logout": function($meteor, $state) {
          return $meteor.logout().then(function(){
            $state.go('parties');
          }, function(err){
            console.log('logout error - ', err);
          });
        }
      }
    })

    .state('tab.profile-detail', {
      url: '/profile/:chatId',
      views: {
        'tab-profile': {
          templateUrl: 'client/templates/chat-detail.ng.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })


    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'client/templates/chat-detail.ng.html',
          controller: 'ChatDetailCtrl'
        }
      }
    });
 
  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/tab/chats');
}