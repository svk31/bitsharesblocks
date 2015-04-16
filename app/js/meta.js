angular.module('app').config(['MetaProvider', 'appcst', function(MetaProvider, appcst) {

	MetaProvider.when('/', {
		title: appcst.baseAsset+' Block Explorer, BitAssets, Delegates Info, Price Charts',
		description: 'dvs.bitsharesblocks.com: an advanced block explorer for Devshares. Find information on the Devshares delegates, bitassets, user assets, blocks, transactions and statistics'
	});
	MetaProvider.when('/blocks', {
		title: appcst.baseAsset+' Blocks Overview: Live blockchain data',
		description: 'Devshares '+appcst.baseAsset+' block explorer: live and historical blockchain data, block search and transaction filtering'
	});
	MetaProvider.when('/blocks/block', {
		title: appcst.baseAsset+' Block #',
		description: 'Devshares block data: transaction info, delegate votes and more'
	});
	MetaProvider.when('/delegates', {
		title: appcst.baseAsset+' Delegates Overview: Ranks and rank changes, reliability, pay rate ++',
		description: 'Devshares delegates info: rankings, rank changes, reliability, version info. Filter and search for delegates'
	});
	MetaProvider.when('/accounts', {
		title: appcst.baseAsset+' Accounts Overview: Registration date, wall burns ++',
		description: 'Devshares accounts info: search accounts by registration date and name'
	});
	MetaProvider.when('/assets/market', {
		title: appcst.baseAsset+' BitAssets Overview: Price and Volume, Yield, Collateral, Feeds, Marketcap',
		description: 'All about the Devshares BitAssets: price, yield, orderbook, supply and collateral chart, and marketcap'
	});
	MetaProvider.when('/assets/user', {
		title: appcst.baseAsset+' User Assets Overview: Price and Volume, Supply, Marketcap ++',
		description: 'All about the Devshares user assets: price, orderbook, supply chart and marketcap ++'
	});
	MetaProvider.when('/charts/*', {
		title: appcst.baseAsset+' Price History and Supply Charts ++',
		description: 'Devshares historical charts: price, inflation tracking, transaction counts, new accounts over time ++'
	});
	MetaProvider.when('/genesis-bts', {
		title: appcst.baseAsset+' Genesis Data | Rich list and distribution statistics',
		description: 'Devshares '+appcst.baseAsset+' genesis block analysis: charts, rich list, distribution ++'
	});
	MetaProvider.when('/genesis-btsx', {
		title: 'BitsharesX Genesis Data | Rich list and distribution statistics',
		description: 'BitsharesX genesis block analysis: charts, rich list, distribution ++'
	});
	MetaProvider.when('/about', {
		title: 'About Bitsharesblocks and Devshares',
		description: 'Useful links, donation info, dev.bitsharesblocks delegate bid'
	});
}]);