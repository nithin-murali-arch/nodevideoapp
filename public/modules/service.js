var homeDataConfig = {
    method: 'get',
    headers: {
        'Content-Type': 'application/json'
    },
    dataType: 'json',
    url: 'listHome'
};

var videoMetadataConfig = {
    method: 'get',
    headers: {
        'Content-Type': 'application/json'
    },
    dataType: 'json',
    url: 'videoMetadata'
};

app.service('videoHttpService', ['$http', '$q', function ($http, $q) {
    this.call = function (config) {
        var deferred = $q.defer();
        $http(config).then(function (response) {
            console.log(response);
            deferred.resolve(response);
        });
        return deferred.promise;
    };
}]);

app.config(function($sceProvider) {
      $sceProvider.enabled(false);
});

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'modules/templates/home.html',
        controller: 'HomeController',
        resolve: {
            uiData: function (videoHttpService) {
                homeDataConfig
                return videoHttpService.call(homeDataConfig).then(function (response) {
                    return response.data;
                });
            }
        }
    })
        .when('/watch/:id', {
            templateUrl: 'modules/templates/watch.html',
            controller: 'WatchController',
        })
        .when('/create', {
            templateUrl: 'modules/templates/create.html',
            controller: 'CreateController'
        })
        .when('/search', {
            templateUrl: 'modules/templates/search.html',
            controller: 'SearchController'
        })
        .when('/login', {
            templateUrl: 'modules/templates/login.html',
            controller: 'LoginController'
        })
        .otherwise({ redirectTo: '/' });
}]);


app.service('validationUtils', function () {
    this.validateEmail = function (email) {
        //return email.length > 5;
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    }
    
    this.validateUsername = function(username){
        return username.length > 5;
    }
});

app.factory('objHolder', function () {
    var factory = {};
    factory.objectRepo = {};
    factory.setParam = function (key, value) {
        factory.objectRepo[key] = value;
    }
    factory.getParam = function (key) {
        return factory.objectRepo[key];
    }
    factory.removeParam = function (key) {
        delete factory.objectRepo[key];
    }
    return factory;
});