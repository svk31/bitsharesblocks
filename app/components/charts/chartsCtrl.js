angular.module('app')

.controller('chartsCtrl', ['$scope', '$rootScope', '$filter', '$state', 'api', 'Assets', 'Charts', 'Translate',
  function($scope, $rootScope, $filter, $state, api, Assets, Charts, Translate) {

    $scope.tabs = [{
      active: true,
      name: 'charts.prices'
    }, {
      active: false,
      name: 'charts.transactions'
    }, {
      active: false,
      name: 'charts.accounts'
    }];

    $scope.goTo = function(route) {
      $state.go(route);
    };

    if ($state.current.name.split('.').length === 2) {
      $scope.tabs.forEach(function(tab) {
        if (tab.name === $state.current.name) {
          tab.active = true;
          $scope.goTo($state.current.name);
        } else {
          tab.active = false;
        }
      });
    } else {
      $scope.goTo('charts.prices');
    }


  }
]);