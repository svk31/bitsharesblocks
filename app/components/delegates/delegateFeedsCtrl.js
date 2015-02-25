angular.module('app')

.controller('delegateFeedsCtrl', ['$scope', '$rootScope', '$state', '$location', '$translate', 'api', 'Assets', 'Delegates', 'Translate', 'Charts', 'Meta',
  function($scope, $rootScope, $state, $location, $translate, api, Assets, Delegates, Translate, Charts, Meta) {
    $scope.status = {};
    $scope.status.open = false;

    $scope.filterFeeds = function(boolean) {

      var filteredFeeds = Delegates.filterFeeds(boolean);
      $scope.feeds = filteredFeeds.feeds;
      $scope.feedInfo = filteredFeeds.feedInfo;
    };

    $scope.$watch('$parent.delegate', function(newValue, oldValue) {
      if (newValue) {
        $scope.filterFeeds(true);
      }
    }, true);
  }
]);