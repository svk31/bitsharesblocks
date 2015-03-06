angular.module('app').config(['MetaProvider', 'appcst', function(MetaProvider, appcst) {

	MetaProvider.when('/', {
		title: 'Bitshares Block Explorer, Delegates Info, Market Data | Bitsharesblocks.com',
		description: 'Bitsharesblocks.com: an advanced block explorer for Bitshares. Find information on the Bitshares delegates, market data, realtime block updates and more'
	});
	MetaProvider.when('/blocks', {
		title: 'Bitshares Blocks Overview: Live blockchain data',
		description: 'Bitshares block explorer: live and historical blockchain data, block search and transaction filtering'
	});
	MetaProvider.when('/blocks/block', {
		title: 'Bitshares Block #',
		description: 'Bitshares block data: transaction info, delegate votes and more'
	});
	MetaProvider.when('/delegates', {
		title: 'Bitshares Delegates Overview: Ranks and rank changes, reliability, pay rate ++',
		description: 'Bitshares delegates info: rankings, rank changes, reliability, version info. Filter and search for delegates'
	});
	MetaProvider.when('/accounts', {
		title: 'Bitshares Accounts Overview: Registration date, wall burns ++',
		description: 'Bitshares accounts info: search accounts by registration date and name'
	});
	MetaProvider.when('/assets/market', {
		title: 'Bitshares Market Assets Overview: Price and Volume, Yield, Collateral, Marketcap',
		description: 'Bitshares market issued assets overview: discover the ask and bid depth, yield, supply and collateral chart, price, marketcap for all assets'
	});
	MetaProvider.when('/assets/user', {
		title: 'Bitshares User Assets Overview: Price and Volume, Supply, Marketcap ++',
		description: 'Bitshares user issued assets overview: supply chart, price history, marketcap ++'
	});
	MetaProvider.when('/charts/*', {
		title: 'Bitshares Price History and Supply Charts ++',
		description: 'Bitshares historical charts: price, inflation tracking, transaction counts, new accounts over time ++'
	});
	MetaProvider.when('/genesis-bts', {
		title: 'Bitshares Genesis Data | Rich list and distribution statistics',
		description: 'Bitshares '+appcst.baseAsset+' genesis block analysis: charts, rich list, distribution ++'
	});
	MetaProvider.when('/genesis-btsx', {
		title: 'BitsharesX Genesis Data | Rich list and distribution statistics',
		description: 'BitsharesX genesis block analysis: charts, rich list, distribution ++'
	});
	MetaProvider.when('/about', {
		title: 'About Bitsharesblocks and Bitshares',
		description: 'Useful links, donation info, dev.bitsharesblocks delegate bid'
	});
}]);