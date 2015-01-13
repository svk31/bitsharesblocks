angular.module("app").config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/home");
  //
  // Now set up the states
  $stateProvider
    .state('delegates', {
      url: "/delegates",
      templateUrl: "allDelegates.html",
      controller: 'delegatesCtrl'
    })
    .state('delegate', {
      url: "/delegates/delegate?name",
      reloadOnSearch: false,
      templateUrl: "singleDelegate.html",
      controller: 'singleDelegateCtrl'
    })
    .state('blocks', {
      url: "/blocks?top&trx",
      reloadOnSearch: false,
      templateUrl: "allBlocks.html",
      resolve: {
        Assets: 'Assets',
        getAssets: function(Assets) {
          return Assets.init();
        }
      },
      controller: 'blocksCtrl'
    })
    .state('block', {
      url: "/blocks/block?id",
      reloadOnSearch: false,
      templateUrl: "singleBlock.html",
      resolve: {
        Assets: 'Assets',
        getAssets: function(Assets) {
          return Assets.init();
        }
      },
      controller: 'blockCtrl'
    })
    .state('charts', {
      url: "/charts",
      templateUrl: "charts.html",
      controller: 'chartsCtrl'
    })
    .state('charts.prices', {
      url: "/prices",
      views: {
        'charts-prices': {
          templateUrl: "priceCharts.html",
          controller: 'priceChartsCtrl'
        }
      }
    })
    .state('charts.transactions', {
      url: "/transactions",
      views: {
        'charts-transactions': {
          templateUrl: "transactionCharts.html",
          controller: 'transactionChartsCtrl'
        }
      }
    })
    .state('charts.accounts', {
      url: "/accounts",
      views: {
        'charts-accounts': {
          templateUrl: "accountsCharts.html",
          controller: 'accountsChartsCtrl'
        }
      }
    })
    .state('assets', {
      url: "/assets",
      templateUrl: "allAssets.html",
      controller: 'assetsCtrl'
    })
    .state('assets.market', {
      url: "/market",
      views: {
        'market-assets': {
          templateUrl: "marketAssets.html",
          controller: 'marketAssetsCtrl'
        }
      }
    })
    .state('assets.user', {
      url: "/user",
      views: {
        'user-assets': {
          templateUrl: "userAssets.html",
          controller: 'userAssetsCtrl'
        }
      }
    })
    .state('about', {
      url: "/about",
      templateUrl: "about.html",
      controller: "aboutCtrl"
    })
    .state('asset', {
      url: "/assets/asset?id",
      reloadOnSearch: false,
      templateUrl: "singleAsset.html",
      controller: 'assetCtrl'
    })
    .state('accounts', {
      url: "/accounts?top&query",
      reloadOnSearch: false,
      templateUrl: "allAccounts.html",
      controller: 'allAccountsCtrl'
    })
    .state('account', {
      url: "/accounts/account?name",
      reloadOnSearch: false,
      templateUrl: "singleAccount.html",
      controller: 'singleAccountCtrl'
    })
    .state('genesisbts', {
      url: "/genesis-bts",
      templateUrl: "genesis-bts.html",
      controller: 'genesisBTSCtrl'
    })
    .state('genesisbtsx', {
      url: "/genesis-btsx",
      templateUrl: "genesis-btsx.html",
      controller: 'genesisBTSXCtrl'
    })
    .state('supply', {
      url: "/supply",
      templateUrl: "supply.html",
      controller: 'supplyCtrl'
    })
    .state('home', {
      url: "/home",
      templateUrl: "home.html",
      resolve: {
        Assets: 'Assets',
        getAssets: function(Assets) {
          return Assets.init();
        }
      },
      controller: 'homeCtrl'
    });
});