(function() {
    
    var app = angular.module('myApp');
  
    app.controller('newCtrl', ["$scope", '$http', "$auth", "$location",
        function ($scope, $http, $auth, $location) {
            var vm = this;
            
            vm.isAuthenticated = $auth.isAuthenticated;
            vm.loading = false;
            vm.message = "";
            vm.separators = [13, 188];
            
            vm.mail = { subject: "", contacts: [], message: "" };
            
            var handleError = function(resp) {
                vm.loading = false;
                vm.message = resp.data;
                console.log(resp.data);
            };
            
            vm.send = function() {
                console.log(vm.mail.contacts);
                if (vm.mail.contacts.length == 0) {
                    vm.message = "add email to send to";
                    return;
                }
                vm.loading = true;
                vm.message = "";

                $http.post("/api/mail", vm.mail).then(function(resp){
                    vm.loading = false;
                    $location.path("/");
                }, handleError);
            };
        }
    ]);
  
}());