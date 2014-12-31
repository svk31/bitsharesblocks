angular.module('app')

.controller('delegatesCtrl', ['$rootScope','$scope','$location','$alert','$interval', 'Assets', 'Delegates', 'Translate',
  function($rootScope, $scope, $location, $alert, $interval, Assets, Delegates, Translate) {
    var stopDelegates;
    var activeDelegates=5*101;
    $scope.orderByField = 'rank';
    $scope.reverseSort=false;

    $scope.delegateNames = Delegates.getDelegateNamesArray();
    $scope.standbyBoolean = Delegates.getStandbyBoolean();

    $scope.toggleStandby = function(standbyBoolean) {
      Delegates.setStandbyBoolean(standbyBoolean);
      fetchDelegates();
    };

    function fetchDelegates() {
      Delegates.fetchDelegates(false).then(function(result) {
        $scope.delegates = result.delegates;
        
        checkMaintenance(result.maintenance);     
      });  
    }

    fetchDelegates();
    stopDelegates = $interval(fetchDelegates,90000,0,false);



    $scope.submitDelegate = function(delegate) {
      $location.path('/delegates/delegate').search({'name':delegate});
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

var myAlert = $alert({'title': 'An upgrade to v0.4.26 for delegates is required asap, see https://bitsharestalk.org/index.php?topic=7067.msg161432#msg161432', 'content': '', 'container':'#alerts-container-indexing',
  'type': 'danger', 'show': false,'duration':0});

var alertSet = false;

function checkMaintenance(maintenance) {
  if(maintenance===true && alertSet===false) {
    myAlert.show(true);
    alertSet=true;
  }
  else if (alertSet===true && maintenance===false) {
    myAlert.hide(true);
    alertSet=false;
  }
}

function getTranslations() {
  Translate.delegates().then(function(result) {
    $scope.headers = result.headers;
  });
}

getTranslations();

$rootScope.$on('$translateLoadingSuccess', function () {
  getTranslations();
});

$rootScope.$on('languageChange', function () {
  getTranslations();
});

}]);


