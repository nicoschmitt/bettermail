(function() {
    var app = angular.module('myApp');
  
    app.controller('loginCtrl', ["$rootScope", '$http', "$location", "$auth", "$window",
        function ($rootScope, $http, $location, $auth, $window) {
            var vm = this;
            
            vm.user = { name: "", password: "" };
            vm.message = "";
            
            vm.login = function() {
                $auth.login(vm.user)
                .then(function(response) {
                    $rootScope.currentUser = response.data.user;
                    $window.localStorage.currentUser = JSON.stringify(response.data.user);            
                    $location.path('/');
                })
                .catch(function(error) {
                    if (error.error) vm.message = error.error;
                    else if (error.data.message) vm.message = error.data.message;
                    else if (error.statusText) vm.message = error.statusText;
                    else vm.message = error;
                    console.log(vm.message);
                });
            };
        }
    ]);
  
}());