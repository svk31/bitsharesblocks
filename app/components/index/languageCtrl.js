angular.module('app').controller('languageCtrl', ['$rootScope','$scope','$translate', 'Translate', function($rootScope, $scope, $translate, Translate) {

	$scope.languages = Translate.getLanguages();
	Translate.getCurrent().then(function(current) {
		$scope.language = current;
	});

	$scope.$watch('language',function(newValue, oldValue) {
		if(oldValue !== newValue) {
			Translate.setCurrent(newValue.key).then(function(result) {
				$scope.language = newValue;
				$rootScope.$emit('languageChange');
			});
		}
	});
}]);