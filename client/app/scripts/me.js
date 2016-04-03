(function() {
    
    var app = angular.module('myApp');
  
    app.controller('meCtrl', ["$scope", '$http', "$auth",
        function ($scope, $http, $auth) {
            var vm = this;
            vm.isAuthenticated = $auth.isAuthenticated;
        }
    ]);
  
}());
