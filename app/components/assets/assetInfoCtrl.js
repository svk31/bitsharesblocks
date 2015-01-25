angular.module('app')

.controller('assetInfoCtrl', ['$scope', '$rootScope', '$state', '$interval', 'api', '$filter', 'Translate', 'Assets', 'Charts',
  function($scope, $rootScope, $state, $interval, api, $filter, Translate, Assets, Charts) {

    $scope.assetId = $state.params.asset;
    $scope.prefix = 'bit';
    var marketAsset = true;

    $scope.filteredFeeds = [];
    $scope.asset = {};
    $scope.showPriceHistory = true;
    $scope.showSupply = true;

    var stopAsset, stopPrice, stopHistory;

    var toolTip = {
      enabled: true,
      shared: false,
      valueSuffix: ' BTS',
      valueDecimals: 0,
      headerFormat: '<span style="font-size: 10px">Price: {point.key:.3f}</span><br/>',
    };

    // set the allowed units for data grouping
    var groupingUnits = [
      [
        'hour', // unit name
        [3, 6, 12] // allowed multiples
      ],
      [
        'day', [1, 2, 3, 4, 5, 6, 7]
      ]
    ];

    series = [];
    series.push(new Charts.serie({
      type: 'candlestick',
      id: 'primary',
      tooltip: {
        valueDecimals: 3,
        valuePrefix: '',
      }
    }));

    series.push(new Charts.serie({
      type: 'column',
      yAxis: 1,
      tooltip: {
        valueDecimals: 0,
        valueSuffix: ' BTS'
      }
    }));

    series.push(new Charts.serie({
      type: 'line',
      tooltip: {
        valueDecimals: 3,
        valuePrefix: '',
      },
      notVisible: true
    }));

    $scope.priceHistoryChart = new Charts.chartConfig({
      plotOptions: {
        candlestick: {
          color: 'red',
          upColor: 'green',
          groupPadding: 0.5,
          dataGrouping: {
            units: groupingUnits
          }
        }
      },
      useHighStocks: true,
      series: series,
      size: {
        height: 300
      },
      xAxis: {
        title: {
          text: ''
        }
      },
      yAxis: [{
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: ''
        },
        height: '70%',
        lineWidth: 2
      }, {
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: ''
        },
        top: '75%',
        height: '25%',
        offset: 0,
        lineWidth: 2
      }]
    });

    delete $scope.priceHistoryChart.options.chart.type;

    series = [];
    series.push(new Charts.serie({
      id: 0,
      tooltip: {
        valueDecimals: 2,
        valueSuffix: ' ' + $scope.assetId
      },
      marker: {
        enabled: false
      }
    }));

    $scope.supplyChart = new Charts.chartConfig({
      type: 'line',
      useHighStocks: false,
      tooltip: {
        shared: true
      },
      series: series,
      size: {
        height: 300
      },
      yAxis: {
        title: {
          text: ''
        },
        labels: {
          formatter: function() {
            return $filter('currency')(this.value, '', 0) + ' ' + $scope.prefix + $scope.assetId;
          },
          align: 'right',
          style: {
            color: '#4572A7'
          }
        }
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: ''
        },
        allowDecimals: false
      }
    });

    function fetchAsset() {
      Assets.fetchAsset($scope.assetId).then(function(result) {
        marketAsset = (result.asset.issuer_account_id === -2) ? true : false;
        $scope.asset = result.asset;

        $scope.averagefeed = result.asset.feedInfo.averageFeed;
        $scope.filteredFeeds = result.asset.feedInfo.feeds;
        $scope.enoughFeeds = result.asset.feedInfo.enoughFeeds;
        $scope.collateral = result.collateral;
        $scope.collateralAsset = result.collateralAsset;

        if (!result.asset.supply || result.asset.supply.length === 0) {
          $scope.showSupply = false;
        }

        updatePlots();
        getTranslations();
        chartText();
      });
    }

    fetchAsset();
    stopAsset = $interval(fetchAsset, 5 * 60 * 1000);

    function getPrice() {
      if ($scope.assetId === 'USD' || $scope.assetId === 'BTC' || $scope.assetId === 'CNY') {
        Assets.fetchPrice($scope.assetId, true).then(function(result) {
          $scope.priceHistoryChart.series[2].data = result;
        });
      } else if ($scope.priceHistoryChart.series.length === 3) {
        $scope.priceHistoryChart.series.pop();
      }
    }

    getPrice();
    stopPrice = $interval(getPrice, 15 * 60000);

    function getPriceHistory() {
      Assets.fetchPriceHistory($scope.assetId).then(function(result) {
        $scope.showPriceHistory = (result && result.price.length === 0) ? false : true;
        if ($scope.showPriceHistory) {
          $scope.priceHistoryChart.series[0].data = result.price;
          $scope.priceHistoryChart.series[1].data = result.volume.sort();
        }
      });
    }

    getPriceHistory();
    stopHistory = $interval(getPriceHistory, 5 * 60000);

    $scope.filterFeeds = function(boolean) {
      var temp = Assets.filterFeeds($scope.asset.feeds, boolean);
      $scope.averagefeed = temp.averageFeed;
      $scope.filteredFeeds = temp.feeds;
      $scope.enoughFeeds = temp.enoughFeeds;
    };

    function updatePlots() {
      if ($scope.supplyChart.series.length === 1 && marketAsset) {
        $scope.supplyChart.series.push(new Charts.serie({
          id: 1,
          tooltip: {
            valueDecimals: 2,
            valueSuffix: ' BTS'
          },
          marker: {
            enabled: false
          }
        }));
      }

      $scope.supplyChart.series[0].data = $scope.asset.supply;

      if (marketAsset && $scope.asset.collateral.length > 0) {
        $scope.supplyChart.series[1].data = $scope.asset.collateral;
      } else if ($scope.supplyChart.series.length === 2) {
        $scope.supplyChart.series.pop();
      }

      if ($scope.asset.issuer_account_id === 0 || marketAsset) {
        $scope.issuerAccount = 'MARKET';
      } else {
        api.getAccountByNr($scope.asset.issuer_account_id).success(function(account) {
          $scope.issuerAccount = account.name;
        });
      }
    }

    function chartText() {
      if ($scope.priceHistoryChart.series[2]) {
        $scope.priceHistoryChart.series[2].tooltip.valueSuffix = ' BTS/' + $scope.assetId;
      }

      $scope.priceHistoryChart.series[0].tooltip.valueSuffix = ' BTS/' + $scope.prefix + $scope.assetId;
      $scope.priceHistoryChart.series[1].tooltip.valueSuffix = ' BTS';


      if (marketAsset) {
        $scope.supplyChart.series[1].tooltip.valueSuffix = ' ' + $scope.prefix + $scope.assetId;
      }

      $scope.supplyChart.series[0].tooltip.valueSuffix = ' ' + $scope.prefix + $scope.assetId;

      if ($scope.assetId === 'BTC' || $scope.assetId === 'GLD') {
        $scope.priceHistoryChart.series[0].tooltip.valueDecimals = 0;
        if ($scope.priceHistoryChart.series[2]) {
          $scope.priceHistoryChart.series[2].tooltip.valueDecimals = 0;
        }
      }

    }

    $scope.stopUpdate = function() {
      if (angular.isDefined(stopAsset)) {
        $interval.cancel(stopAsset);
        stopAsset = undefined;
      }

      if (angular.isDefined(stopPrice)) {
        $interval.cancel(stopPrice);
        stopPrice = undefined;
      }

      if (angular.isDefined(stopHistory)) {
        $interval.cancel(stopHistory);
        stopHistory = undefined;
      }
    };

    $scope.$on('$destroy', function() {
      $scope.stopUpdate();
    });

    function getTranslations() {
      Translate.asset().then(function(result) {
        $scope.supplyChart.series[0].name = result['asset.chartSupply'];
        $scope.supplyChart.yAxis.title.text = result['asset.chartSupply'];
        $scope.priceHistoryChart.series[0].name = result['asset.ohlc'];

        $scope.priceHistoryChart.series[1].name = result['asset.volume'];
        if ($scope.asset.issuer_account_id === -2) {
          $scope.supplyChart.series[1].name = result['asset.collateral'];
        }

        if ($scope.priceHistoryChart.series[2]) {
          $scope.priceHistoryChart.series[2].name = result['asset.external'];
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