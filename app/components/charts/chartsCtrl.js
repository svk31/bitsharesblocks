angular.module('app')

.controller('chartsCtrl', ['$scope', '$rootScope', '$filter', '$state', 'api', 'Assets', 'Charts', 'Translate',
  function($scope, $rootScope, $filter, $state, api, Assets, Charts, Translate) {

    $scope.tabs = [{
      active: false,
      name: 'charts.prices'
    }, {
      active: true,
      name: 'charts.transactions'
    }, {
      active: false,
      name: 'charts.accounts'
    }, {
      active: false,
      name: 'charts.supply'
    }, {
      active: false,
      name: 'charts.feeds'
    }];

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