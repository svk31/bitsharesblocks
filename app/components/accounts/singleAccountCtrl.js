angular.module('app')

.controller('singleAccountCtrl', ['$scope', '$rootScope', '$state', '$location', 'Accounts', 'Meta',
  function($scope, $rootScope, $state, $location, Accounts, Meta) {

    $scope.accountName = $state.params.name;

    function fetchAccount(name, id, goTo) {
      Accounts.fetchAccount(name, id).then(function(result) {
        Meta.add('/accounts/account', {
          title: 'Bitshares Account ' + result[0].name
        });
        $scope.account = result[0];

        if (id || goTo) {
          $location.search('name', $scope.account.name);
        }

        if ($scope.account.burn.length > 0) {
          $scope.burnBlocks = {};
          $scope.account.burn.forEach(function(burn, i) {
            Accounts.getBlockNumber(burn.transaction_id).then(function(result) {
              $scope.burnBlocks[i] = result;
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