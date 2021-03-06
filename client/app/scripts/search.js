(function() {
    
    var app = angular.module('myApp');
  
    app.controller('searchCtrl', ['$http', "$auth", "$location",
        function ($http, $auth, $location) {
            var vm = this;
            
            vm.isAuthenticated = $auth.isAuthenticated;
            
            vm.loading = false;
            vm.message = "";
            vm.search = { sender: "", subject: "" };
            vm.mails = [];
            vm.pages = { current: 0, max: 0, last: 0 };
            vm.searchid = "";
            
            vm.open = function(mail) {
                $location.path("/View/" + mail.id);
            };
            
            vm.dosearch = function() {
                vm.mails = [];
                vm.pages = { current: 0, max: 0, last: 0 };
                vm.loading = true;
                $http.post("/api/mail/search", vm.search).then(function(resp) {
                    vm.loading = false;
                    vm.pages = resp.data.pages;
                    vm.mails = resp.data.mails;
                    vm.searchid = resp.data.searchid;
                }, handleError.bind(vm.dosearch));
            };

            vm.switchPage = function(page) {
                if (vm.loading) return;
                getPage(page);
            };
            
            var renewToken = function() {
                console.log("renew token");
                return $http.get("/auth/renew");
            };
                       
            var once = true;
            var handleError = function(resp) {
                vm.loading = false;
                if (once && resp.status == 401) {
                    once = false;
                    renewToken().then(this);
                } else {
                    console.log("error");
                    vm.message = resp.data;
                    console.log(resp.data);
                }
            };
            
            var getPage = function(page) {
                vm.loading = true;
                $http.get("/api/mail/search/" + page + "?searchid=" + vm.searchid).then(function(resp) {
                    vm.loading = false;
                    vm.pages = resp.data.pages;
                    vm.mails = resp.data.mails;
                }, handleError.bind(getPage));  
            }
        }
    ]);
  
}());