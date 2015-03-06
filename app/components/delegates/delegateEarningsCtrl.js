angular.module('app')

.controller('delegateEarningsCtrl', ['$scope', '$rootScope', '$state', '$location', '$translate', 'api', 'Assets', 'Delegates', 'Translate', 'Charts', 'Meta', 'appcst',
  function($scope, $rootScope, $state, $location, $translate, api, Assets, Delegates, Translate, Charts, Meta, appcst) {
    $scope.delegateName = $state.params.name;
    $scope.baseAsset = appcst.baseAsset;

    $scope.chartPay = new Charts.chartConfig({
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
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: $scope.baseAsset
        }
      },
      size: {
        height: 275
      },
      noLegend: true
    });

    $scope.$watch('$parent.withdrawals', function(newValue,oldValue) {
        $scope.chartPay.series[0].data = newValue;
    });
    
    function getTranslations() {
      Translate.delegate().then(function(result) {
        $scope.chartPay.series[0].name = result.payChart;
        $scope.chartPay.series[0].tooltip.headerFormat = '<span style="font-size: 10px">' + result.date + ': {point.key}</span><br/>';
        $scope.chartPay.xAxis.title = result.date;
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