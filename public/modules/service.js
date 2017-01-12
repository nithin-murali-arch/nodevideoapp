var app = angular.module('VideoApp', []);

app.service('videoHttpService', ['$http', '$q', function($http, $q) {
    this.call = function(config) {
        var deferred = $q.defer();
        $http(config).then(function(response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    };
}]);

var loginConfig = {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            dataType: 'json',
            url: 'login',
            data: JSON.stringify($scope.login)
        };