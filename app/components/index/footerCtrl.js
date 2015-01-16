angular.module('app').controller('footerCtrl', ['$rootScope', '$scope', '$translate', 'Translate', 'api',
	function($rootScope, $scope, $translate, Translate, api) {

		$scope.apis = [{
			name: 'auto',
		}, {
			name: 'new_york',
		}, {
			name: 'singapore',
		}];

		$scope.languages = Translate.getLanguages();
		Translate.getCurrent().then(function(current) {
			$scope.language = current;
		});

		$scope.$watch('language', function(newValue, oldValue) {
			if (oldValue !== newValue) {
				Translate.setCurrent(newValue.key).then(function(result) {
					$scope.language = newValue;
					$rootScope.$emit('languageChange');
				});
			}
		});

		function getTranslations() {
			Translate.apiModal().then(function(result) {
				$scope.apis.forEach(function(api) {
					api.label = result[api.name];
				});

				$scope.modalBody = result.body;
				$scope.modalTitle = result.title;
				$scope.modalClose = result.close;

			});
		}

		getTranslations();

		$rootScope.$on('$translateLoadingSuccess', function() {
			getTranslations();
		});

		$rootScope.$on('languageChange', function() {
			getTranslations();
		});

		var apiIndex = store.get('apiIndex');
		if (apiIndex === undefined) {
			apiIndex = 0;
			$rootScope.currentAPI = $scope.apis[0].name;
			$scope.priceUnit = $scope.apis[0];
		} else {
			$scope.priceUnit = $scope.apis[apiIndex];
		}

		api.setAPI(apiIndex);

		$rootScope.currentAPI = $scope.priceUnit.name;

		$scope.$watch('currentAPI', function(newValue, oldValue) {
			if (newValue !== oldValue) {
				$scope.apis.forEach(function(unit, i) {
					if (unit.name === newValue) {
						$scope.priceUnit = $scope.apis[i];
						store.set('apiIndex', i);

						api.setAPI(i);
					}
				});
			}
		});

	}
]);