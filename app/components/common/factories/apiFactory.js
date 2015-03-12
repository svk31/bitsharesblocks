angular.module("app").factory('api', ['$http', function($http) {
    var api = {},
        url, url_v2;

    var cb = '?callback=JSON_CALLBACK';

    var apis = [
        'https://api.bitsharesblocks.com',
        'http://104.236.93.62',
        'http://128.199.123.149'
    ];

    url = apis[0] + '/v1/';
    url_v2 = apis[0] + '/v2/';

    // url = 'http://127.0.0.1:2095/v1/';
    // url_v2 = 'http://127.0.0.1:2095/v2/';

    api.setAPI = function(index) {
        // var location = ['North America - New York', 'Asia - Singapore'];
        // console.log('changing API to:',location[index]);
        url = apis[index] + '/v1/';
        url_v2 = apis[index] + '/v2/';
    };

    api.getInfo = function() {
        return $http({
            method: 'JSONP',
            url: url + 'info' + cb,
            cache: true
        });
    };

    api.getTransactions = function(query) {
        return $http({
            method: 'JSONP',
            url: url + 'transactions/' + query + cb,
            cache: false
        });
    };

    api.getDelegateNames = function() {
        return $http({
            method: 'JSONP',
            url: url + 'delegateNames' + cb,
            cache: false
        });
    };

    api.getGenesis = function() {
        return $http({
            method: 'JSONP',
            url: url + 'genesis' + cb,
            cache: true
        });
    };

    api.getGenesisBTSX = function() {
        return $http({
            method: 'JSONP',
            url: url + 'genesisbtsx' + cb,
            cache: true
        });
    };

    api.getInflation = function() {
        return $http({
            method: 'JSONP',
            url: url + 'inflation' + cb,
            cache: false
        });
    };

    api.getFees = function(query) {
        return $http({
            method: 'JSONP',
            url: url_v2 + 'fees/' + JSON.stringify(query) + cb,
            cache: false
        });
    };

    api.getPrecision = function(id) {
        return $http({
            method: 'JSONP',
            url: url + 'getprecision/' + id + cb,
            cache: false
        });
    };

    api.getAssetDetail = function() {
        return $http({
            method: 'JSONP',
            url: url + 'assetdetail/' + cb,
            cache: true
        });
    };

    api.getHome = function(cacheBoolean) {
        return $http({
            method: 'JSONP',
            url: url + 'home' + cb,
            cache: cacheBoolean
        });
    };

    api.getAssets = function() {
        return $http({
            method: 'JSONP',
            url: url_v2 + 'assets' + cb,
            cache: false
        });
    };

    api.getUserAssets = function() {
        return $http({
            method: 'JSONP',
            url: url_v2 + 'userassets' + cb,
            cache: false
        });
    };

    api.getRecentBlocks = function() {
        return $http({
            method: 'JSONP',
            url: url + 'blocks/new' + cb,
            cache: false
        });
    };

    api.getHomeBlocks = function() {
        return $http({
            method: 'JSONP',
            url: url + 'homeblocks' + cb,
            cache: false
        });
    };

    api.getCurrentBlock = function() {
        return $http({
            method: 'JSONP',
            url: url + 'currentblock' + cb,
            cache: false
        });
    };

    api.getDelegates = function(query) {
        return $http({
            method: 'JSONP',
            url: url_v2 + 'delegates/' + JSON.stringify(query) + cb
        });
    };

    api.getActiveDelegates = function(cacheBoolean) {
        return $http({
            method: 'JSONP',
            url: url + 'activedelegates' + cb,
            cache: false
        });
    };

    api.searchDelegatesByName = function(query) {
        return $http.jsonp(url + 'delegatebyname/' + query + cb);
    };

    api.getDelegateById = function(id) {
        return $http.jsonp(url + 'delegatenamebyid/' + id + cb);
    };

    api.getNewBlocks = function(lastBlock) {
        return $http.jsonp(url + 'blocks/new/' + lastBlock + cb);
    };

    api.getBlock = function(blockNum) {
        return $http.jsonp(url + 'blocks/' + blockNum + cb);

    };

    api.getBlocksPage = function(blockNum) {
        return $http.jsonp(url + 'blocks/page/' + blockNum + cb);
    };

    api.getTrxBlocksPage = function(blockNum) {
        return $http.jsonp(url + 'blockstrx/page/' + blockNum + cb);
    };

    api.getTrxBlocksPageInverse = function(blockNum) {
        return $http.jsonp(url + 'blockstrx/pageinverse/' + blockNum + cb);
    };

    api.getAsset = function(assetId) {
        return $http.jsonp(url_v2 + 'assets/' + assetId + cb);
    };

    api.getOrderBook = function(assetId) {
        return $http.jsonp(url_v2 + 'orderbook/' + assetId + cb);
    };

    api.getPriceHistory = function(assetId) {
        return $http.jsonp(url_v2 + 'pricehistory/' + assetId + cb);
    };

    api.getPrice = function(unit) {
        return $http.jsonp(url + 'price/' + unit + cb);
    };

    api.getHomePrice = function(unit) {
        return $http.jsonp(url + 'homeprice/' + unit + cb);
    };

    api.getBlockByTrx = function(trxid) {
        return $http.jsonp(url + 'blocksbytrx/' + trxid + cb);
    };

    api.getDelegate = function(name) {
        return $http.jsonp(url + 'delegates/' + name + cb);
    };

    api.getDelegateVotes = function(name) {
        return $http.jsonp(url + 'delegatevotes/' + name + cb);
    };

    api.getDelegateByRank = function(rank) {
        return $http.jsonp(url + 'delegatesbyrank/' + rank + cb);
    };

    api.getRecentBlocksTrx = function() {
        return $http.jsonp(url + 'blockstrx/new' + cb);
    };

    api.getNewBlocksTrx = function(lastBlock) {
        return $http.jsonp(url + 'blockstrx/new/' + lastBlock + cb);
    };

    // api.getVolume = function(cacheBoolean) {
    //     return $http({
    //         method: 'JSONP',
    //         url: url + 'volume' + cb,
    //         cache: cacheBoolean
    //     });
    // };

    api.getCharts = function(query) {
        return $http({
            method: 'JSONP',
            url: url_v2 + 'charts/' + JSON.stringify(query) + cb,
            cache: true
        });
    };

    api.getFeedCharts = function(id) {
        return $http({
            method: 'JSONP',
            url: url + 'feedstats/' + id + cb,
            cache: true
        });
    };

    api.getAssetVolume = function(cacheBoolean) {
        return $http({
            method: 'JSONP',
            url: url + 'assetvolume' + cb,
            cache: cacheBoolean
        });
    };

    api.getAssetVolume2 = function(query) {
        return $http({
            method: 'JSONP',
            url: url_v2 + 'assetvolume/' + JSON.stringify(query) + cb
        });
    };

    api.getAccountByNr = function(nr) {
        return $http.jsonp(url + 'accountsbynr/' + nr + cb);
    };

    api.getAccount = function(name) {
        return $http.jsonp(url + 'accounts/' + name + cb);
    };

    api.getSubAccounts = function(name) {
        return $http.jsonp(url + 'subaccounts/' + name + cb);
    };

    api.getAccounts = function() {
        return $http.jsonp(url + 'accounts' + cb);
    };

    api.getBurns = function(sort) {
        return $http.jsonp(url + 'burns/' + sort + cb);
    };

    api.getAccountsCount = function() {
        return $http.jsonp(url + 'accountscount' + cb);
    };

    api.getAccountsPage = function(topId) {
        return $http.jsonp(url + 'accountspage/' + topId + cb);
    };

    api.searchAccounts = function(query) {
        return $http.jsonp(url + 'accountssearch/' + query + cb);
    };

    api.getSlate = function(accountName) {
        return $http.jsonp(url + 'slate/' + accountName + cb);
    };

    return api;

}]);