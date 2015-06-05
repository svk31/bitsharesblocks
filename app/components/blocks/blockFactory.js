angular.module('app')

.factory('Block', ['api', '$q', 'Assets', 'Delegates', 'Accounts', '$translate', '$filter', 'appcst',
	function(api, $q, Assets, Delegates, Accounts, $translate, $filter, appcst) {

		var _baseAsset = appcst.baseAsset;
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
				trx[1].fees_paid.forEach(function(balance, j) {
					assetId = parseInt(balance[0], 10);
					if (tempFees[assetId] === undefined) {
						tempFees[assetId] = {};
						tempFees[assetId].price = 0;
						tempFees[assetId].asset = Assets.getSymbol(assetId);
					}
					tempFees[assetId].price += balance[1] / Assets.getPrecision(assetId);
				});

				// TOTAL VALUE
				trx[1].op_deltas.forEach(function(withdrawal, j) {
					if (j < trx[1].op_deltas.length - 1 || trx[1].op_deltas.length === 1) {
						var value;
						// console.log(withdrawal);
						trxAssetId = parseInt(withdrawal[1][0][0], 10);
						if (tempValues[trxAssetId] === undefined) {
							tempValues[trxAssetId] = {};
							tempValues[trxAssetId].amount = 0;
							tempValues[trxAssetId].asset = Assets.getSymbol(trxAssetId);
						}
						value = (withdrawal[1].amount) ? withdrawal[1].amount : Math.abs(withdrawal[1][0][1]);
						tempValues[trxAssetId].amount += value / Assets.getPrecision(trxAssetId);
					}
				});

				// VOTES
				var currentVotes = (trx[1].net_delegate_votes) ? trx[1].net_delegate_votes : trx[1].delegate_vote_deltas;
				var precision = Assets.getPrecision(0);
				if (currentVotes.length === 0) {
					tempVotes = {
						delegate: 'None'
					};
				} else {
					var votesFor;
					currentVotes.forEach(function(vote, j) {

						Delegates.fetchDelegatesById(vote[0]).then(function(result) {
							votesFor = (vote[1].votes_for) ? vote[1].votes_for : vote[1];
							tempVotes[j] = {
								delegate: result.name,
								amount: votesFor / precision
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

		function marketData(op, order_type, add_collateral) {
			var balance_id = op.data[order_type].owner;
			var quoteAsset = op.data[order_type].order_price.quote_asset_id;
			var base = op.data[order_type].order_price.base_asset_id;
			var asset = Assets.getSymbol(quoteAsset);
			var baseAsset = Assets.getSymbol(base);
			var assetRatio = Assets.getPrecision(base) / Assets.getPrecision(quoteAsset);
			var ratio = op.data[order_type].order_price.ratio * assetRatio;
			var amount;
			var interest = false;
			if (order_type === 'ask_index' || add_collateral === 'add_collateral') {
				amount = $filter('number')((op.data.amount / Assets.getPrecision(base)), 4) + ' ' + baseAsset;
			} else if (order_type === 'short_index') {
				amount = $filter('number')((op.data.amount) / Assets.getPrecision(base) / 2, 2) + ' ' + baseAsset;
				interest = op.data.short_index.order_price.ratio * 100;
				if (op.data.short_price_limit) {
					ratio = op.data.short_price_limit.ratio * assetRatio;
				} else {
					ratio = 'block.trx.feedPrice';
				}
			} else {
				amount = $filter('number')((op.data.amount / Assets.getPrecision(quoteAsset)), 4) + ' ' + asset;
			}

			var owner = op.data[order_type].owner;

			return {
				balance_id: balance_id,
				asset: asset,
				baseAsset: baseAsset,
				ratio: ratio,
				amount: amount,
				owner: owner,
				interest: interest
			};
		}

		function trxParser(trx) {
			var trxInfo;

			trxInfo = {
				feed: [],
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

			var fetchName = false,
				fetchAccount = false,
				delegateID,
				accountID;
			trxInfo.ops = [];

			trxInfo.ratio = false;
			trxInfo.name = false;
			trxInfo.balance = false;
			trxInfo.interest = false;
			trxInfo.public_data = false;
			trxInfo.burn = false;

			var depositSum = [],
				depositAsset = [];
			for (j = 0; j < trx[1].trx.operations.length; j++) {
				var marketInfo = false;

				trxInfo.ops[j] = {};
				trxInfo.ops[j].decimals = 4;
				trxInfo.ops[j].type = trx[1].trx.operations[j].type;

				if (trx[1].trx.operations[j].type === 'update_account_op_type') {
					trxInfo.public_data = true;
					trxInfo.ops[j].public_data = trx[1].trx.operations[j].data;

				}

				if (trx[1].trx.operations[j].type === 'ask_op_type') {
					trxInfo.ratio = true;
					trxInfo.balance = true;

					marketInfo = marketData(trx[1].trx.operations[j], 'ask_index');
				}

				if (trx[1].trx.operations[j].type === 'bid_op_type') {
					trxInfo.ratio = true;
					trxInfo.balance = true;

					marketInfo = marketData(trx[1].trx.operations[j], 'bid_index');
				}


				if (trx[1].trx.operations[j].type === 'short_op_type' || trx[1].trx.operations[j].type === 'short_op_v2_type') {
					trxInfo.ops[j].type = 'short_op_type';
					trxInfo.ratio = true;
					trxInfo.balance = true;
					trxInfo.interest = true;

					marketInfo = marketData(trx[1].trx.operations[j], 'short_index');

				}
				if (trx[1].trx.operations[j].type === 'cover_op_type') {
					trxInfo.cover = true;
					trxInfo.balance = true;

					depositAsset.push(trx[1].trx.operations[j].data.cover_index.order_price.quote_asset_id);
					depositSum.push(trx[1].trx.operations[j].data.amount);
					marketInfo = marketData(trx[1].trx.operations[j], 'cover_index');
				}
				if (trx[1].trx.operations[j].type === 'add_collateral_op_type') {
					trxInfo.cover = true;
					marketInfo = marketData(trx[1].trx.operations[j], 'cover_index', 'add_collateral');
				}

				if (trx[1].trx.operations[j].type === 'note_op_type') {
					fetchAccount = true;
					trxInfo.name = true;
					accountID = {id: trx[1].trx.operations[j].data.owner_account_id, op: j};
				}

				if (trx[1].trx.operations[j].type === 'burn_op_type') {
					trxInfo.ops[j].amount = $filter('number')(trx[1].amount / Assets.getPrecision(trx[1].asset), 4) + ' ' + Assets.getSymbol(trx[1].asset);
					trxInfo.ops[j].message = trx[1].message;
					trxInfo.burn = true;
				}
				if (trx[1].trx.operations[j].type === 'withdraw_pay_op_type' && trxInfo.trxCode !== 8) {
					trxInfo.ops[j].amount = $filter('number')((trx[1].trx.operations[j].data.amount) / Assets.getPrecision(0), 4) + ' ' + _baseAsset;
					trxInfo.ops[j].asset = _baseAsset;
					delegateID = trx[1].trx.operations[j].data.account_id;
					fetchName = true;
				}
				if (trx[1].trx.operations[j].type === 'create_asset_op_type') {
					trxInfo.ops[j].asset = trx[1].trx.operations[j].data.symbol;
					trxInfo.issuer = trx[1].trx.operations[j].data.issuer_account_id;
				}

				if (trx[1].trx.operations[j].type === 'issue_asset_op_type') {
					var assetID = trx[1].trx.operations[j].data.amount.asset_id;
					trxInfo.ops[j].asset = Assets.getSymbol(assetID);
					trxInfo.ops[j].amount = $filter('number')(trx[1].trx.operations[j].data.amount.amount / Assets.getPrecision(assetID), 4) + ' ' + trxInfo.ops[j].asset;
				}

				if (trx[1].trx.operations[j].type === 'define_delegate_slate_op_type') {
					trxInfo.issuer = trx[1].trx.operations[j].data.issuer_account_id;
				}

				if (trx[1].trx.operations[j].type === 'update_feed_op_type') {
					trxInfo.ratio = true;
					trxInfo.ops[j].trxCode = 8;
					var feedId;
					if (trx[1].trx.operations[0].data.feed) {
						delegateID = trx[1].trx.operations[0].data.feed.delegate_id;
						feedId = trx[1].trx.operations[j].data.feed.feed_id;
					} else {
						delegateID = trx[1].trx.operations[0].data.index.delegate_id;
						feedId = trx[1].trx.operations[j].data.index.quote_id;
					}

					fetchName = true;

					assetRatio = Assets.getPrecision(trx[1].trx.operations[j].data.value.base_asset_id) / Assets.getPrecision(trx[1].trx.operations[j].data.value.quote_asset_id);
					trxInfo.ops[j].asset = Assets.getSymbol(feedId);
					trxInfo.ops[j].baseAsset = Assets.getSymbol(trx[1].trx.operations[j].data.value.base_asset_id);
					trxInfo.ops[j].ratio = trx[1].trx.operations[j].data.value.ratio * assetRatio;
					trxInfo.ops[j].decimals = (feedId === 4 || feedId === 7 || feedId === 6) ? 7 : 4;

					trxInfo.feedsCount++;
				}

				if (trx[1].trx.operations[j].type === 'register_account_op_type') {
					trxInfo.ops[j].name = trx[1].trx.operations[j].data.name;
					trxInfo.name = true;
					trxInfo.ops[j].public_data = trx[1].trx.operations[j].data.public_data;
				}


				if (trx[1].trx.operations[j].type === 'deposit_op_type') {
					trxInfo.balance = true;
					trxInfo.slate = trx[1].trx.operations[j].data.condition.slate_id;
					trxInfo.ops[j].balance_id = trx[1].trx.operations[j].data.condition.data.owner;

					depositAsset.push(trx[1].trx.operations[j].data.condition.asset_id);
					depositSum.push(trx[1].trx.operations[j].data.amount);
					trxInfo.ops[j].asset = Assets.getSymbol(trx[1].trx.operations[j].data.condition.asset_id);
					trxInfo.ops[j].amount = $filter('number')((trx[1].trx.operations[j].data.amount) / Assets.getPrecision(trx[1].trx.operations[j].data.condition.asset_id), 4) + ' ' + trxInfo.ops[j].asset;
				}

				if (trx[1].trx.operations[j].type === 'withdraw_op_type') {
					var withdrawAsset = 0;
					if (depositSum.length > 0) {
						for (var i = 0; i < depositSum.length; i++) {
							if (depositSum[i] === trx[1].trx.operations[j].data.amount) {
								withdrawAsset = depositAsset[i];
								break;
							}
						}
					}
					trxInfo.ops[j].balance_id = trx[1].trx.operations[j].data.balance_id;
					trxInfo.balance = true;
					trxInfo.ops[j].asset = Assets.getSymbol(withdrawAsset);
					trxInfo.ops[j].amount = $filter('number')((trx[1].trx.operations[j].data.amount) / Assets.getPrecision(withdrawAsset), 4) + ' ' + trxInfo.ops[j].asset;
				}

				if (marketInfo) {
					trxInfo.ops[j].asset = marketInfo.asset;
					trxInfo.ops[j].baseAsset = marketInfo.baseAsset;
					trxInfo.ops[j].balance_id = marketInfo.owner;
					trxInfo.ops[j].ratio = marketInfo.ratio;
					trxInfo.ops[j].amount = marketInfo.amount;
					trxInfo.ops[j].interest = marketInfo.interest;
					trxInfo.ops[j].decimals = (marketInfo.asset.indexOf('BTC') !== -1 || marketInfo.asset === 'GOLD' || marketInfo.asset === 'SILVER') ? 7 : 3;
				}

			}
			if (fetchName) {
				Delegates.fetchDelegatesById(delegateID).then(function(result) {
					trxInfo.delegate = result.name;
				});
			}

			if (fetchAccount) {
				Accounts.fetchAccount(null, accountID.id).then(function(result) {
					trxInfo.ops[accountID.op].name = result[0].name;
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

	}
]);