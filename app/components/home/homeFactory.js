	angular.module('app')

	.factory('Home', ['api', '$q', function(api, $q) {

		function fetchData(cacheBoolean) {
			var deferred = $q.defer();
			api.getHome(cacheBoolean).success(function(result) {
				deferred.resolve({
					home: result,
					averageConfirm: result.security.estimated_confirmation_seconds / 2
				});
			});

			return deferred.promise;
		}

		function fetchPrice(asset) {
			var deferred = $q.defer();

			api.getHomePrice(asset).success(function(result) {
				result = result.sort();
				deferred.resolve(result);
			});
			return deferred.promise;
		}

		return {
			fetchPrice: fetchPrice,
			fetchData: fetchData
		};

	}]);