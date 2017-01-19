var app = angular.module('VideoApp', ['ngRoute', 'ngFileUpload','ngAria','ngAnimate','ngMaterial']);

app.config(['$mdThemingProvider',function($mdThemingProvider){
    $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('orange');
}]);

app.controller('MsgController', ['$scope', '$timeout', '$rootScope', function ($scope, $timeout, $rootScope) {
    $rootScope.$on('appMsg', function (evt, data) {
        $scope.msg = data;
        $timeout(function () {
            delete $scope.msg;
        }, 3000);
    });
    $rootScope.$on('appError', function (evt, data) {
        $scope.error = data;
    });
    $rootScope.$on('showLoadingOverlay', function(evt, data){
        $scope.showLoad = true;
    });
    $rootScope.$on('hideLoadingOverlay', function(evt, data){
        $scope.showLoad = false;
    });
}]);

app.controller('LoadingController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $rootScope.$on('showLoadingOverlay', function(evt, data){
        $scope.showLoad = true;
    });
    $rootScope.$on('hideLoadingOverlay', function(evt, data){
        $scope.showLoad = false;
    });
}]);

app.controller('HomeController', ['$scope', 'objHolder', 'validationUtils', 'videoHttpService', '$rootScope', '$location', 'uiData', function ($scope, objHolder, validationUtils, videoHttpService, $rootScope, $location, uiData) {
    $scope.ui = uiData;
}]);

app.controller('WatchController', ['$scope', '$routeParams', 'videoHttpService', function ($scope, $routeParams, videoHttpService) {
    $scope.videoUrl = '/playVideo/' + $routeParams.id;
    videoMetadataConfig.url = videoMetadataConfig.url + '/' + $routeParams.id;
    videoHttpService.call(videoMetadataConfig).then(function (response) {
        $scope.video = response.data;
    });
}]);

app.controller('CreateController', ['$scope', 'Upload', '$timeout', '$rootScope', '$location', function ($scope, Upload, $timeout, $rootScope, $location) {
    $scope.upload = function (file, video) {
        file.upload = Upload.upload({
            url: 'addVideo',
            data: {
                videoFile: file,
                video: video
            },
        });
        file.upload.then(function (response) {
            $timeout(function () {
                file.result = response.data;
                if (response.data === 'Success!') {
                    $rootScope.$broadcast('appMsg', response.data);
                    $location.path("/home");
                }
                else {
                    $rootScope.$broadcast('appError', response.data);
                }
            });
        });
    }
}]);

app.controller('SearchController', ['$scope', function ($scope) {
    $scope.ui = {};
}]);

app.controller('LoginController', ['$scope', 'objHolder', 'validationUtils', 'videoHttpService', '$rootScope', '$location', function ($scope, objHolder, validationUtils, videoHttpService, $rootScope, $location) {
    $scope.isLogin = true;
    $scope.toggleLogin = function () {
        $scope.isLogin = !$scope.isLogin;
    };
    $scope.loginUser = function () {
        var loginConfig = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            dataType: 'json',
            url: 'login',
            data: $scope.login
        };
        if ($scope.login.username && validationUtils.validateUsername($scope.login.username) && $scope.login.password && $scope.login.password.length > 5) {
            videoHttpService.call(loginConfig).then(function (response) {
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

    $scope.registerUser = function () {
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
            videoHttpService.call(registerConfig).then(function (response) {
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