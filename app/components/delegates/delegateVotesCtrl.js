angular.module('app')

.controller('delegateVotesCtrl', ['$scope', '$rootScope', '$state', '$location', '$translate', 'api', 'Assets', 'Delegates', 'Translate', 'Charts', 'Meta', 'appcst',
  function($scope, $rootScope, $state, $location, $translate, api, Assets, Delegates, Translate, Charts, Meta, appcst) {
    // $scope.delegateName = $state.params.name;
    $scope.baseAsset = appcst.baseAsset;
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
          valueSuffix: ' '+$scope.baseAsset,
          headerFormat: '<span style="font-size: 10px">Block: {point.key}</span><br/>'
        }
      })],
      yAxis: {
        title: {
          text: $scope.baseAsset
        }
      },
      size: {
        height: 225
      },
      noLegend: true
    });

    function fetchVotes(name) {
      Delegates.fetchVotes(name).then(function(result) {
        $scope.votes = result;
        $scope.highchartsVotes.series[0].data = result.votesSum;
      });
    }

    if ($scope.$parent.delegate) {
      fetchVotes($scope.$parent.delegate.name);
    }

    $scope.$watch('$parent.delegate.name', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        fetchVotes(newValue);
      }
    });

    function getTranslations() {
      Translate.delegate().then(function(result) {
        $scope.highchartsVotes.series[0].name = result.sumVotes;
        $scope.highchartsVotes.xAxis.title = result.blocknum;
        $scope.highchartsVotes.series[0].tooltip.headerFormat = '<span style="font-size: 10px">' + result.block + ': {point.key}</span><br/>';
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