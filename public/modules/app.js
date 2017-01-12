var app = angular.module('VideoApp', []);

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
    })
    .when('/login', {
        templateUrl: 'templates/login.html',
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

app.controller('LoginController', ['$scope', function($scope){
    $scope.login = true;
    var loginConfig = {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            dataType: 'json',
            url: 'login',
            data: $scope.login
        };
    
}]);