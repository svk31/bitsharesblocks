angular.module('app')

.controller('delegateInfoCtrl', ['$scope', '$rootScope', '$state', '$location', '$translate', 'api', 'Assets', 'Delegates', 'Translate', 'Charts', 'Meta',
  function($scope, $rootScope, $state, $location, $translate, api, Assets, Delegates, Translate, Charts, Meta) {
    $scope.delegateName = $state.params.name;

    function fetchDelegate(name, rank) {
      Delegates.fetchDelegate(name, rank).then(function(result) {
        Meta.add('/delegates/delegate', {
          title: 'Bitshares Delegate ' + result.delegate.name + ' info: votes history, salary and feeds'
        });
        $scope.delegate = result.delegate;
        $scope.latencies = result.latencies;
        $scope.delegateName = result.delegate.name;

        $scope.filterFeeds(true);

        $scope.delegate.withdrawn = $scope.delegate.totalEarnings - $scope.delegate.delegate_info.pay_balance;

        if (name === false) {
          $location.search('name', result.delegate.name);
          fetchVotes(result.delegate.name);
        }
      });
    }

    // $scope.$watch('$parent.delegate', function(newValue,oldValue) {
    //   console.log(newValue);
    //   if (newValue !== oldValue) {
    //     $scope.delegate = newValue;
    //   }
    // });

    // fetchDelegate($scope.delegateName);

    function getTranslations() {
      Translate.delegate().then(function(result) {
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