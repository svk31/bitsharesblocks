angular.module('app')

.factory('Block', ['api', '$q', 'Assets', 'Delegates', '$translate', function(api, $q, Assets, Delegates, $translate) {

	var _trxTypes;
	var _blocksCache = {};
	var _cacheLength = 5;
	var _lastBlockHeight;

	$translate(['assets.plot.type1', 'assets.plot.type2', 'assets.plot.type3', 'assets.plot.type4', 'charts.transfer',
		'charts.update', 'block.trx.burn', 'block.trx.assetCreate', 'charts.feed', 'charts.reg'
	]).
	then(function(types) {
		_trxTypes = types;
	});

	function _updateFees(transactions) {
		var assetId;
		var trxAssetId;

		var amountBTS = {};
		var fees = [];
		var votes = [];
		var values = [];
		var trxInfo = [];

		transactions.forEach(function(trx, i) {
			var tempFees = {};
			var tempValues = {};
			var tempVotes = [];

			// FEES
			trx[1].balance.forEach(function(balance, j) {
				assetId = parseInt(balance[0], 10);
				if (tempFees[assetId] === undefined) {
					tempFees[assetId] = {};
					tempFees[assetId].price = 0;
					tempFees[assetId].asset = Assets.getSymbol(assetId);
				}
				tempFees[assetId].price += balance[1] / Assets.getPrecision(assetId);
			});

			// TOTAL VALUE
			trx[1].withdraws.forEach(function(withdrawal, j) {
				trxAssetId = parseInt(withdrawal[0], 10);
				if (tempValues[trxAssetId] === undefined) {
					tempValues[trxAssetId] = {};
					tempValues[trxAssetId].amount = 0;
					tempValues[trxAssetId].asset = Assets.getSymbol(trxAssetId);
				}
				tempValues[trxAssetId].amount += withdrawal[1].amount / Assets.getPrecision(trxAssetId);
			});

			// VOTES
			var currentVotes = trx[1].net_delegate_votes;
			var precision = Assets.getPrecision(0);
			if (currentVotes.length === 0) {
				tempVotes = {
					delegate: 'None'
				};
			} else {
				currentVotes.forEach(function(vote, j) {
					Delegates.fetchDelegatesById(vote[0]).then(function(result) {
						tempVotes[j] = {
							delegate: result.name,
							amount: vote[1].votes_for / precision
						};
					});

				});

			}

			// TRX PARSER
			trxInfo.push(trxParser(trx));
			fees.push(tempFees);
			values.push(tempValues);
			votes.push(tempVotes);


		});

		return {
			fees: fees,
			values: values,
			votes: votes,
			trxInfo: trxInfo
		};
	}

	function trxParser(trx) {
		var trxInfo;

		trxInfo = {
			feeds: [],
			feedsCount: 0,
			type: '',
			asset: '',
			baseAsset: '',
			ratio: '',
			amountBase: '',
			amountAsset: '',
			trxCode: ''
		};
		trxInfo.id = trx[0];
		trxInfo.trxCode = 4;
		trxInfo.type = trx[1].type;
		var fetchName = false,
			delegateID;
		for (j = 0; j < trx[1].trx.operations.length; j++) {

			if (trx[1].trx.operations[j].type === 'update_account_op_type') {
				trxInfo.trxCode = 5;
				trx[1].data = trx[1].trx.operations[j].data;
				break;
			}

			if (trx[1].trx.operations[j].type === 'ask_op_type') {
				trxInfo.trxCode = 0;
				trxInfo.asset = trx[1].trx.operations[j].data.ask_index.order_price.quote_asset_id;
				trxInfo.baseAsset = trx[1].trx.operations[j].data.ask_index.order_price.base_asset_id;
				assetRatio = Assets.getPrecision(trxInfo.baseAsset) / Assets.getPrecision(trxInfo.asset);
				trxInfo.ratio = trx[1].trx.operations[j].data.ask_index.order_price.ratio * assetRatio;
				trxInfo.amountBase = Math.abs(trx[1].trx.operations[j].data.amount) / Assets.getPrecision(trxInfo.baseAsset);
				trxInfo.amountAsset = Math.abs(trx[1].trx.operations[j].data.amount) / Assets.getPrecision(trxInfo.baseAsset) * trxInfo.ratio;
				break;
			}
			if (trx[1].trx.operations[j].type === 'bid_op_type') {
				trxInfo.trxCode = 1;
				trxInfo.asset = trx[1].trx.operations[j].data.bid_index.order_price.quote_asset_id;
				trxInfo.baseAsset = trx[1].trx.operations[j].data.bid_index.order_price.base_asset_id;
				assetRatio = Assets.getPrecision(trxInfo.baseAsset) / Assets.getPrecision(trxInfo.asset);
				trxInfo.ratio = trx[1].trx.operations[j].data.bid_index.order_price.ratio * assetRatio;
				trxInfo.amountAsset = Math.abs(trx[1].trx.operations[j].data.amount) / Assets.getPrecision(trxInfo.asset);
				trxInfo.amountBase = trxInfo.amountAsset / trxInfo.ratio;
				break;
			}
			if (trx[1].trx.operations[j].type === 'short_op_type' || trx[1].trx.operations[j].type === 'short_op_v2_type') {
				trxInfo.trxCode = 2;
				trxInfo.asset = trx[1].trx.operations[j].data.short_index.order_price.quote_asset_id;
				trxInfo.baseAsset = trx[1].trx.operations[j].data.short_index.order_price.base_asset_id;
				assetRatio = Assets.getPrecision(trxInfo.baseAsset) / Assets.getPrecision(trxInfo.asset);
				trxInfo.interest = trx[1].trx.operations[j].data.short_index.order_price.ratio * 100;
				if (trx[1].trx.operations[j].data.short_price_limit) {
					trxInfo.ratio = trx[1].trx.operations[j].data.short_price_limit.ratio * assetRatio;
				} else {
					trxInfo.ratio = false;
				}

				trxInfo.amountBase = Math.abs(trx[1].trx.operations[j].data.amount) / Assets.getPrecision(trxInfo.baseAsset);
				trxInfo.amountAsset = trxInfo.amountBase / 2;
				break;
			}
			if (trx[1].trx.operations[j].type === 'cover_op_type') {
				trxInfo.trxCode = 3;
				trxInfo.asset = trx[1].trx.operations[j].data.cover_index.order_price.quote_asset_id;
				trxInfo.baseAsset = trx[1].trx.operations[j].data.cover_index.order_price.base_asset_id;
				assetRatio = Assets.getPrecision(trxInfo.baseAsset) / Assets.getPrecision(trxInfo.asset);
				trxInfo.ratio = trx[1].trx.operations[j].data.cover_index.order_price.ratio * assetRatio;
				trxInfo.amountAsset = Math.abs(trx[1].trx.operations[j].data.amount) / Assets.getPrecision(trxInfo.asset);
				trxInfo.amountBase = trxInfo.amountAsset / trxInfo.ratio;
				break;
			}
			if (trx[1].trx.operations[j].type === 'add_collateral_op_type') {
				trxInfo.trxCode = 10;
				trxInfo.asset = trx[1].trx.operations[j].data.cover_index.order_price.quote_asset_id;
				trxInfo.baseAsset = trx[1].trx.operations[j].data.cover_index.order_price.base_asset_id;
				assetRatio = Assets.getPrecision(trxInfo.baseAsset) / Assets.getPrecision(trxInfo.asset);
				trxInfo.ratio = trx[1].trx.operations[j].data.cover_index.order_price.ratio * assetRatio;
				trxInfo.amountBase = trx[1].trx.operations[j].data.amount / Assets.getPrecision(trxInfo.baseAsset);
				break;
			}
			if (trx[1].trx.operations[j].type === 'burn_op_type') {
				trxInfo.trxCode = 6;
				trxInfo.amount = trx[1].amount / Assets.getPrecision(trx[1].asset);
				break;
			}
			if (trx[1].trx.operations[j].type === 'withdraw_pay_op_type') {
				trxInfo.trxCode = 11;
				trxInfo.amount = (trx[1].trx.operations[j].data.amount - trx[1].balance[0][1]) / Assets.getPrecision(0);

				delegateID = trx[1].trx.operations[j].data.account_id;
				fetchName = true;
				break;
			}
			if (trx[1].trx.operations[j].type === 'create_asset_op_type') {
				trxInfo.trxCode = 7;
				trxInfo.issuer = trx[1].trx.operations[j].data.issuer_account_id;
				break;
			}

			if (trx[1].trx.operations[j].type === 'update_feed_op_type') {
				trxInfo.trxCode = 8;
				delegateID = trx[1].trx.operations[0].data.feed.delegate_id;
				fetchName = true;

				assetRatio = Assets.getPrecision(trx[1].trx.operations[j].data.value.base_asset_id) / Assets.getPrecision(trx[1].trx.operations[j].data.value.quote_asset_id);
				trxInfo.feeds.push({
					asset: Assets.getSymbol(trx[1].trx.operations[j].data.feed.feed_id),
					baseAsset: Assets.getSymbol(trx[1].trx.operations[j].data.value.base_asset_id),
					price: trx[1].trx.operations[j].data.value.ratio * assetRatio
				});
				trxInfo.feedsCount++;
			}
			if (trx[1].trx.operations[j].type === 'register_account_op_type') {
				trxInfo.trxCode = 9;
				break;
			}
		}
		if (fetchName) {
			Delegates.fetchDelegatesById(delegateID).then(function(result) {
				trxInfo.delegate = result.name;
			});
		}

		if (trxInfo.asset >= 0 && trxInfo.trxCode !== 8 && trxInfo.trxCode !== 4) {
			trxInfo.assetName = Assets.getSymbol(trxInfo.asset);
		}
		if (trxInfo.baseAsset >= 0 && trxInfo.trxCode !== 8 && trxInfo.trxCode !== 4) {
			trxInfo.baseAssetName = Assets.getSymbol(trxInfo.baseAsset);
		}
		return trxInfo;
	}

	function _getBlock(id) {
		var deferred = $q.defer();
		api.getBlock(id).success(function(block) {
			deferred.resolve(block);
		});
		return deferred.promise;
	}

	function fetchBlock(id) {
		var deferred = $q.defer();
		if (Math.abs(id - _lastBlockHeight) > _cacheLength) {
			_blocksCache = {};
		}

		if (_blocksCache[id]) {
			deferred.resolve(_blocksCache[id]);
		} else {
			var promise = _getBlock(id);
			promise.then(function(block) {
				var trxInfo = _updateFees(block.transactions);
				trxInfo.block = block;
				_blocksCache[id] = trxInfo;
				if (_blocksCache[id - _cacheLength]) {
					delete _blocksCache[id - _cacheLength];
				}
				if (_blocksCache[id + _cacheLength]) {
					delete _blocksCache[id + _cacheLength];
				}
				deferred.resolve(trxInfo);
			});
		}
		_lastBlockHeight = id;
		return deferred.promise;
	}

	return {
		fetchBlock: fetchBlock,
		_updateFees: _updateFees
	};

}]);