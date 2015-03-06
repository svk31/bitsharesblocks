angular.module('app')

.controller('delegateFeedsCtrl', ['$scope', '$rootScope', '$state', '$location', '$translate', 'api', 'Assets', 'Delegates', 'Translate', 'Charts', 'Meta', 'appcst',
  function($scope, $rootScope, $state, $location, $translate, api, Assets, Delegates, Translate, Charts, Meta, appcst) {
    $scope.baseAsset = appcst.baseAsset;
    $scope.status = {};
    $scope.status.open = false;

    $scope.filterFeeds = function(boolean) {
      var filteredFeeds = Delegates.filterFeeds(boolean);
      $scope.feeds = filteredFeeds.feeds;
      $scope.feedInfo = filteredFeeds.feedInfo;
    };

    Assets.fetchAssets(true).then(function(result) {
      $scope.assets = result;

    });

    $scope.$watchGroup(['assets', 'feeds'], function(n, o) {
      var sum = 0, counter=0;
      if (n[0] && n[1]) {
        $scope.feeds.forEach(function(feed) {
          for (var i = 0; i < $scope.assets.length; i++) {
            if ($scope.assets[i].symbol === feed.symbol) {
              feed.deviation = $scope.assets[i].medianFeed !== 0 ? 100*($scope.assets[i].medianFeed - feed.price) / $scope.assets[i].medianFeed: 0;
              sum += feed.deviation;
              counter++;
              break;
            } 
          }
        });
        $scope.avgDeviation = sum / counter;
      }
    });

    $scope.$watch('$parent.delegate', function(newValue, oldValue) {
      if (newValue) {
        $scope.filterFeeds(true);
      }
    }, true);
  }
]);