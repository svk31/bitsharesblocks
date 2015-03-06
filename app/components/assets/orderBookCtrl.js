angular.module('app')

.controller('orderBookCtrl', ['$scope', '$rootScope', '$state', '$interval', 'api', '$filter', 'Translate', 'Assets', 'Charts', 'Meta', 'appcst',
  function($scope, $rootScope, $state, $interval, api, $filter, Translate, Assets, Charts, Meta, appcst) {
    $scope.baseAsset = appcst.baseAsset;
    $scope.orderByField = 'last_update';
    $scope.reverseSort = true;
    $scope.assetId = $state.params.asset;
    $scope.prefix = 'bit';
    var marketAsset = true;

    $scope.asset = {};
    $scope.showOrders = true;

    $scope.orderTypes = {
      ask_order: 'asset.buy',
      bid_order: 'asset.sell',
      short_order: 'asset.short',
      cover_order: 'assets.plot.type4'
    };

    var stopAsset, stopPrice, stopHistory;

    var toolTip = {
      enabled: true,
      shared: false,
      valueSuffix: ' ' + $scope.baseAsset,
      valueDecimals: 0,
      headerFormat: '<span style="font-size: 10px">Price: {point.key:.3f}</span><br/>',
    };

    var series = [];
    for (var i = 0; i < 3; i++) {
      series.push(new Charts.serie({
        tooltip: toolTip,
        id: i,
        marker: {
          enabled: false
        }
      }));
    }

    series[1].marker = {
      enabled: true,
      radius: 1
    };

    $scope.orderBookChart = new Charts.chartConfig({
      type: 'area',
      useHighStocks: false,
      series: series,
      size: {
        height: 250
      },
      xAxis: {
        title: {
          text: ''
        },
        plotLines: [{
          color: 'red',
          dashStyle: 'longdashdot',
          width: '2',
          label: {
            text: 'median feed price'
          }
        }],
      },
      yAxis: {
        title: {
          text: ''
        },
        labels: {
          formatter: function() {
            return $filter('currency')(this.value, '', 0) + ' ' + $scope.baseAsset;
          },
          align: 'right'
        }
      }
    });

    delete $scope.orderBookChart.options.chart.zoomType;

    function fetchOrderBook() {
      Assets.fetchOrderBook($scope.assetId).then(function(result) {
        Meta.add('/asset/orderbook', {
          title: 'Bitshares ' + result.asset.symbol + ' orderbook: asks, bids, shorts and covers'
        });

        marketAsset = (result.asset.issuer_account_id === -2) ? true : false;
        $scope.asset = result.asset;

        if ($scope.asset.symbol.indexOf('BTC') !== -1 || $scope.asset.symbol.indexOf('GOLD') !== -1) {
          $scope.assetDecimals = 6;
        } else {
          $scope.assetDecimals = 3;
        }

        $scope.averagefeed = result.averageFeed;
        $scope.filteredFeeds = result.feeds;
        $scope.medianLine = result.medianLine;
        $scope.collateral = result.collateral;
        $scope.collateralAsset = result.collateralAsset;

        if (!marketAsset && $scope.orderBookChart.series.length === 3) {
          $scope.orderBookChart.series.pop();
          $scope.prefix = '';
        }
        if (result.asset.asks.length === 0 && result.asset.bids.length === 0 && result.asset.shorts.length === 0) {
          $scope.showOrders = false;
        }

        if (!result.asset.supply || result.asset.supply.length === 0) {
          $scope.showSupply = false;
        }

        updatePlots();
        getTranslations();
        chartText();

        if ($scope.showOrders === false && $scope.asset.covers.length === 0 && $scope.asset.order_history.length === 0) {
          $rootScope.$emit('noOrderbook');
        }
      });
    }
    fetchOrderBook();
    stopAsset = $interval(fetchOrderBook, 20000);

    $scope.filterFeeds = function(boolean) {
      $scope.filteredFeeds = Assets.filterFeeds($scope.asset, boolean).feeds;
    };

    function updatePlots() {
      if (marketAsset) {
        $scope.orderBookChart.series[2].data = $scope.asset.shortSum;
      }

      $scope.orderBookChart.series[0].data = $scope.asset.sum.asks;

      $scope.orderBookChart.series[1].data = $scope.asset.sum.bids;

      if ($scope.asset.medianLine !== 0) {
        $scope.orderBookChart.xAxis.plotLines[0].value = $scope.asset.medianLine;
      }

      if ($scope.asset.medianLine) {
        $scope.orderBookChart.xAxis.currentMin = 0.5 * ($scope.asset.medianLine);
        $scope.orderBookChart.xAxis.currentMax = 1.5 * ($scope.asset.medianLine);
      }
    }

    function chartText() {
      $scope.orderBookChart.xAxis.title.text = $scope.baseAsset + '/' + $scope.prefix + $scope.assetId;
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
        $scope.orderBookChart.series[0].name = result['asset.buy'] + ' ' + $scope.prefix + $scope.assetId;
        $scope.orderBookChart.series[1].name = result['asset.sell'] + ' ' + $scope.prefix + $scope.assetId;
        $scope.orderBookChart.xAxis.plotLines[0].label.text = result['asset.feeds.med'];
        if ($scope.asset.issuer_account_id === -2) {
          $scope.orderBookChart.series[2].name = result['asset.short'] + ' ' + $scope.prefix + $scope.assetId;
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