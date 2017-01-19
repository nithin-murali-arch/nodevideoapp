app.directive('pressEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.pressEnter);
                });

                event.preventDefault();
            }
        });
    };
})
.directive('tileRenderer', ['$location', function($location){
    return {
        restrict: 'E',
        template: 'templates/tilerender-template.html',
        scope: {
            data: '='
        },
        controller: ['$scope', '$location', function($scope, $location){
            $scope.viewVideo = function(id){
                $location.path('watch/' + id);
            }
        }]
    }
}]);