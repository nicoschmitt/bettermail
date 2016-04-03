(function() {
    
    var app = angular.module('myApp');
  
    app.controller('viewCtrl', ['$http', "$auth", "$routeParams", "$location",
        function ($http, $auth, $routeParams, $location) {
            var vm = this;
            
            vm.isAuthenticated = $auth.isAuthenticated;
            
            vm.loading = true;
            vm.message = "";
            vm.mail = [];
            
            vm.reply = function() {
                console.log("reply");
            }
            
            vm.delete = function() {
                console.log("delete");
                $http.delete("/api/mail/" + vm.mail.id + "?token=" + vm.mail.msgtoken).then(function(resp) {
                    $location.path("/");
                }, genErrorHandler(vm.delete));
            }
            
           var renewToken = function() {
                console.log("reneww auth token");
                return $http.get("/auth/renew");
            }
            
            var once = true;
            var genErrorHandler = function(func) {
                return function(resp) {
                    vm.loading = false;
                    if (once && resp.status == 401) {
                        once = false;
                        renewToken().then(func);
                    } else {
                        vm.message = resp.data;
                        console.log(resp.data);
                    }
                };
            }
                       
            var getMailDetail = function() {
                var mail = $routeParams.id;
                $http.get("/api/mail/" + mail).then(function(resp) {
                    vm.loading = false;
                    console.log(resp.data);
                    vm.mail = resp.data;
                    vm.mail.from = vm.mail.from.replace(/\<[^\>]*\>/g, "");
                    vm.mail.to = vm.mail.to.replace(/\<[^\>]*\>/g, "");
                }, genErrorHandler(getMailDetail));
            }
            getMailDetail();
        }
    ]);
  
}());