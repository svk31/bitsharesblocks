angular.module('app').config(['MetaProvider', function(MetaProvider) {
	var title = 'Bitsharesblocks - Bitshares Blockchain Explorer and Delegates Info';
	MetaProvider.when('/', {
		title: title,
		description: 'Bitshares Block Explorer, Delegates Listing, Assets Overview. Realtime updates, block search, asset information for the next-gen 2.0 crypto Bitshares'
	});
	MetaProvider.when('/blocks', {
		title: 'Bitsharesblocks: Blocks Overview',
		description: 'Bitshares block explorer: live and historical blockchain data'
	});
	MetaProvider.when('/blocks/block', {
		title: 'Bitsharesblocks: Individual Block',
		description: 'Bitshares blockchain info: live and historical blockchain data with automatic updates'
	});
	MetaProvider.when('/delegates', {
		title: 'Bitsharesblocks: Delegates Overview',
		description: 'Bitshares delegates info: rankings, rank changes, reliability, version ++'
	});
		MetaProvider.when('/accounts', {
		title: 'Bitsharesblocks: Accounts Overview',
		description: 'Bitshares accounts info: registration dates, sub-accounts, delegates ++'
	});

	MetaProvider.when('/assets/market', {
		title: 'Bitsharesblocks: Market Issued Assets Overview',
		description: 'Bitshares market issued assets overview: ask and bid depth, yield, supply, price, marketcap ++'
	});
	MetaProvider.when('/assets/user', {
		title: 'Bitsharesblocks: User Issued Assets Overview',
		description: 'Bitshares user issued assets overview: supply, price, marketcap ++'
	});
	MetaProvider.when('/charts', { 
		title: 'Bitsharesblocks: Charts and stats',
		description: 'Bitshares historical charts: price, inflation, transaction counts, accounts, genesis ++'
	});
	// Home
	// 
	// Bitshares Block Explorer, Delegates Listing, Assets Overview. Realtime updates, block search, asset information for the next-gen 2.0 crypto Bitshares
	// Blocks
	// BitsharesBlocks - Bitshares block explorer: live and historicals blockchain data
	// Delegates 
	// Bitsharesblocks - Delegate listings: Rankings, rank changes, reliability and more
	// Assets 
	// Bitsharesblocks - Assets overview: Price, volume, marketcap of Market Pegged and User Issued Assets
	// Charts
	// Historical charts: Price, inflation, genesis stats, transaction value and more
	// About
	// What is Bitshares? Useful links, donation info.
}]);