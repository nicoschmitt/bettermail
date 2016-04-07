/* global angular */
(function() {
    var app = angular.module('myApp', [ 'ngRoute', "satellizer", "ngMaterial", "ngSanitize" ]);
  
    app.config(['$routeProvider','$httpProvider', '$authProvider',
        function ($routeProvider, $httpProvider, $authProvider) {
   
            $routeProvider.when("/Home", {
                templateUrl: "/app/views/home.html",
                controller: "homeCtrl",
                controllerAs: "vm"

            }).when("/Login", {
                templateUrl: "/app/views/login.html",
                controller: "loginCtrl",
                controllerAs: "vm",
                
            }).when("/Me", {
                templateUrl: "/app/views/me.html",
                controller: "meCtrl",
                controllerAs: "vm",

            }).when("/View/:id", {
                templateUrl: "/app/views/view.html",
                controller: "viewCtrl",
                controllerAs: "vm",
                
            }).when("/New", {
                templateUrl: "/app/views/new.html",
                controller: "newCtrl",
                controllerAs: "vm",
                
            }).when("/Reply/:id", {
                templateUrl: "/app/views/reply.html",
                controller: "replyCtrl",
                controllerAs: "vm",
                
            }).otherwise({ redirectTo: "/Home" });
            
   }]);
   
    app.run(["$rootScope", "$window", "$auth", "$http", function($rootScope, $window, $auth, $http) {
        if ($auth.isAuthenticated()) {
            if ($window.localStorage.currentUser) {
                try {
                    $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
                } catch(e) {}
            }
        }
    }]);
   
  fetchData().then(launchApplication);

  function fetchData() {
    var initInjector = angular.injector(["ng"]);
    var $http = initInjector.get("$http");
    return $http.get("/api/config").then(function(resp){
      //app.constant("githubAppId", resp.data.githubAppId);
    });
  };

  function launchApplication() {
    angular.element(document).ready(function() {
        angular.bootstrap(document, ["myApp"]);
    });
  };
  
}());