angular.module('app')

.controller('singleDelegateCtrl', ['$scope', '$rootScope', '$state', '$location', '$translate', 'api', 'Delegates', 'Translate', 'Meta', 'appcst',
  function($scope, $rootScope, $state, $location, $translate, api, Delegates, Translate, Meta, appcst) {
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

    $scope.$watch('delegateName', function(nv, ov) {
      if (nv) {
        Meta.add('/delegate/*', {
          title: appcst.baseAsset + ':' + nv + ' info: votes history, salary and feeds'
        });
      }
    });

    function fetchDelegate(name, rank) {
      Delegates.fetchDelegate(name, rank).then(function(result) {
        $scope.delegate = result.delegate;
        $scope.latencies = result.latencies;
        $scope.delegateName = result.delegate.name;

        $scope.withdrawals = result.withdrawals;

        $scope.website = result.delegate.website;

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

    function getTranslations() {
      if ($scope.delegate) {
        if ($scope.delegate.public_data.delegate.role >= 0) {
          Translate.delegateRole($scope.delegate.public_data.delegate.role).then(function(result) {
            $scope.delegate.role = result.role;
          });
        }
      }
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