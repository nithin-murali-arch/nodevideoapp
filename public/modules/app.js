var app = angular.module('VideoApp', ['ngRoute', 'ngFileUpload','ngAria','ngAnimate','ngMaterial']);

app.config(['$mdThemingProvider','$httpProvider',function($mdThemingProvider,$httpProvider){
    $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('orange');
    $httpProvider.interceptors.push("httpInterceptor");
}]);

app.controller('MsgController', ['$scope', '$timeout', '$rootScope', 'objHolder', function ($scope, $timeout, $rootScope, objHolder) {
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
    $scope.showLoginModal = function(){
        $mdDialog.show({
          controller: LoginController,
          templateUrl: 'modules/templates/login.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen
        });
    };
    $scope.isUserLoggedIn = function(){
        return angular.isDefined(objHolder.getParam('user'));
    };
    $scope.$on("$routeChangeError", function(evt,current,previous,rejection){
      if(rejection == "not_logged_in"){
        //DO SOMETHING
      } else {
        //OR DO SOMETHING ELSE
      }
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

app.controller('WatchController', ['$scope', '$routeParams', 'videoHttpService', '$mdDialog', '$log', function ($scope, $routeParams, videoHttpService, $mdDialog, $log) {
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

app.controller('LoginController', ['$scope', 'objHolder', 'validationUtils', 'videoHttpService', '$rootScope', '$location', '$mdDialog', function ($scope, objHolder, validationUtils, videoHttpService, $rootScope, $location, $mdDialog) {
    $scope.isLogin = true;
    $scope.toggleLogin = function () {
        $scope.isLogin = !$scope.isLogin;
    };
    $scope.hide = function () {
        $mdDialog.hide();
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
        $scope.$on('appError', function(evt, data){
            $scope.errorMessage = data;
            $timeout(function(){
                delete $scope.errorMessage
            }, 3000);
        });
        if ($scope.login.username && validationUtils.validateUsername($scope.login.username) && $scope.login.password && $scope.login.password.length > 5) {
            videoHttpService.call(loginConfig).then(function (response) {
                console.log(response);
                if (response.data.message) {
                    $rootScope.$broadcast('appMsg', response.data.message);
                    objHolder.setParam('user', $scope.login.user);
                    $location.path('/home');
                    $mdDialog.hide();
                } else {
                    $rootScope.$broadcast('modalError', response.data.errorMessage);
                }
            });

        } else {
            $scope.$emit('appError', 'LoginFormIssue');
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
