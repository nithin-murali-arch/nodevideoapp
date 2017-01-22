var app = angular.module('videoApp', []);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/', {
        templateUrl: 'templates/home.html',
        controller: 'HomeController'
    })
    .when('/watch', {
        templateUrl: 'templates/watch.html',
        controller: 'WatchController'
    })
    .when('/create', {
        templateUrl: 'templates/create.html',
        controller: 'CreateController'
    })
    .when('/search', {
        templateUrl: 'templates/search.html',
        controller: 'SearchController'
    });
}]);

app.controller('HomeController', ['$scope', function($scope){
    $scope.ui = {};
}]);

app.controller('WatchController', ['$scope', function($scope){
    $scope.ui = {};
}]);

app.controller('CreateController', ['$scope', function($scope){
    $scope.ui = {};
}]);

app.controller('SearchController', ['$scope', function($scope){
    $scope.ui = {};
}]);