angular.module('app')

.controller('assetsCtrl', ['$scope', '$rootScope', '$interval', 'Translate', 'Charts', 'Assets',
  function($scope, $rootScope, $interval, Translate, Charts, Assets) {
    $scope.orderByField = 'marketCap';
    $scope.orderByFieldUser = 'initialized';

    $scope.reverseSort = true;
    $scope.reverseSortUser = true;

    var stopAssets;
    var stopVolume;
    var stopUsers;
    var chartDays = 7;

    $scope.capUnits = [{
      name: 'USD',
      label: '$ USD',
      symbol: "$"
    }, {
      name: 'BTC',
      label: 'BTC',
      symbol: 'B⃦'
    }, {
      name: 'CNY',
      label: '¥ CNY',
      symbol: '¥'
    }, {
      name: 'EUR',
      label: '€ EUR',
      symbol: '€'
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

    var toolTip = {
      valueDecimals: 0,
      valueSuffix: ''
    };

    var series = [];
    for (var i = 0; i < 4; i++) {
      series.push(new Charts.serie({
        name: '',
        tooltip: toolTip,
        stacking: 'normal',
        id: i
      }));
    }

    $scope.assetCountChart = new Charts.chartConfig({
      type: 'column',
      useHighStocks: true,
      series: series,
    });

    function fetchMarket() {
      Assets.fetchAssets(true).then(function(result) {
        $scope.assets = result;
      });
    }

    function fetchUser() {
      Assets.fetchAssets(false).then(function(result) {
        $scope.userAssets = result;
      });
    }

    function fetchVolume() {
      Assets.fetchVolume(chartDays).then(function(volume) {
        $scope.assetCountChart.series[0].data = volume.asks;
        $scope.assetCountChart.series[1].data = volume.bids;
        $scope.assetCountChart.series[2].data = volume.shorts;
        $scope.assetCountChart.series[3].data = volume.covers;
      });
    }

    fetchMarket();
    stopAssets = $interval(fetchMarket, 2 * 60000);

    fetchUser();
    stopUsers = $interval(fetchUser, 5 * 60000);

    fetchVolume();
    stopVolume = $interval(fetchVolume, 60000);

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
      if (angular.isDefined(stopUsers)) {
        $interval.cancel(stopUsers);
        stopUsers = undefined;
      }
      if (angular.isDefined(stopVolume)) {
        $interval.cancel(stopVolume);
        stopVolume = undefined;
      }
    }

    $scope.$on('$destroy', function() {
      stopUpdate();
    });

  }
]);