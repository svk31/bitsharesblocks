angular.module('app')

.controller('blocksCtrl', ['$scope', '$rootScope', '$state', '$location', '$interval', '$timeout', '$alert', 'api', 'Assets', 'Blocks', 'Translate',
  function($scope, $rootScope, $state, $location, $interval, $timeout, $alert, api, Assets, Blocks, Translate) {

    var top = parseInt($state.params.top, 10);
    var maxBlock, stopUpdate;
    var oldPage = 1,
      totalPages;
    $scope.blockCount = 20;
    $scope.maxSize = 0;
    $scope.currentPage = 1;

    // $scope.placeholder = 'initial';

    $scope.booleanTrx = Blocks.getBooleanTrx();

    function getRecent() {
      console.log('get recent triggered');
      console.log(stopUpdate);
      stopUpdates();
      console.log(stopUpdate);
      Blocks.fetchRecent().then(function(result) {
        $scope.blocks = result.blocks;
        maxBlock = result.maxBlock;
        $scope.bigTotalItems = maxBlock;
        console.log('setting a new interval to get new blocks');
        stopUpdate = $interval(getNew, 10000, 0, false);
      });
    }

    function getNew() {
      console.log('getting new Blocks, booleanTrx:', $scope.booleanTrx);
      console.log(stopUpdate);
      if ($scope.booleanTrx) {
        Blocks.fetchTransactions({
            types: $scope.selectedTypes,
            block: maxBlock,
            inverse: true
          })
          .then(function(result) {
            $scope.blocks = result.blocks.blocks;
            maxBlock = $scope.blocks[0]._id;
            $scope.bigTotalItems = result.maxBlock;
          });

      } else {
        Blocks.fetchNew().then(function(result) {
          $scope.blocks = result.blocks;
          maxBlock = result.maxBlock;
          $scope.bigTotalItems = maxBlock;
        });
      }
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
      console.log('page changer triggered');
      var pageDelta = $scope.currentPage - oldPage;
      Blocks.fetchPage(pageDelta, lastblock, $scope.selectedTypes, $state.params.trx).then(function(result) {

        $scope.blocks = result.blocks;
        maxBlock = result.maxBlock;
        $scope.bigTotalItems = result.currentBlock;
        if (Math.abs(pageDelta) <= 1) {
          $scope.currentPage = Math.floor(($scope.bigTotalItems - maxBlock) / $scope.blockCount + 1);
        } else {
          console.log(pageDelta);
          $scope.currentPage = Math.ceil($scope.bigTotalItems / $scope.blockCount);
        }
        console.log(result);
        if (result.finalPage) {
          $scope.currentPage = Math.ceil($scope.bigTotalItems / $scope.blockCount);
        }
        console.log('currentPage', $scope.currentPage);
        oldPage = $scope.currentPage;

        updateLocation();
      });
    }

    function updateLocation() {
      highestBlock = maxBlock;
      if ($scope.currentPage === 1) {
        $location.search('');
        stopUpdates();
      } else {
        if ($scope.booleanTrx) {
          $location.search('top=' + highestBlock + '&trx=true');
        } else {
          $location.search('top=' + highestBlock);
        }
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
      console.log('trx toggle, $scope.currentPage:', $scope.currentPage, ', oldPage:', oldPage);
      Blocks.setBooleanTrx($scope.booleanTrx);
      if ($scope.currentPage === 1 || ($scope.currentPage - oldPage < -1)) {
        oldPage = 1;
        if ($scope.booleanTrx) {
          fetchTransactions();
        } else {
          console.log('toggle trx, getting recent');
          getRecent();
        }
        updateLocation();

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

    function getTranslations() {
      Translate.blocks().then(function(result) {
        $scope.search1 = result.search1;
        $scope.search2 = result.search2;
        $scope.last = result.last;
        $scope.blocksText = result.blocks;
        $scope.placeholder = result.placeholder;
      });
      Translate.trxTypes().then(function(result) {
        $scope.trxTypes = result;
        $scope.types.forEach(function(trx) {
          trx.name = $scope.trxTypes[trx.type];
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
      type: 'all'
    }, {
      type: 'transfer'
    }, {
      type: 'account_register'
    }, {
      type: 'update_feed'
    }, {
      type: 'account_update'
    }, {
      type: 'asset_ask'
    }, {
      type: 'asset_bid'
    }, {
      type: 'asset_short'
    }, {
      type: 'asset_cover'
    }, {
      type: 'add_collateral'
    }, {
      type: 'withdraw_pay'
    }, {
      type: 'asset_create'
    }, {
      type: 'asset_issue'
    }, {
      type: 'burn'
    }];

    $scope.selectedTypes = store.get('transactionTypes');
    if ($scope.selectedTypes === undefined || $scope.selectedTypes.length === 0) {
      $scope.selectedTypes = [];
    }

    $scope.booleanTrx = ($scope.selectedTypes.length > 0);
    var listener;

    function watchTrx() {
      listener = $scope.$watch('selectedTypes', function(newValue, oldValue) {

        if (newValue !== oldValue) {
          $scope.booleanTrx = ($scope.selectedTypes.length > 0);
          Blocks.setBooleanTrx($scope.booleanTrx);
          stopUpdates();

          var types = [];
          var showAll = false;
          newValue.forEach(function(transaction) {
            if (transaction === 'all') {
              if (!oldValue[0] || oldValue[0] !== 'all') {
                showAll = true;
              }
            } else {
              // Deselect 'all' if another type is chosen         
              if ($scope.selectedTypes[0] === 'all') {
                listener();
                $scope.selectedTypes.shift();
                watchTrx();
              }
            }
          });

          // Deselect all other types if 'all' is chosen
          if (showAll) {
            listener();
            $scope.selectedTypes = ['all'];
            watchTrx();
          }

          fetchTransactions();

        }
      });
    }

    watchTrx();

    function fetchTransactions() {
      store.set('transactionTypes', $scope.selectedTypes);
      if ($scope.selectedTypes.length > 0) {
        Blocks.fetchTransactions({
            types: $scope.selectedTypes
          })
          .then(function(result) {
            $scope.blocks = result.blocks.blocks;
            maxBlock = $scope.blocks[0]._id;
            $scope.bigTotalItems = result.maxBlock;
          });
        stopUpdates();
        console.log('setting a new interval to get new blocks');
        stopUpdate = $interval(getNew, 10000, 0, false);
      } else {
        getRecent();
      }
    }

    // Launching here
    if ($state.params.top !== undefined) {
      pageChanger(Math.max(top, 1));
    } else {
      if ($scope.booleanTrx) {
        fetchTransactions();
      } else {
        getRecent();
      }
    }

    $scope.$on('$destroy', function() {
      listener();
      stopUpdates();
    });
  }
]);