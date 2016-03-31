(function() {
    
    var app = angular.module('myApp');
  
    app.controller('addCtrl', ["$scope", '$http', "$auth",
        function ($scope, $http, $auth) {
            var vm = this;
            
            vm.isAuthenticated = $auth.isAuthenticated;
            vm.loading = false;
            vm.message = "";
            vm.pin = { title: "", url: "" };
            
            var handleError = function(resp) {
                vm.loading = false;
                vm.message = resp.data;
                console.log(resp.data);
            };
            
            vm.addPin = function() {
                vm.loading = true;
                vm.message = "";
                
                $http.post("/api/pin", vm.pin).then(function(resp){
                    vm.loading = false;
                    vm.pin = { title: "", url: "" };
                    $.snackbar({ content: "Pin added." });
                }, handleError);
            };
        }
    ]);
  
}());