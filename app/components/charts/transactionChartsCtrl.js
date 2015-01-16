angular.module('app')

.controller('transactionChartsCtrl', ['$scope', '$rootScope', '$filter', '$state', 'api', 'Assets', 'Charts', 'Translate',
  function($scope, $rootScope, $filter, $state, api, Assets, Charts, Translate) {
    var toolTip = {
      valueDecimals: 0,
      valueSuffix: ' BTS'
    };

    var rangeSelector = Charts.rangeSelector;

    var Size = {
      height: 300
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

    var series = [];
    for (var i = 0; i < 4; i++) {
      series.push(new Charts.serie({
        tooltip: toolTip,
        id: i,
        stacking: 'normal'
      }));
    }

    $scope.trxBreakdownChart = new Charts.chartConfig({
      plotOptions: {
        column: {
          animation: false
        }
      },
      type: 'column',
      useHighStocks: true,
      series: series,
      size: Size,
      yAxis: yAxis
    });

    $scope.assetCountChart = angular.copy($scope.trxBreakdownChart);

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
            return $filter('currency')(this.value, '', 0) + ' BTS';
          }
        }
      }
    });

    $scope.trxCountChart = angular.copy($scope.valueChartConfig);
    $scope.trxCountChart.yAxis.type = 'linear';

    $scope.trxCountChart.yAxis.labels.formatter = function() {
      return $filter('currency')(this.value, '', 0);
    };

    api.getCharts({
        accounts: false,
        trx: true
      })
      .success(function(result) {
        var transactions = result.transactions.sort();
        // 'timestamp','numberTransactions','sumValue','updateCount',
        //   'transferCount','askCount','shortCount','feedCount','registrationCount','bidCount','coverCount'

        convertArray(transactions);
      });

    function convertArray(array) {
      var tempArrays = {},
        i;
      for (i = 0; i < 10; i++) {
        tempArrays[i] = [];
      }

      for (i = 0; i < array.length; i++) {
        // trxCount
        tempArrays[0].push([array[i][0],
          array[i][1]
        ]);
        // valueChart
        tempArrays[1].push([array[i][0],
          array[i][2]
        ]);
        // assetCount
        tempArrays[2].push([array[i][0],
          array[i][5]
        ]);
        tempArrays[3].push([array[i][0],
          array[i][9]
        ]);
        tempArrays[4].push([array[i][0],
          array[i][6]
        ]);
        tempArrays[5].push([array[i][0],
          array[i][10]
        ]);
        // trxBreakdownChart
        tempArrays[6].push([array[i][0],
          array[i][8]
        ]);
        tempArrays[7].push([array[i][0],
          array[i][4]
        ]);
        tempArrays[8].push([array[i][0],
          array[i][7]
        ]);
        tempArrays[9].push([array[i][0],
          array[i][3]
        ]);
      }

      $scope.trxCountChart.series[0].data = tempArrays[0];
      $scope.valueChartConfig.series[0].data = tempArrays[1];

      $scope.assetCountChart.series[0].data = tempArrays[2];
      $scope.assetCountChart.series[1].data = tempArrays[3];
      $scope.assetCountChart.series[2].data = tempArrays[4];
      $scope.assetCountChart.series[3].data = tempArrays[5];

      $scope.trxBreakdownChart.series[0].data = tempArrays[6];
      $scope.trxBreakdownChart.series[1].data = tempArrays[7];
      $scope.trxBreakdownChart.series[2].data = tempArrays[8];
      $scope.trxBreakdownChart.series[3].data = tempArrays[9];
    }


    function getTranslations() {
      Translate.charts().then(function(result) {

        $scope.assetCountChart.series[0].name = result.asset_ask;
        $scope.assetCountChart.series[1].name = result.asset_bid;
        $scope.assetCountChart.series[2].name = result.asset_short;
        $scope.assetCountChart.series[3].name = result.asset_cover;

        $scope.trxBreakdownChart.series[0].name = result.reg;
        $scope.trxBreakdownChart.series[1].name = result.transfer;
        $scope.trxBreakdownChart.series[2].name = result.feed;
        $scope.trxBreakdownChart.series[3].name = result.update;

        $scope.valueChartConfig.series[0].name = result.value;
        $scope.trxCountChart.series[0].name = result.count;

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