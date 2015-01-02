angular.module("app").factory('Translate', ['$translate', '$q', function($translate, $q) {

	var _currentKey = $translate.proposedLanguage().substr(0, 2);
	var _language;
	var _languages = [{
		value: "English",
		key: "en"
	}, {
		value: "Francais",
		key: "fr"
	}, {
		value: "Deutsch",
		key: "de"
	}, {
		value: "中文",
		key: "zh"
	}, {
		value: "Türk",
		key: "tr"
	}, {
		value: "Español",
		key: "es"
	}, {
		value: "Italiano",
		key: "it"
	}, {
		value: "한국어",
		key: "ko"
	}];

	function setCurrent(key) {
		var deferred = $q.defer();
		_currentKey = key;
		$translate.use(key).then(function(result) {
			deferred.resolve(result);
		});
		return deferred.promise;
	}

	function getLanguage() {
		return _language;
	}

	function getLanguages() {
		return _languages;
	}

	function getCurrent() {
		var deferred = $q.defer();
		_languages.forEach(function(language, index) {
			if (language.key === _currentKey) {
				_language = _languages[index];
				deferred.resolve(_language);
			}
		});
		return deferred.promise;
	}

	_language = getCurrent();

	function home() {
		var deferred = $q.defer();
		$translate.use(_currentKey).then(function(result) {
			$translate(['home.price', 'home.MA']).then(function(result) {
				deferred.resolve({
					price: result['home.price'],
					ma: result['home.MA']
				});
			});
		});

		return deferred.promise;
	}

	function blocks() {
		var deferred = $q.defer();
		$translate.use(_currentKey).then(function(result) {
			$translate(['blocks.search1', 'blocks.search2', 'blocks.last', 'blocks.blocks', 'charts.transfer',
				'charts.reg', 'charts.feed', 'charts.update', 'charts.transfer', 'assets.plot.type1', 'assets.plot.type2',
				'assets.plot.type3', 'assets.plot.type4',
			]).then(function(result) {
				deferred.resolve({
					search1: result['blocks.search1'],
					search2: result['blocks.search2'],
					last: result['blocks.last'],
					blocks: result['blocks.blocks'],
				});
			});
		});

		return deferred.promise;
	}

	function trxTypes() {
		var deferred = $q.defer();
		$translate.use(_currentKey).then(function(result) {
			$translate(['charts.transfer', 'charts.reg', 'charts.feed', 'charts.update', 'assets.plot.type1',
				'assets.plot.type2', 'assets.plot.type3', 'assets.plot.type4', 'block.trx.burn', 'block.trx.asset_create',
				'block.trx.asset_issue', 'block.trx.add_collateral', 'block.trx.withdraw_pay'
			]).then(function(result) {
				deferred.resolve({
					transfer: result['charts.transfer'],
					account_register: result['charts.reg'],
					update_feed: result['charts.feed'],
					account_update: result['charts.update'],
					asset_ask: result['assets.plot.type1'],
					asset_bid: result['assets.plot.type2'],
					asset_short: result['assets.plot.type3'],
					asset_cover: result['assets.plot.type4'],
					burn: result['block.trx.burn'],
					asset_create: result['block.trx.asset_create'],
					asset_issue: result['block.trx.asset_issue'],
					add_collateral: result['block.trx.add_collateral'],
					withdraw_pay: result['block.trx.withdraw_pay']
				});
			});
		});

		return deferred.promise;
	}

	function delegates() {
		var deferred = $q.defer();
		var d = 'delegates.';
		var dTranslations = [d + 'rank', d + 'change24', d + 'change7', 'accounts.name', d + 'votes', d + 'produced', d + 'missed',
			d + 'rate', d + 'latency', d + 'feeds', d + 'feedFreq', d + 'rel', d + 'version', d + 'filter'
		];
		$translate.use(_currentKey).then(function(result) {
			$translate(dTranslations).then(function(result) {
				deferred.resolve({
					headers: result
				});
			});
		});

		return deferred.promise;
	}

	function assets() {
		var deferred = $q.defer();
		var translations = {};
		var userHeaders = ['assets.user.th1', 'assets.market.th1', 'assets.market.th7', 'assets.market.th1', 'assets.user.th4', 'assets.user.th5', 'assets.user.th6', 'delegates.filter'];

		$translate.use(_currentKey).then(function(result) {
			$translate(userHeaders).then(function(result) {
				translations.userHeaders = result;
				$translate(['assets.plot.type1', 'assets.plot.type2', 'assets.plot.type3', 'assets.plot.type4']).then(function(result) {
					translations.plotTypes = result;
					deferred.resolve(translations);
				});
			});
		});

		return deferred.promise;
	}

	function asset() {
		var deferred = $q.defer();
		var translations = {};

		$translate.use(_currentKey).then(function(result) {
			$translate(['asset.buy', 'asset.sell', 'asset.short', 'asset.feeds.med', 'asset.chartSupply', 'asset.collateral', 'asset.ohlc', 'asset.external', 'asset.volume']).then(function(result) {
				deferred.resolve(result);
			});
		});

		return deferred.promise;
	}

	function charts() {
		var deferred = $q.defer();
		$translate.use(_currentKey).then(function(result) {
			$translate(['home.price', 'home.MA', 'charts.ma15', 'assets.plot.type1', 'assets.plot.type2',
				'assets.plot.type3', 'assets.plot.type4', 'charts.reg', 'charts.transfer', 'charts.feed',
				'charts.update', 'home.user.number', 'blocks.trxValue', 'blocks.trxCount', 'charts.new'
			]).then(function(result) {
				deferred.resolve({
					price: result['home.price'],
					ma: result['home.MA'],
					ma15: result['charts.ma15'],
					asset_ask: result['assets.plot.type1'],
					asset_bid: result['assets.plot.type2'],
					asset_short: result['assets.plot.type3'],
					asset_cover: result['assets.plot.type4'],
					reg: result["charts.reg"],
					transfer: result["charts.transfer"],
					feed: result["charts.feed"],
					update: result["charts.update"],
					value: result['blocks.trxValue'],
					count: result['blocks.trxCount'],
					nr: result['home.user.number'],
					acc: result['charts.new']
				});
			});
		});

		return deferred.promise;
	}

	function genesis() {
		var deferred = $q.defer();
		$translate.use(_currentKey)
			.then(function(result) {
				$translate(['genesis.x', 'genesis.y', 'genesis.tooltip'])
					.then(function(genesis) {
						deferred.resolve({
							tooltip: genesis["genesis.tooltip"],
							xlabel: genesis["genesis.x"],
							ylabel: genesis["genesis.y"]
						});
					});
			});
		return deferred.promise;
	}

	function delegate() {
		var deferred = $q.defer();
		$translate.use(_currentKey).then(function(result) {
			$q.all([$translate(['delegate.sumVotes', 'blocks.blockNum', 'block.block', 'delegate.payChart.name',
						'account.date'
					]),
					$translate(['blocks.blockNum', 'delegate.votes.net'])
				])
				.then(function(result) {
					deferred.resolve({
						sumVotes: result[0]['delegate.sumVotes'],
						blocknum: result[0]['blocks.blockNum'],
						block: result[0]['block.block'],
						payChart: result[0]['delegate.payChart.name'],
						date: result[0]['account.date'],
						headers: result[1]
					});
				});
		});
		return deferred.promise;
	}

	return {
		getCurrent: getCurrent,
		setCurrent: setCurrent,
		getLanguage: getLanguage,
		getLanguages: getLanguages,
		home: home,
		blocks: blocks,
		trxTypes: trxTypes,
		delegates: delegates,
		delegate: delegate,
		assets: assets,
		asset: asset,
		charts: charts,
		genesis: genesis
	};

}]);