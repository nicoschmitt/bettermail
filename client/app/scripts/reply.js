(function() {
    
    var app = angular.module('myApp');
  
    app.controller('replyCtrl', ["$scope", '$http', "$auth", "$location", "$routeParams",
        function ($scope, $http, $auth, $location, $routeParams) {
            var vm = this;
            
            vm.isAuthenticated = $auth.isAuthenticated;
            vm.loading = true;
            vm.sending = false;
            vm.message = "";
            vm.separators = [13, 188];
            
            vm.mail = { id: 0, subject: "", to: [], cc: [], message: "" };

            var renewToken = function() {
                console.log("reneww auth token");
                return $http.get("/auth/renew");
            };
            
            var once = true;
            var handleError = function(resp) {
                vm.loading = false;
                vm.sending = false;
                if (once && resp.status == 401) {
                    once = false;
                    console.log("renew token");
                    renewToken().then(this);
                } else {
                    console.log("error");
                    vm.message = resp.data;
                    console.log(resp.data);
                }
            };
            
            vm.send = function() {
                if (vm.mail.to.length == 0) {
                    vm.message = "add email to send to";
                    return;
                }
                vm.sending = true;
                vm.message = "";

                $http.post("/api/mail/" + vm.mail.id, vm.mail).then(function(resp){
                    vm.sending = false;
                    $location.path("/");
                }, handleError.bind(vm.send));
            };
            
            var loadMail = function() {
                var mail = $routeParams.id;
                $http({method: "OPTIONS", url: "/api/mail/" + mail}).then(function(resp){
                    vm.loading = false;
                    vm.mail.id = resp.data.id;
                    vm.mail.message = "\n" + resp.data.content;
                    vm.mail.subject = resp.data.subject;
                    vm.mail.to = resp.data.to.split(/\s*,\s*/);
                    if (resp.data.cc) vm.mail.cc = resp.data.cc.split(/\s*,\s*/);
                }, handleError.bind(loadMail));
            }
            loadMail();
        }
    ]);
  
}());