angular.module('app')

.controller('accountsChartsCtrl', ['$scope', '$rootScope', '$filter', 'api', 'Assets', 'Charts', 'Translate',
  function($scope, $rootScope, $filter, api, Assets, Charts, Translate) {

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
      height: 300,
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
      valueSuffix: ''
    };

    $scope.accountsChart = new Charts.chartConfig({
      useHighStocks: true,
      rangeSelector: rangeselector,
      series: [new Charts.serie({
        tooltip: toolTip,
      })],
      size: Size,
      yAxis: yAxis
    });

    $scope.newAccountsChart = new Charts.chartConfig({
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
            return $filter('currency')(this.value, '', 0);
          }
        }
      }
    });

    api.getCharts({
      accounts: true,
      trx: false
    }).success(function(result) {
      $scope.accountsChart.series[0].data = reduceArray(result.accounts, 0, 1);

      $scope.newAccountsChart.series[0].data = reduceArray(result.accounts, 0, 2);

      $scope.accountsChart.reflow = true;
    });


    function getTranslations() {
      Translate.charts().then(function(result) {
        $scope.accountsChart.series[0].name = result.nr;

        $scope.newAccountsChart.series[0].name = result.acc;
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