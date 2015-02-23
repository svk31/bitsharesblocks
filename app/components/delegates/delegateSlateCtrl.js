angular.module('app')

.controller('delegateSlateCtrl', ['$scope', 'Delegates',
  function($scope, Delegates) {

    $scope.orderByField = '1';
    $scope.reverseSort = false;

    function getSlate(delegate) {
      Delegates.fetchSlate(delegate)
        .then(function(slate) {
          $scope.slate = slate;
        });
    }

    $scope.$watch('$parent.delegate', function(newValue, oldValue) {
      if (newValue) {
        getSlate(newValue.name);
      }
    }, true);
  }
]);