angular.module('app')

.controller('singleDelegateCtrl', ['$scope', '$rootScope', '$state', '$location', '$translate', 'api', 'Delegates', 'Translate', 'Meta',
  function($scope, $rootScope, $state, $location, $translate, api, Delegates, Translate, Meta) {
    $scope.delegateName = $state.params.name;
    $scope.status = {};
    $scope.status.open = false;
    $scope.orderByField = 'last_update';
    $scope.reverseSort = true;

    $scope.tabs = [{
      active: true,
      disabled: false,
      name: 'delegate.votes'
    }, {
      active: false,
      disabled: true,
      name: 'delegate.info'
    }, {
      active: false,
      disabled: true,
      name: 'delegate.feeds'
    }, {
      active: false,
      disabled: true,
      name: 'delegate.slate'
    }, {
      active: false,
      disabled: true,
      name: 'delegate.earnings'
    }];

    function fetchDelegate(name, rank) {
      Delegates.fetchDelegate(name, rank).then(function(result) {
        Meta.add('/delegates/delegate', {
          title: 'Bitshares Delegate ' + result.delegate.name + ' info: votes history, salary and feeds'
        });
        $scope.delegate = result.delegate;
        $scope.latencies = result.latencies;
        $scope.delegateName = result.delegate.name;

        $scope.withdrawals = result.withdrawals;

        $scope.delegate.withdrawn = $scope.delegate.totalEarnings - $scope.delegate.delegate_info.pay_balance;

        if (name === false) {
          $location.search('name', result.delegate.name);
        }
      });
    }

    fetchDelegate($scope.delegateName);

    $scope.getNextDelegate = function(rank) {
      rank = Math.max(1, rank);
      fetchDelegate(false, rank);
    };

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

    $scope.goTo = function(route) {
      $state.go(route);
    };

    checkTabs();


  }
]);