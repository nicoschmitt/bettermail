(function() {
    
    var app = angular.module('myApp');
  
    app.controller('homeCtrl', ['$http', "$auth",
        function ($http, $auth) {
            var vm = this;
            
            vm.isAuthenticated = $auth.isAuthenticated;
            
            vm.loading = true;
            vm.message = "";
           
            var handleError = function(resp) {
                vm.loading = false;
                vm.message = resp.data;
                console.log(resp.data);
            };
            
            $http.get("/api/mail").then(function(resp) {
                
            }, handleError);
        }
    ]);
  
}());