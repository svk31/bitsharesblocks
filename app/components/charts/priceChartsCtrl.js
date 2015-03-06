angular.module('app')

.controller('priceChartsCtrl', ['$scope', '$rootScope', '$filter', '$state', 'api', 'Assets', 'Charts', 'Translate', 'appcst',
  function($scope, $rootScope, $filter, $state, api, Assets, Charts, Translate, appcst) {

    $scope.priceUnits = [{
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
    }];

    $scope.currentUnit = store.get('chartsUnit');
    if ($scope.currentUnit === undefined) {
      $scope.currentUnit = $scope.priceUnits[0].name;
      $scope.priceUnit = $scope.priceUnits[0];
    } else {
      $scope.priceUnits.forEach(function(unit, i) {
        if (unit.name === $scope.currentUnit) {
          $scope.priceUnit = $scope.priceUnits[i];
        }
      });
    }
    $scope.currentUnit = $scope.priceUnit.name;

    $scope.$watch('currentUnit', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.priceUnits.forEach(function(unit, i) {
          if (unit.name === newValue) {
            $scope.priceUnit = $scope.priceUnits[i];
            store.set('chartsUnit', $scope.currentUnit);
            getPrice();
          }
        });
      }
    });

    var Size = {
      height: 350
    };

    var toolTip = {
      valueDecimals: 0,
      valueSuffix: ' ' + appcst.baseAsset
    };

    $scope.priceChart = new Charts.chartConfig({
      type: 'line',
      useHighStocks: true,
      series: [new Charts.serie({
        name: '',
        tooltip: toolTip,
        id: 'primary'
      })],
      size: Size
    });

    function getTranslations() {
      Translate.charts().then(function(result) {
        $scope.priceChart.series[0].name = result.price;
        if ($scope.priceChart.series.length > 1) {
          $scope.priceChart.series[1].name = result.ma15;
          $scope.priceChart.series[2].name = result.ma;
        }
      });
    }

    $rootScope.$on('$translateLoadingSuccess', function() {
      getTranslations();
    });

    $rootScope.$on('languageChange', function() {
      getTranslations();
    });

    function getPrice() {
      Assets.fetchPrice($scope.priceUnit.name).then(function(result) {

        updateChart(result);

        getTranslations();
      });
    }

    getPrice();

    function updateChart(price) {
      var valueDecimals = 4,
        yDecimals = 3;
      if ($scope.priceUnit.name === 'BTC') {
        valueDecimals = 6;
        yDecimals = 6;
      }
      var toolTip = {
        valueDecimals: valueDecimals,
        valuePrefix: '',
        valueSuffix: ' ' + $scope.priceUnit.name + '/' + appcst.baseAsset
      };

      $scope.priceChart.series[0].tooltip = toolTip;
      $scope.priceChart.series[0].data = price;

      if ($scope.priceChart.series.length === 1) {
        $scope.priceChart.series.push(new Charts.serieTA({
          periods: 15
        }));

        $scope.priceChart.series.push(new Charts.serieTA({
          periods: 30
        }));
      }

      $scope.priceChart.series[1].tooltip = toolTip;
      $scope.priceChart.series[2].tooltip = toolTip;

      $scope.priceChart.yAxis = {
        min: 0,
        labels: {
          format: $scope.priceUnit.symbol + '{value}',
          align: 'left'
        }
      };

      getTranslations();
    }

  }
]);