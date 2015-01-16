angular.module('app')

.controller('userAssetsCtrl', ['$scope', '$rootScope', '$interval', 'Translate', 'Assets',
  function($scope, $rootScope, $interval, Translate, Assets) {
    $scope.orderByFieldUser = 'initialized';

    $scope.reverseSortUser = true;

    var stopUsers;

    function fetchUser() {
      Assets.fetchAssets(false).then(function(result) {
        $scope.userAssets = result;
      });
    }

    fetchUser();
    stopUsers = $interval(fetchUser, 5 * 60000);

    function getTranslations() {
      Translate.assets().then(function(result) {
        $scope.userHeaders = result.userHeaders;
        $scope.assetCountChart.series[0].name = result.plotTypes['assets.plot.type1'];
        $scope.assetCountChart.series[1].name = result.plotTypes['assets.plot.type2'];
        $scope.assetCountChart.series[2].name = result.plotTypes['assets.plot.type3'];
        $scope.assetCountChart.series[3].name = result.plotTypes['assets.plot.type4'];
      });
    }

    getTranslations();

    $rootScope.$on('$translateLoadingSuccess', function() {
      getTranslations();
    });

    $rootScope.$on('languageChange', function() {
      getTranslations();
    });

    function stopUpdate() {
      if (angular.isDefined(stopUsers)) {
        $interval.cancel(stopUsers);
        stopUsers = undefined;
      }
    }

    $scope.$on('$destroy', function() {
      stopUpdate();
    });

  }
]);