(function() {
    
    var app = angular.module('myApp');
    
    app.directive("paging", function () {
        return {
            restrict: 'E',
            scope: {
                current: "=",
                pages: "=",
                pagingAction: '&'
            },
            link: link,
            templateUrl: "/app/views/pagination.html"
        };
    });
    
    function gotoPage(scope, page) {
        scope.current = page;
        scope.pagingAction({page: page});
    }
    
    function previous(scope) {
        if (scope.current > 1) {
            gotoPage(scope, scope.current - 1);
        }
    }
    
    function next(scope) {
        if (scope.current < scope.pages) {
            gotoPage(scope, scope.current + 1);
        }
    }
    
    function action(scope) {
        if (scope.current == this.page) return;
        
        gotoPage(scope, this.page);
    }
    
    function link(scope, element, attrs) {
        scope.$watchCollection('[current, pages]', function () {
            if (!scope.pages || scope.pages <= 1) return;
            
            var items = [];
            var from, to;
            if (scope.current + 4 < scope.pages) {
                from = Math.max(scope.current - 4, 1);
                to = Math.min(scope.pages, from + 9);
            } else {
                from = Math.max(scope.pages - 9, 1);
                to = scope.pages;
            } 
            for (var i = from; i <= to; i++) {
                var item = {
                    title: i,
                    page: i,
                    liClass: i == scope.current ? "active": ""
                };
                item.action = action.bind(item, scope);
                items.push(item);
            }
            
            scope.previous = previous;
            scope.next = next;
            scope.items = items;
        });
    }
    
}());