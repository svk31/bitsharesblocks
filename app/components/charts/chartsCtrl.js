angular.module('app')

.controller('chartsCtrl', ['$scope', '$rootScope', '$filter', 'api', 'Assets', 'Charts', 'Translate',
  function($scope, $rootScope, $filter, api, Assets, Charts, Translate) {

    $scope.priceUnits = [{
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


    function reduceArray(array, x, y) {
      var returnArray = [];
      for (var i = 0; i < array.length; i++) {
        returnArray.push([array[i][x],
          array[i][y]
        ]);
      }
      return returnArray;
    }

    var rangeselector = {
      selected: 5,
      buttons: [{
        type: 'week',
        count: 1,
        text: '1w'
      }, {
        type: 'week',
        count: 2,
        text: '2w'
      }, {
        type: 'month',
        count: 1,
        text: '1m'
      }, {
        type: 'month',
        count: 3,
        text: '3m'
      }, {
        type: 'year',
        count: 1,
        text: '1y'
      }, {
        type: 'all',
        text: 'All'
      }]
    };
    var Size = {
      height: 350
    };

    var yAxis = {
      min: 0,
      labels: {
        align: 'left',
        formatter: function() {
          return $filter('currency')(this.value, '', 0);
        }
      }
    };

    var toolTip = {
      valueDecimals: 0,
      valueSuffix: ' DVS'
    };

    var toolTip2 = {
      valueDecimals: 0,
      valueSuffix: ''
    };

    var series = [];
    series.push(new Charts.serie({
      name: '',
      tooltip: toolTip,
      id: 'primary'
    }));

    $scope.priceChart = new Charts.chartConfig({
      type: 'line',
      useHighStocks: true,
      series: series,
      size: Size
    });

    $scope.valueChartConfig = new Charts.chartConfig({
      type: 'column',
      useHighStocks: true,
      series: [new Charts.serie({
        tooltip: toolTip,
      })],
      size: Size,
      noLegend: true,
      yAxis: {
        type: 'logarithmic',
        labels: {
          align: 'left',
          formatter: function() {
            return $filter('currency')(this.value, '', 0) + ' DVS';
          }
        }
      }
    });

    $scope.trxCountChart = angular.copy($scope.valueChartConfig);
    $scope.trxCountChart.yAxis.type = 'linear';

    $scope.trxCountChart.yAxis.labels.formatter = function() {
      return $filter('currency')(this.value, '', 0);
    };

    series = [];
    for (var i = 0; i < 4; i++) {
      series.push(new Charts.serie({
        tooltip: toolTip,
        id: i,
        stacking: 'normal'
      }));
    }

    $scope.trxBreakdownChart = new Charts.chartConfig({
      type: 'column',
      useHighStocks: true,
      rangeSelector: rangeselector,
      series: series,
      size: Size,
      yAxis: yAxis
    });

    $scope.assetCountChart = angular.copy($scope.trxBreakdownChart);

    $scope.accountsChart = new Charts.chartConfig({
      useHighStocks: true,
      rangeSelector: rangeselector,
      series: [new Charts.serie({
        tooltip: toolTip2,
      })],
      size: Size,
      yAxis: yAxis
    });

    $scope.newAccountsChart = angular.copy($scope.valueChartConfig);
    $scope.newAccountsChart.series[0].tooltip.valueSuffix = '';
    $scope.newAccountsChart.yAxis.labels.formatter = function() {
      return $filter('currency')(this.value, '', 0);
    };

    api.getVolume(true)
      .success(function(volume) {
        volume.transactions = volume.transactions.sort();
        volume.accounts = volume.accounts.sort();
        // $scope.chartData = volume;

        // 'timestamp','numberTransactions','sumValue','updateCount',
        //   'transferCount','askCount','shortCount','feedCount','registrationCount','bidCount','coverCount'
        $scope.valueChartConfig.series[0].data = reduceArray(volume.transactions, 0, 2);

        $scope.trxCountChart.series[0].data = reduceArray(volume.transactions, 0, 1);

        $scope.assetCountChart.series[0].data = reduceArray(volume.transactions, 0, 5);
        $scope.assetCountChart.series[1].data = reduceArray(volume.transactions, 0, 9);
        $scope.assetCountChart.series[2].data = reduceArray(volume.transactions, 0, 6);
        $scope.assetCountChart.series[3].data = reduceArray(volume.transactions, 0, 10);

        $scope.trxBreakdownChart.series[0].data = reduceArray(volume.transactions, 0, 8);
        $scope.trxBreakdownChart.series[1].data = reduceArray(volume.transactions, 0, 4);
        $scope.trxBreakdownChart.series[2].data = reduceArray(volume.transactions, 0, 7);
        $scope.trxBreakdownChart.series[3].data = reduceArray(volume.transactions, 0, 3);

        $scope.accountsChart.series[0].data = reduceArray(volume.accounts, 0, 1);

        $scope.newAccountsChart.series[0].data = reduceArray(volume.accounts, 0, 2);

      });

    function getPrice() {
      // api.getPrice($scope.priceUnit.name).success(function(result) {
      //   result.sort();
      //   updateChart(result);
      // });

      Assets.fetchPrice($scope.priceUnit.name).then(function(result) {
        updateChart(result);
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
        valueSuffix: ' ' + $scope.priceUnit.name + '/DVS'
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

    function getTranslations() {
      Translate.charts().then(function(result) {
        $scope.priceChart.series[0].name = result.price;
        if ($scope.priceChart.series.length > 1) {
          $scope.priceChart.series[1].name = result.ma15;
          $scope.priceChart.series[2].name = result.ma;

          $scope.assetCountChart.series[0].name = result.asset_ask;
          $scope.assetCountChart.series[1].name = result.asset_bid;
          $scope.assetCountChart.series[2].name = result.asset_short;
          $scope.assetCountChart.series[3].name = result.asset_cover;

          $scope.trxBreakdownChart.series[0].name = result.reg;
          $scope.trxBreakdownChart.series[1].name = result.transfer;
          $scope.trxBreakdownChart.series[2].name = result.feed;
          $scope.trxBreakdownChart.series[3].name = result.update;

          $scope.accountsChart.series[0].name = result.nr;

          $scope.valueChartConfig.series[0].name = result.value;
          $scope.trxCountChart.series[0].name = result.count;

          $scope.newAccountsChart.series[0].name = result.acc;
        }
      });
    }

    getTranslations();

    $rootScope.$on('$translateLoadingSuccess', function() {
      getTranslations();
    });

    $rootScope.$on('languageChange', function() {
      getTranslations();
    });


  }
]);