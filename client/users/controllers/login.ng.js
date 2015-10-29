angular.module("starter").controller("LoginCtrl", ['$meteor', '$state',
  function ($meteor, $state) {
    var vmx = this;
    vmx.abcData = $meteor.collection(Products)[0].tagline;
    vmx.credentials = {
      email: '',
      password: ''
    };
 
    vmx.error = '';
 
    vmx.login = function () {
      console.log(vmx.credentials);

      $meteor.loginWithPassword(vmx.credentials.email, vmx.credentials.password).then(
        function () {
          $state.go('parties');
        },
        function (err) {
          vmx.error = 'Login error - ' + err;
        }
      );
    };
  }
]);