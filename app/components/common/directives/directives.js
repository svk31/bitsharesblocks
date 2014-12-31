angular.module('app')

// .directive('mySref', ["$state", function ($state) {
//   return {
//     restrict: 'A',
//     link: function (scope, elem, attrs, ctrl) {
//       elem.on('click', function ()
//       {
//         $state.go(attrs.mySref);
//       });
//     }
//   };
// }])

.directive('ngSortArrows',function() {
  return {
    restrict: 'E',
    scope: {
      'orderString':'@',
      'orderByField':'@',
      'reverseSort':'@'
    },
    templateUrl: 'ng-sort-arrows-template.html'
  };
});
