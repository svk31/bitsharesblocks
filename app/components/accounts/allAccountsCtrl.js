angular.module('app')

.controller('allAccountsCtrl', ['$scope', '$rootScope', '$state', '$location', '$alert', 'api', 'Accounts',
  function($scope, $rootScope, $state, $location, $alert, api, Accounts) {
    var _top = parseInt($state.params.top, 10);

    var myAlert = $alert({
      'title': 'Not found or not valid search term',
      'content': '',
      'container': '#alerts-container',
      'type': 'danger',
      'show': false,
      'duration': 5
    });

    $scope.query = $state.params.query;

    $scope.accounts = [];
    $scope.pageCount = 20;
    $scope.oldPage = 1;
    $scope.maxSize = 0;
    $scope.currentPage = 1;

    function fetchAccounts(mostRecent, highestId, query) {

      Accounts.fetchAccounts(mostRecent, highestId, query).then(function(result) {
        $scope.accounts = result.accounts;
        $scope.accountsCount = result.accountsCount;

        if (Math.abs($scope.currentPage - $scope.oldPage) === 0) {
          $scope.currentPage = Math.floor(($scope.accountsCount - $scope.accounts[0]._id) / $scope.pageCount + 1);
          $scope.oldPage = $scope.currentPage;
        }

        if (highestId) {
          updateLocation();
        } else if (query !== undefined) {
          if (result.accounts.length === 0) {
            myAlert.show(true);
          } else {
            $location.search('');
            $location.path('/accounts').search('query', query);
          }
        }
      });
    }

    function pageChanged(lastID) {
      var pageDelta = $scope.currentPage - $scope.oldPage;

      $scope.oldPage = $scope.currentPage;
      var highestID;

      if ($scope.accounts[0] && lastID === undefined) {
        highestID = $scope.accounts[0]._id - (1 + (pageDelta - 1)) * $scope.pageCount;
      } else if (lastID) {
        highestID = lastID;
      }

      highestID = Math.max(highestID, $scope.pageCount);

      fetchAccounts(false, highestID);

    }

    function updateLocation() {
      var highestID = Math.max($scope.accounts[0]._id, $scope.accounts[$scope.accounts.length - 1]._id);
      $location.search('top=' + highestID);
      _top = highestID;
    }

    $scope.submitAccount = function(query) {
      api.searchAccounts(query).success(function(accounts) {
        fetchAccounts(false, false, query);
      });
    };

    $scope.changePage = function() {
      if ($scope.currentPage === 1 || ($scope.currentPage - $scope.oldPage < -1)) {
        $scope.oldPage = 1;
        fetchAccounts(true);
        $location.search('');
      } else {
        pageChanged();
      }
    };

    $scope.setOverview = function(lastID) {
      pageChanged(lastID);
    };

    if ($state.params.top !== undefined) {
      pageChanged(Math.max(_top, 1));
    } else if ($state.params.query !== undefined) {
      $scope.submitAccount($scope.query);
    } else {
      fetchAccounts(true);
    }

  }
]);