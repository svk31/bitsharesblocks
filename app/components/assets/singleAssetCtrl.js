angular.module('app')

.controller('assetCtrl', ['$scope', '$rootScope', '$state', '$interval', 'api', '$filter', 'Translate', 'Assets', 'Charts',
  function($scope, $rootScope, $state, $interval, api, $filter, Translate, Assets, Charts) {

    $scope.tabs = [{
      active: true,
      name: 'asset.orderbook'
    }, {
      active: false,
      name: 'asset.info'
    }];

    $scope.goTo = function(route) {
      $state.go(route, {
        'asset': $state.params.asset
      });
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