angular.module('app')

.controller('marketAssetsCtrl', ['$scope', '$rootScope', '$interval', 'Translate', 'Assets',
  function($scope, $rootScope, $interval, Translate, Assets) {
    $scope.orderByField = 'marketCap';

    $scope.reverseSort = true;

    var stopAssets;

    $scope.capUnits = [{
      name: 'USD',
      label: '$ USD',
      symbol: "$"
    }, {
      name: 'BTC',
      label: '\u0243 BTC',
      symbol: '\u0243'
    }, {
      name: 'CNY',
      label: '¥ CNY',
      symbol: '¥'
    }, {
      name: 'EUR',
      label: '€ EUR',
      symbol: '€'
    }, {
      name: 'BTS',
      label: 'BTS',
      symbol: ''
    }];

    $scope.capUnit = store.get('capUnit');
    if ($scope.capUnit === undefined) {
      $scope.capUnit = $scope.capUnits[0].name;
      $scope.priceUnit = $scope.capUnits[0];
    } else {
      $scope.capUnits.forEach(function(unit, i) {
        if (unit.name === $scope.capUnit) {
          $scope.priceUnit = $scope.capUnits[i];
        }
      });
    }
    $scope.capUnit = $scope.priceUnit.name;

    $scope.$watch('capUnit', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.capUnits.forEach(function(unit, i) {
          if (unit.name === newValue) {
            $scope.priceUnit = $scope.capUnits[i];
            store.set('capUnit', $scope.capUnit);
          }
        });
      }
    });

    function fetchMarket() {
      Assets.fetchAssets(true).then(function(result) {
        $scope.assets = result;
      });
    }

    fetchMarket();
    stopAssets = $interval(fetchMarket, 2 * 60000);

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
      if (angular.isDefined(stopAssets)) {
        $interval.cancel(stopAssets);
        stopAssets = undefined;
      }
    }

    $scope.$on('$destroy', function() {
      stopUpdate();
    });

  }
]);