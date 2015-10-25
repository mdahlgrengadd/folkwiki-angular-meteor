angular
  .module('starter')
  .config(config);
 
function config ($stateProvider, $urlRouterProvider) {
  $stateProvider
 
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'client/templates/tabs.ng.html'
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
      .state('tab.login', {
      url: '/login',
      views: {
        'tab-login': {
          templateUrl: 'client/users/views/login.ng.html',
          controller: 'LoginCtrl as vm'
        }
      },

    })

    .state('tab.register', {
      url: '/register',
      views: {
        'tab-register': {
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
  $urlRouterProvider.otherwise('/tab/chats');
}