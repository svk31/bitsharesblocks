angular.module('app')

.controller('singleDelegateCtrl', ['$scope', '$rootScope', '$state', '$location', '$translate', 'api', 'Assets', 'Delegates', 'Translate', 'Charts',
  function($scope, $rootScope, $state, $location, $translate, api, Assets, Delegates, Translate, Charts) {
    $scope.delegateName = $state.params.name;
    $scope.status = {};
    $scope.status.open = false;
    $scope.orderByField = 'last_update';
    $scope.reverseSort = true;

    $scope.highchartsVotes = new Charts.chartConfig({
      type: 'area',
      useHighStocks: false,
      series: [new Charts.serie({
        name: '',
        marker: {
          enabled: false
        },
        tooltip: {
          valueDecimals: 0,
          valueSuffix: ' BTS',
          headerFormat: '<span style="font-size: 10px">Block: {point.key}</span><br/>'
        }
      })],
      yAxis: {
        title: {
          text: 'BTS'
        }
      },
      size: {
        height: 225
      },
      noLegend: true
    });

    $scope.chartPay = angular.copy($scope.highchartsVotes);

    $scope.chartPay.xAxis.type = 'datetime';


    $scope.filterFeeds = function(boolean) {
      var filteredFeeds = Delegates.filterFeeds(boolean);
      $scope.feeds = filteredFeeds.feeds;
      $scope.feedInfo = filteredFeeds.feedInfo;
    };

    function fetchVotes(name) {
      Delegates.fetchVotes(name).then(function(result) {
        $scope.votes = result;
        $scope.highchartsVotes.series[0].data = result.votesSum;
      });
    }

    function fetchDelegate(name, rank) {
      Delegates.fetchDelegate(name, rank).then(function(result) {

        $scope.delegate = result.delegate;
        $scope.latencies = result.latencies;
        $scope.delegateName = result.delegate.name;

        $scope.filterFeeds(true);

        $scope.chartPay.series[0].data = result.withdrawals;

        $scope.delegate.withdrawn = $scope.delegate.totalEarnings - $scope.delegate.delegate_info.pay_balance;

        if (name === false) {
          $location.search('name', result.delegate.name);
          fetchVotes(result.delegate.name);
        }
      });
    }

    fetchDelegate($scope.delegateName);
    fetchVotes($scope.delegateName);

    $scope.getNextDelegate = function(rank) {
      rank = Math.max(1, rank);

      fetchDelegate(false, rank);
    };

    function getTranslations() {
      Translate.delegate().then(function(result) {
        $scope.highchartsVotes.series[0].name = result.sumVotes;
        $scope.highchartsVotes.xAxis.title = result.blocknum;
        $scope.highchartsVotes.series[0].tooltip.headerFormat = '<span style="font-size: 10px">' + result.block + ': {point.key}</span><br/>';
        $scope.chartPay.series[0].name = result.payChart;
        $scope.chartPay.series[0].tooltip.headerFormat = '<span style="font-size: 10px">' + result.date + ': {point.key}</span><br/>';
        $scope.chartPay.xAxis.title = result.date;
        $scope.headers = result.headers;
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