angular.module('app')

.controller('singleAccountCtrl', ['$scope', '$rootScope', '$state', '$location', 'Accounts', 'Meta', 'appcst',
  function($scope, $rootScope, $state, $location, Accounts, Meta, appcst) {

    $scope.accountName = $state.params.name;


    $scope.$watch('accountName', function(nv, ov) {
      if (nv) {
        Meta.add('/accounts/account*', {
          title: appcst.baseAsset + ':' + nv
        });
      }
    });

    function fetchAccount(name, id, goTo) {
      Accounts.fetchAccount(name, id).then(function(result) {
        $scope.account = result[0];

        $scope.accountName = $scope.account.name;

        if (id || goTo) {
          $location.search('name', $scope.account.name);
        }

        if ($scope.account.burn.length > 0) {
          $scope.account.burn.forEach(function(burn, i) {
            burn.for = burn.index.account_id > 0;
            Accounts.getBlockNumber(burn.index.transaction_id).then(function(result) {
              $scope.account.burn[i].block = result;
            });
          });
        }
      });
    }

    fetchAccount($scope.accountName);

    $scope.getNextAccount = function(id) {
      id = Math.max(1, id);
      fetchAccount(false, id);
    };

    $scope.goTo = function(name) {
      fetchAccount(name, false, true);
    };

  }
]);