angular.module('app')

.controller('delegatesCtrl', ['$rootScope', '$scope', '$location', '$alert', '$interval', 'Assets', 'Delegates', 'Translate', 'Alerts',
  function($rootScope, $scope, $location, $alert, $interval, Assets, Delegates, Translate, Alerts) {
    var stopDelegates;
    var activeDelegates = 5 * 101;
    $scope.orderByField = 'rank';
    $scope.reverseSort = false;

    $scope.delegateNames = Delegates.getDelegateNamesArray();

    $scope.selectedTypes = store.get('delegateChoice');
    if ($scope.selectedTypes === undefined || $scope.selectedTypes.length === 0) {
      $scope.selectedTypes = ['active'];
    }

    $scope.query = {
      active: true,
      standby: false
    };

    var notFoundAlert = Alerts.notFound();

    function fetchDelegates() {
      $scope.query.active = false;
      $scope.query.standby = false;
      $scope.selectedTypes.forEach(function(value) {
        if (value === 'active') {
          $scope.query.active = true;
        }
        if (value === 'standby') {
          $scope.query.standby = true;
        }
      });
      Delegates.fetchDelegates($scope.query).then(function(result) {
        $scope.delegates = result.delegates;
        checkMaintenance(result.maintenance);
      });
    }

    fetchDelegates();
    stopDelegates = $interval(fetchDelegates, 90000, 0, false);

    $scope.getNames = function(query) {
      if (query !== undefined && query.length > 1) {
        return Delegates.fetchDelegatesByName(query);
      }
    };

    $scope.submitDelegate = function(delegate) {
      Delegates.fetchDelegatesByName(delegate).then(function(result) {
        if (result.length === 1 && result[0].name === delegate) {
          $location.path('/delegates/delegate').search({
            'name': delegate
          });
        } else {
          notFoundAlert.show(true);
        }
      });
    };

    function stopUpdate() {
      if (angular.isDefined(stopDelegates)) {
        $interval.cancel(stopDelegates);
        stopDelegates = undefined;
      }
    }

    $scope.$on('$destroy', function() {
      stopUpdate();
    });

    // var myAlert = $alert({'title': 'Currently re-indexing transactions, some data may be incorrect, thank you for your understanding', 'content': '', 'container':'#alerts-container-indexing',
    //   'type': 'danger', 'show': false,'duration':0});

    var myAlert = $alert({
      'title': 'An upgrade to v0.4.26 for delegates is required asap, see https://bitsharestalk.org/index.php?topic=7067.msg161432#msg161432',
      'content': '',
      'container': '#alerts-container-indexing',
      'type': 'danger',
      'show': false,
      'duration': 0
    });

    var alertSet = false;

    function checkMaintenance(maintenance) {
      if (maintenance === true && alertSet === false) {
        myAlert.show(true);
        alertSet = true;
      } else if (alertSet === true && maintenance === false) {
        myAlert.hide(true);
        alertSet = false;
      }
    }

    function getTranslations() {
      Translate.delegates().then(function(result) {
        $scope.headers = result.headers;

        $scope.types.forEach(function(choice) {
          choice.name = result.selections[choice.type];
        });
      });
    }

    getTranslations();

    $rootScope.$on('$translateLoadingSuccess', function() {
      getTranslations();
    });

    $rootScope.$on('languageChange', function() {
      getTranslations();
    });

    $scope.types = [{
      type: 'active'
    }, {
      type: 'standby'
    }];

    $scope.booleanTrx = ($scope.selectedTypes.length > 0);
    var listener;

    function watchTrx() {
      listener = $scope.$watch('selectedTypes', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          if (newValue.length === 0) {
            listener();
            $scope.selectedTypes = oldValue;
            watchTrx();
          }
          $scope.selectedTypes = store.set('delegateChoice', $scope.selectedTypes);
          fetchDelegates();

        }
      });
    }

    watchTrx();

  }
]);