(function() {
    var app = angular.module('myApp');
  
    app.controller('userWallCtrl', ["$rootScope", '$http', "$auth", "$routeParams",
        function ($rootScope, $http, $auth, $routeParams) {
            var vm = this;
            
            vm.isAuthenticated = $auth.isAuthenticated;
            
            vm.loading = true;
            vm.message = "";
            vm.images = [];
            vm.editMode = vm.isAuthenticated() && ($rootScope.currentUser._id == $routeParams.userid);
            
            vm.imgLoaded = {
                fail: function(instance) {
                   angular.element(instance.images[0].img).attr("src", "/img/placeholder.png");
                }
            };
            
            vm.remove = function(image) {
                $http.delete("/api/pin/" + image._id).then(function(resp){
                    for(var i = vm.images.length - 1; i >= 0; i--) {
                        if (vm.images[i]._id == image._id) vm.images.splice(i, 1);
                    }
                }, handleError);
            };
            
            var handleError = function(resp) {
                vm.loading = false;
                vm.message = resp.data;
                console.log(resp.data);
            };
            
            var userid = $routeParams.userid;
            if (userid == "me") userid = $rootScope.currentUser._id;
            $http.get("/api/pin/" + userid).then(function(resp) {
                console.log(resp.data.length + " images.");
                vm.loading = false;
                vm.images = resp.data.map(i => {
                   i.when = moment(i.when).fromNow();
                   return i; 
                });
            }, handleError);
        }
    ]);
  
}());