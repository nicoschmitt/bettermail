(function() {
    
    var app = angular.module('myApp');
  
    app.controller('meCtrl', ["$scope", '$http', "$auth",
        function ($scope, $http, $auth) {
            var vm = this;
            vm.isAuthenticated = $auth.isAuthenticated;
            
            vm.infos = [];
            $http.get("/api/config/info").then(function(resp) {
                Object.keys(resp.data).forEach(function(k){
                    console.log(resp.data);
                    vm.infos.push({ name: k, value: resp.data[k] });
                });
            });   
        }
    ]);
  
}());
