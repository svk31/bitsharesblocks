angular.module('app')
.factory('customStaticFilesLoader', [
  '$q',
  '$http',
  'appcst',
  '$rootScope',
  function ($q, $http, appcst, $rootScope) {
    return function (options) {
      if (!options || (!angular.isString(options.prefix) || !angular.isString(options.suffix))) {
        throw new Error('Couldn\'t load static files, no prefix or suffix specified!');
      }
      var deferred = $q.defer();
      if (options.key === 'en') {
        deferred.resolve(appcst.translation);
      }
      else {
        $http(angular.extend({
          url: [
          options.prefix,
          options.key,
          options.suffix
          ].join(''),
          method: 'GET',
          params: ''
        }, options.$http)).success(function (data) {
          deferred.resolve(data);
        }).error(function (data) {
          deferred.reject(options.key);
        });
      }
      return deferred.promise;
    };
  }
  ]);