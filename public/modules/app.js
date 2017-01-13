var app = angular.module('VideoApp', ['ngRoute']);

app.controller('MsgController', ['$scope', '$timeout', '$rootScope', function($scope, $timeout, $rootScope) {
    $rootScope.$on('appMsg', function(evt, data) {
        $scope.msg = data;
        $timeout(function() {
            delete $scope.msg;
        }, 3000);
    });
    $rootScope.$on('appError', function(evt, data) {
        $scope.error = data;
    });
}]);

app.controller('HomeController', ['$scope', function($scope) {
    $scope.ui = {};
}]);

app.controller('WatchController', ['$scope', function($scope) {
    $scope.ui = {};
}]);

app.controller('CreateController', ['$scope', function($scope) {
    $scope.ui = {};
}]);

app.controller('SearchController', ['$scope', function($scope) {
    $scope.ui = {};
}]);

app.controller('LoginController', ['$scope', 'objHolder', 'validationUtils', 'videoHttpService', '$rootScope', '$location', function($scope, objHolder, validationUtils, videoHttpService, $rootScope, $location) {
    $scope.isLogin = true;
    $scope.toggleLogin = function() {
        $scope.isLogin = !$scope.isLogin;
    };
    $scope.loginUser = function() {
        var loginConfig = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            dataType: 'json',
            url: 'login',
            data: $scope.login
        };
        if ($scope.login.username && validationUtils.validateEmail($scope.login.username) && $scope.login.password && $scope.login.password.length > 5) {
            videoHttpService.call(loginConfig).then(function(response) {
                console.log(response);
                if (response.data.message) {
                    $rootScope.$broadcast('appMsg', response.data.message);
                    objHolder.setParam('user', $scope.login.user)
                    $location.path('/home');
                } else {
                    $rootScope.$broadcast('appError', response.data.errorMessage);
                }
            });

        } else {
            $rootScope.$broadcast('appError', 'LoginFormIssue');
        }
    };

    $scope.registerUser = function() {
        var registerConfig = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            dataType: 'json',
            url: 'register',
            data: $scope.register
        };
        if ($scope.register.email && validationUtils.validateEmail($scope.register.email) && $scope.register.password && $scope.register.password.length > 5 && $scope.register.password === $scope.register.confpassword) {
            videoHttpService.call(registerConfig).then(function(response) {
                console.log(response);
                if (response.data.message) {
                    $rootScope.$broadcast('appMsg', response.data.message);
                    $location.path('/');
                    $scope.register = {};
                    log();
                } else if (response.data.errorMessage) {
                    $rootScope.$broadcast('appError', response.data.errorMessage);
                }
            });

        } else {
            $rootScope.$broadcast('appError', 'RegisterFormIssue');
        }
    };

}]);