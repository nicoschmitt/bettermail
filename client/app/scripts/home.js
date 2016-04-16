(function() {
    
    var app = angular.module('myApp');
  
    app.controller('homeCtrl', ['$http', "$auth", "$location",
        function ($http, $auth, $location) {
            var vm = this;
            
            vm.isAuthenticated = $auth.isAuthenticated;
            
            vm.loading = true;
            vm.message = "";
            vm.mails = [];
            vm.pages = {};
            
            vm.open = function(mail) {
                $location.path("/View/" + mail.id);
            };

            var renewToken = function() {
                console.log("reneww auth token");
                return $http.get("/auth/renew");
            };
                       
            var once = true;
            var handleError = function(resp) {
                vm.loading = false;
                if (once && resp.status == 401) {
                    once = false;
                    renewToken().then(getMails);
                } else {
                    vm.message = resp.data;
                    console.log(resp.data);
                }
            };
            
            var getMails = function() {
                // var uniq = new Date().getTime();
                // $http.get("/api/mail?" + uniq).then(function(resp) {
                $http.get("/api/mail?" + uniq).then(function(resp) {
                    vm.loading = false;
                    vm.pages = resp.data.pages;
                    vm.mails = resp.data.mails;
                }, handleError);   
            };
            
            if (vm.isAuthenticated()) getMails();
        }
    ]);
  
}());