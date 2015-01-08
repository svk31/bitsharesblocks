angular.module('app')

.controller('homeCtrl', ['$scope', '$rootScope', '$interval', '$alert', 'api', 'Delegates', 'Blocks', 'Translate', 'Charts', 'Alerts', 'Home',
  function($scope, $rootScope, $interval, $alert, api, Delegates, Blocks, Translate, Charts, Alerts, Home) {

    var stopHome, stopBlocks, stopPrice, movingAvg, price;

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

    $scope.currentUnit = store.get('currentUnit');
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
            if (angular.isDefined(stopPrice)) {
              $interval.cancel(stopPrice);
              stopPrice = undefined;
            }
            $scope.priceUnit = $scope.priceUnits[i];
            store.set('currentUnit', $scope.currentUnit);
            fetchPrice();
            stopPrice = $interval(fetchPrice, 60000 * 20);
          }
        });
      }
    });

    var startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 14);

    var series = [];
    series.push(new Charts.serie({
      name: '',
      id: 'primary',
      marker: {
        enabled: false
      }
    }));

    $scope.priceChart = new Charts.chartConfig({
      type: 'line',
      useHighStocks: true,
      series: series,
      noRangeselector: true,
      xAxis: {
        title: {
          text: ''
        },
        allowDecimals: false,
        min: startDate.getTime()
      }
    });

    function fetchPrice() {
      Home.fetchPrice($scope.priceUnit.name).then(function(result) {
        price = result;
        updateChart();
      });
    }

    fetchPrice();

    function fetchHomeData() {
      Home.fetchData().then(function(result) {
        $scope.home = result.home;
        $scope.averageConfirm = result.averageConfirm;
        $scope.security = $scope.home.security;

        forkInfo();
        checkMaintenance();
        checkHardfork();
      });
    }

    fetchHomeData();
    stopHome = $interval(fetchHomeData, 60000);

    function getRecent() {
      Blocks.setBooleanTrx(false);
      Blocks.fetchRecent().then(function(result) {
        $scope.blocks = result.blocks;
        $scope.maxBlock = result.maxBlock;
        $scope.bigTotalItems = $scope.maxBlock;
      });
    }

    function getNew() {
      Blocks.fetchNew().then(function(result) {
        $scope.blocks = result.blocks;
        $scope.maxBlock = result.maxBlock;
        $scope.bigTotalItems = $scope.maxBlock;
      });
    }

    getRecent();
    stopBlocks = $interval(getNew, 10000);



    function stopUpdate() {
      if (angular.isDefined(stopHome)) {
        $interval.cancel(stopHome);
        stopHome = undefined;
      }
      if (angular.isDefined(stopBlocks)) {
        $interval.cancel(stopBlocks);
        stopBlocks = undefined;
      }
      if (angular.isDefined(stopPrice)) {
        $interval.cancel(stopPrice);
        stopPrice = undefined;
      }
    }

    function updateChart(result) {
      var valueDecimals = 4;
      if ($scope.priceUnit.name === 'BTC') {
        valueDecimals = 6;
      }
      var toolTip = {
        valueDecimals: valueDecimals,
        valuePrefix: '',
        valueSuffix: ' ' + $scope.priceUnit.name + '/DVS'
      };
      $scope.priceChart.yAxis = {
        labels: {
          format: $scope.priceUnit.symbol + '{value}',
          align: 'left'
        }
      };
      $scope.priceChart.series[0].tooltip = toolTip;
      $scope.priceChart.series[0].data = price;
      if ($scope.priceChart.series.length === 1) {
        $scope.priceChart.series.push({
          name: movingAvg,
          linkedTo: 'primary',
          showInLegend: true,
          type: 'trendline',
          algorithm: 'SMA',
          periods: 30,
          tooltip: toolTip
        });
      } else {
        $scope.priceChart.series[1].tooltip = toolTip;
      }
    }

    function forkInfo() {
      if ($scope.home.forks.previous) {
        Delegates.fetchDelegatesById($scope.home.forks.previous.forkInfo[1].signing_delegate).then(function(result) {
          $scope.forkDelegateName = result.name;
        });
        $scope.forkLatency = $scope.home.forks.previous.forkInfo[1].latency / 1000000;
        $scope.previousForkHeight = $scope.home.forks.previous._id + 1;
      }
    }

    var myAlert = Alerts.upgrade();

    var alertSet = false;

    function checkMaintenance() {
      $rootScope.maintenance = $scope.home.maintenance;
      if ($scope.home.maintenance === true && alertSet === false) {
        myAlert.show(true);
        alertSet = true;
      } else if (alertSet === true && $scope.home.maintenance === false) {
        myAlert.hide(true);
        alertSet = false;
      }
    }

    $scope.closeAlert = function() {
      $scope.showForkAlert = false;
    };

    function checkHardfork() {
      if ($scope.home && $scope.home.hardFork < $scope.maxBlock) {
        $scope.showForkAlert = false;
      } else if ($scope.home && $scope.home.hardFork && $scope.maxBlock) {
        var currentDate = new Date();
        var milliSecondsToFork = ($scope.home.hardFork - $scope.maxBlock) * 10 * 1000;
        var forkDate = new Date(currentDate.getTime() + milliSecondsToFork);
        $scope.forkAlert = {
          type: 'danger',
          msg: 'Upcoming hardfork at block ' + $scope.home.hardFork + ' - Estimated time of fork: ' + forkDate
        };
        $scope.showForkAlert = true;
      }
    }

    function getTranslations() {
      Translate.home().then(function(result) {
        $scope.priceChart.series[0].name = result.price;
        movingAvg = result.ma;
        if ($scope.priceChart.series.length === 2) {
          $scope.priceChart.series[1].name = movingAvg;
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

    $scope.$on('$destroy', function() {
      stopUpdate();
    });
  }
]);