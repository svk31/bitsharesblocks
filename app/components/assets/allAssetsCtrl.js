angular.module('app')

.controller('assetsCtrl', ['$scope', '$rootScope', '$state', '$interval', 'Translate', 'Charts', 'Assets',
  function($scope, $rootScope, $state, $interval, Translate, Charts, Assets) {

    $scope.tabs = [{
      active: true,
      name: 'assets.market'
    }, {
      active: false,
      name: 'assets.user'
    }];

    var stopVolume;
    var chartDays = 7;

    var series = [];
    for (var i = 0; i < 4; i++) {
      series.push(new Charts.serie({
        name: '',
        tooltip: {
          valueDecimals: 0,
          valueSuffix: ''
        },
        stacking: 'normal',
        id: i
      }));
    }

    $scope.assetCountChart = new Charts.chartConfig({
      type: 'column',
      useHighStocks: true,
      series: series,
      size: {
        height: 250
      }
    });

    function fetchVolume() {
      var end = new Date();
      var start = new Date();
      start.setDate(start.getDate() - 7);

      Assets.fetchVolume({
        end: end,
        start: start
      }).then(function(volume) {
        $scope.assetCountChart.series[0].data = volume.asks;
        $scope.assetCountChart.series[1].data = volume.bids;
        $scope.assetCountChart.series[2].data = volume.shorts;
        $scope.assetCountChart.series[3].data = volume.covers;
      });
    }

    fetchVolume();
    stopVolume = $interval(fetchVolume, 2 * 60000);

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
      if (angular.isDefined(stopVolume)) {
        $interval.cancel(stopVolume);
        stopVolume = undefined;
      }
    }

    $scope.$on('$destroy', function() {
      stopUpdate();
    });

    $scope.goTo = function(route) {
      $state.go(route);
    };

    $scope.$watch('$state.current.name', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        checkTabs();
      }
    });

    function checkTabs() {
      if ($state.current.name.split('.').length === 2) {
        $scope.tabs.forEach(function(tab) {
          if (tab.name === $state.current.name) {
            tab.active = true;
          } else {
            tab.active = false;
          }
        });
      }
    }

    checkTabs();

  }
]);