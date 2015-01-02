angular.module('app')

.controller('blocksCtrl', ['$scope', '$rootScope', '$state', '$location', '$interval', '$timeout', '$alert', 'api', 'Assets', 'Blocks', 'Translate',
  function($scope, $rootScope, $state, $location, $interval, $timeout, $alert, api, Assets, Blocks, Translate) {

    var top = parseInt($state.params.top, 10);
    var maxBlock, stopUpdate;
    var oldPage = 1;
    $scope.blockCount = 20;
    $scope.maxSize = 0;
    $scope.currentPage = 1;

    $scope.booleanTrx = Blocks.getBooleanTrx();

    function getRecent() {
      stopUpdates();
      Blocks.fetchRecent().then(function(result) {
        $scope.blocks = result.blocks;
        maxBlock = result.maxBlock;
        $scope.bigTotalItems = maxBlock;
        stopUpdate = $interval(getNew, 10000, 0, false);
      });
    }

    function getNew() {
      Blocks.fetchNew().then(function(result) {
        $scope.blocks = result.blocks;
        maxBlock = result.maxBlock;
        $scope.bigTotalItems = maxBlock;
      });
    }

    if ($state.params.trx !== undefined && $state.params.trx !== 'false') {
      $scope.booleanTrx = true;
      Blocks.setBooleanTrx(true);
    }

    function stopUpdates() {
      if (angular.isDefined(stopUpdate)) {
        $interval.cancel(stopUpdate);
        stopUpdate = undefined;
      }
    }

    function pageChanger(lastblock) {
      stopUpdates();
      var pageDelta = $scope.currentPage - oldPage;
      Blocks.fetchPage(pageDelta, lastblock, $state.params.trx).then(function(result) {
        $scope.blocks = result.blocks;
        maxBlock = result.maxBlock;

        $scope.bigTotalItems = result.currentBlock;

        $scope.currentPage = Math.floor(($scope.bigTotalItems - maxBlock) / $scope.blockCount + 1);
        oldPage = $scope.currentPage;
        updateLocation();
      });
    }

    function updateLocation() {
      highestBlock = maxBlock;
      if ($scope.booleanTrx) {
        $location.search('top=' + highestBlock + '&trx=true');
      } else {
        $location.search('top=' + highestBlock);
      }
      top = highestBlock;
    }

    $scope.goTo = function(blocknumber) {
      if (blocknumber.length < 8 && isNaN(parseInt(blocknumber, 10))) {
        myAlert.show(true);
      } else if (blocknumber.length < 8) {
        $location.path('/blocks/block').search('id', Math.max(blocknumber, 1));
      } else {
        api.getBlockByTrx(blocknumber).success(function(block) {
            if (block) {
              $location.path('/blocks/block').search('id', block._id);
            }
          })
          .error(function(error) {
            myAlert.show(true);
          });
      }
    };

    $scope.toggleTrx = function() {
      Blocks.setBooleanTrx($scope.booleanTrx);
      if ($scope.currentPage === 1 || ($scope.currentPage - oldPage < -1)) {
        oldPage = 1;
        getRecent();
        $location.search('');
      } else {
        pageChanger();
      }
    };

    $scope.setOverview = function(lastBlock) {
      stopUpdates();
      pageChanger(lastBlock);
    };

    var myAlert = $alert({
      'title': 'Not found or not valid search term',
      'content': '',
      'container': '#alerts-container',
      'type': 'danger',
      'show': false,
      'duration': 5
    });

    // var myIndexAlert = $alert({'title': 'Currently re-indexing transactions, some data may be incorrect, thank you for your understanding', 'content': '', 'container':'#alerts-container-indexing',
    //   'type': 'danger', 'show': false,'duration':0});

    var myIndexAlert = $alert({
      'title': 'An upgrade to v0.4.26 for delegates is required asap, see https://bitsharestalk.org/index.php?topic=7067.msg161432#msg161432',
      'content': '',
      'container': '#alerts-container-indexing',
      'type': 'danger',
      'show': false,
      'duration': 0
    });

    var alertSet = false;

    function checkMaintenance() {
      if ($rootScope.maintenance === true && alertSet === false) {
        myIndexAlert.show(true);
        alertSet = true;
      } else if (alertSet === true && $rootScope.maintenance === false) {
        myAlert.hide(true);
        alertSet = false;
      }
    }

    $timeout(checkMaintenance, 300);

    // Launching here
    if ($state.params.top !== undefined) {
      pageChanger(Math.max(top, 1));
    } else {
      getRecent();
    }

    $scope.$on('$destroy', function() {
      stopUpdates();
    });

    function getTranslations() {
      Translate.blocks().then(function(result) {
        $scope.search1 = result.search1;
        $scope.search2 = result.search2;
        $scope.last = result.last;
        $scope.blocksText = result.blocks;
      });
      Translate.trxTypes().then(function(result) {
        $scope.trxTypes = result;
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