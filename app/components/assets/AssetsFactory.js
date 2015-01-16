angular.module('app')

.factory('Assets', ['api', '$q', '$filter', 'appcst', function(api, $q, $filter, appcst) {
	var iniatilized = true;
	var myFunction = {};
	var basePrecision = 100000;
	var _assets = {};
	_assets = store.get('assets');
	if (_assets === undefined) {
		_assets = {};
		_assets['0'] = {
			'symbol': 'DVS',
			'precision>': basePrecision
		};
	}

	function _getPriceRatio(asset, baseAsset) {
		return getPrecision(baseAsset) / getPrecision(asset);
	}

	function getPrecision(id) {
		if (id === 0) {
			return basePrecision;
		} else if (id > 0 && _assets[id]) {
			return _assets[id].precision;
		} else if (id > 0) {
			var deferred = $q.defer();
			_forceRefresh().then(function(done) {
				if (id > _assets[id]) {
					deferred.resolve(_assets[id].precision);
				} else {
					deferred.resolve(basePrecision);
				}
			});
			return deferred.promise;
		}
	}

	function getSymbol(id) {
		if (id > 1) {
			if (_assets[id]) {
				return _assets[id].symbol;
			} else {
				return _forceRefresh().then(function(result) {
					return _assets[id].symbol;
				});
			}
		} else {
			return 'DVS';
		}
	}


	function _forceRefresh() {
		var deferred = $q.defer();
		api.getAssetDetail().success(function(result) {
			for (var i = 0; i < result.length; i++) {
				_assets[result[i]._id] = {
					'symbol': result[i].symbol,
					'precision': result[i].precision
				};
			}
			store.set('assets', _assets);
			deferred.resolve('done');
		});
		return deferred.promise;
	}

	function init() {
		var deferred = $q.defer();
		if (Object.keys(_assets).length > 0) {
			deferred.resolve('done');
		} else {
			api.getAssetDetail().success(function(result) {
				for (var i = 0; i < result.length; i++) {
					_assets[result[i]._id] = {
						'symbol': result[i].symbol,
						'precision': result[i].precision
					};
				}
				store.set('assets', _assets);
				deferred.resolve('done');
			});
		}
		return deferred.promise;
	}

	function fetchAssets(marketBoolean) {
		var deferred = $q.defer();

		_getAssets(marketBoolean).then(function(result) {
			deferred.resolve(_assetInfo(result, marketBoolean));
		});
		return deferred.promise;
	}

	function _getAssets(marketBoolean) {
		var deferred = $q.defer();
		if (marketBoolean) {
			api.getAssets()
				.success(function(result) {
					deferred.resolve(result);
				});
		} else {
			api.getUserAssets()
				.success(function(result) {
					deferred.resolve(result);
				});
		}
		return deferred.promise;
	}

	function _assetInfo(result, marketBoolean) {
		var i, supply = {},
			assets = result.assets,
			prices = {},
			decimals;

		if (marketBoolean) {
			for (i = 0; i < result.supply.length; i++) {
				supply[result.supply[i]._id] = (result.supply[i].currentCollateral) ? result.supply[i].currentCollateral : 0;
			}

			prices.BTC = result.btsxprice.price.btc;
			prices.USD = result.btsxprice.price.usd;
			prices.CNY = result.btsxprice.price.cny;
			prices.EUR = result.btsxprice.price.eur;

			for (i = 0; i < assets.length; i++) {
				var precision = assets[i].precision;
				var assetPrice = (assets[i].status.last_valid_feed_price) ? parseFloat(assets[i].status.last_valid_feed_price / (100000 / precision)) : 0;

				assets[i].collateral = supply[assets[i]._id];
				assets[i].collateralRatio = (assets[i].current_share_supply !== 0) ? 100 * supply[assets[i]._id] * assets[i].medianFeed / assets[i].current_share_supply : 0;

				assets[i].yield = (assets[i].current_share_supply > 0) ? 100 * (assets[i].collected_fees / assets[i].precision) / assets[i].current_share_supply : 0;

				assets[i].cap = {};
				assets[i].price = (assetPrice !== 0) ? assetPrice * (100000 / precision) : 0;

				assets[i].marketCap = (assets[i].price !== 0) ? (assets[i].current_share_supply / assets[i].price) : 0;
				assets[i].cap.BTS = (assets[i].price !== 0) ? (assets[i].current_share_supply / assets[i].price) : 0;
				assets[i].cap.BTC = (assets[i].price !== 0) ? prices.BTC * (assets[i].current_share_supply / assets[i].price) : 0;
				assets[i].cap.USD = (assets[i].price !== 0) ? prices.USD * (assets[i].current_share_supply / assets[i].price) : 0;
				assets[i].cap.CNY = (assets[i].price !== 0) ? prices.CNY * (assets[i].current_share_supply / assets[i].price) : 0;
				assets[i].cap.EUR = (assets[i].price !== 0) ? prices.EUR * (assets[i].current_share_supply / assets[i].price) : 0;

				assets[i].volume = {};
				assets[i].volume.BTS = assets[i].dailyVolume || 0;
				assets[i].volume.BTC = (assets[i].dailyVolume !== 0) ? prices.BTC * (assets[i].dailyVolume) : 0;
				assets[i].volume.USD = (assets[i].dailyVolume !== 0) ? prices.USD * (assets[i].dailyVolume) : 0;
				assets[i].volume.CNY = (assets[i].dailyVolume !== 0) ? prices.CNY * (assets[i].dailyVolume) : 0;
				assets[i].volume.EUR = (assets[i].dailyVolume !== 0) ? prices.EUR * (assets[i].dailyVolume) : 0;

				decimals = (assets[i].symbol.indexOf('BTC') === -1 && assets[i].symbol !== 'GOLD') ? 0 : 3;
				assets[i].current_share_supply = $filter('number')(assets[i].current_share_supply, decimals) + ' ' + assets[i].symbol;
				assets[i].maximum_share_supply = $filter('number')(assets[i].maximum_share_supply, decimals) + ' ' + assets[i].symbol;

			}
		} else {
			for (i = 0; i < assets.length; i++) {

				decimals = (assets[i].symbol.indexOf('BTC') === -1 && assets[i].symbol !== 'GOLD') ? 0 : 3;

				assets[i].maximum_share_supply = $filter('number')(assets[i].maximum_share_supply, decimals) + ' ' + assets[i].symbol;
				assets[i].dailyVolume = $filter('number')(assets[i].dailyVolume, 2) + ' BTS';

				assets[i].cap = assets[i].vwap * assets[i].current_share_supply;
				assets[i].capText = $filter('number')(assets[i].cap, 0) + ' BTS';
				assets[i].vwapText = $filter('number')(assets[i].vwap, 2) + ' BTS';
				assets[i].current_share_supply = $filter('number')(assets[i].current_share_supply, decimals) + ' ' + assets[i].symbol;
			}
		}

		return assets;
	}

	function fetchVolume(chartDays) {
		var deferred = $q.defer();
		api.getAssetVolume2(chartDays).success(function(volume) {
			volume.transactions = volume.transactions.sort();
			deferred.resolve({
				asks: _reduceArray(volume.transactions, 0, 1),
				bids: _reduceArray(volume.transactions, 0, 2),
				shorts: _reduceArray(volume.transactions, 0, 3),
				covers: _reduceArray(volume.transactions, 0, 4)
			});
		});
		return deferred.promise;
	}

	function _reduceArray(array, x, y) {
		var returnArray = [];
		for (var i = 0; i < array.length; i++) {
			returnArray.push([array[i][x],
				array[i][y]
			]);
		}
		return returnArray;
	}

	function _getAsset(id) {
		var deferred = $q.defer();
		api.getAsset(id).success(function(result) {
			deferred.resolve(result);
		});
		return deferred.promise;
	}

	function fetchAsset(id) {
		var deferred = $q.defer();
		_getAsset(id).then(function(result) {
			var assetInfo = {};
			assetInfo.medianFeed = false;
			assetInfo.asset = result;
			if (result.issuer_account_id === -2) {
				assetInfo = filterFeeds(result, true);
			}
			assetInfo.asset = orderBook(assetInfo.asset, assetInfo.asset.medianFeed);
			deferred.resolve(assetInfo);
		});
		return deferred.promise;
	}

	function filterFeeds(asset, boolean) {
		var yesterday = new Date(Date.now());
		var tempFeeds = [],
			averageFeed, enoughFeeds, medianFeed, medianLine;
		yesterday.setDate(yesterday.getDate() - 1);
		var total = 0;
		if (!asset.shorts) {
			asset.shorts = [];
		}
		if (!asset.bids) {
			asset.bids = [];
		}
		if (!asset.asks) {
			asset.asks = [];
		}
		if (boolean) {
			asset.feeds.forEach(function(feed, index) {
				var match = feed.last_update.match(appcst.R_ISO8601_STR);
				var currentDate = new Date(Date.UTC(match[1], match[2] - 1, match[3], match[4], match[5], match[6]));
				if (currentDate > yesterday) {
					tempFeeds.push(feed);
					total += feed.price;
				}
			});
			averageFeed = total / tempFeeds.length;
			enoughFeeds = (tempFeeds.length > 50) ? true : false;
			if (asset.issuer_account_id !== 0 && asset.issuer_account_id !== -2) {
				enoughFeeds = true;
			}
		} else {
			tempFeeds = asset.feeds;
			averageFeed = asset.averagefeed;
		}

		if (asset.medianFeed !== 0) {
			medianLine = 1 / asset.medianFeed;
		} else {
			medianLine = 0;
		}
		var collateral, collateralAsset;
		if (asset.issuer_account_id === -2) {
			collateral = asset.collateral[asset.collateral.length - 1][1];
			collateralAsset = asset.collateral[asset.collateral.length - 1][1] * averageFeed;

			asset.yield = (asset.current_share_supply > 0) ? 100 * (asset.collected_fees / asset.precision) / asset.current_share_supply : 0;
		}

		return {
			feeds: tempFeeds,
			enoughFeeds: enoughFeeds,
			medianLine: medianLine,
			averageFeed: averageFeed,
			collateral: collateral,
			collateralAsset: collateralAsset,
			asset: asset
		};
	}

	function orderBook(asset, medianFeed) {

		// Short wall
		if (asset.issuer_account_id === -2) {
			var wall = {},
				i;
			wall.amount = 0;
			wall.price = medianFeed;
			asset.shortSum = [];

			// Split orders with and without price limit
			for (i = 0; i < asset.shorts.length; i++) {
				if (asset.shorts[i].price_limit === 'None' || asset.shorts[i].price_limit >= wall.price) {
					wall.amount += asset.shorts[i].collateral * wall.price / 2;
					// asset.shorts[i].amountAsset = asset.shorts[i].collateral * wall.price / 2;
				} else if (i > 0) {
					
					if (asset.shorts[i - 1].price_limit === asset.shorts[i].price_limit) {
						console.log(asset.shortSum[i-1]);
						asset.shortSum[i - 1][1] += asset.shorts[i].collateral / 2;
						console.log(asset.shortSum[i-1]);
					} else {
						asset.shortSum.push([1 / asset.shorts[i].price_limit, asset.shorts[i].collateral / 2]);
					}
					
					// asset.shorts[i].amountAsset = asset.shorts[i].collateral * wall.price / 2;
				} else {
					asset.shortSum.push([1 / asset.shorts[i].price_limit, asset.shorts[i].collateral / 2]);
				}
			}
			wall.amount *= (1 / wall.price);
			var temp = [];
			asset.shortSum.push([1 / wall.price, wall.amount]);

			// Sort in ascending order
			asset.shortSum.sort(function(a, b) {
				return a[0] - b[0];
			});

			temp.push([asset.shortSum[0][0], asset.shortSum[0][1]]);

			var sum = 0;
			// Sum orders at same price
			for (i = 1; i < asset.shortSum.length; i++) {
				if (asset.shortSum[i - 1][0] === asset.shortSum[i][0]) {
					temp[temp.length - 1][1] += asset.shortSum[i][1];
				} else {
					temp.push([asset.shortSum[i][0], asset.shortSum[i][1]]);
				}
			}
			asset.shortSum = temp;
			if (asset.shortSum[0][1] === 0) {
				asset.shortSum.splice(0, 1);
			}
			asset.shortSum = flattenArray(asset.shortSum, true);

		}

		// Asks and bids
		asset.sum.asks = flattenArray(asset.sum.asks, false, true);
		asset.sum.bids = flattenArray(asset.sum.bids, false);

		// Sort and limit covers
		if (asset.covers) {
			asset.covers.sort(function(a, b) {
				return (new Date(a.expiration)) - (new Date(b.expiration));
			});

			asset.covers = asset.covers.filter(function(entry, i) {
				return i < 10;
			});
		}

		asset.covers.forEach(function(cover) {
			cover.callPrice = 1 / (cover.market_index.order_price.ratio * _getPriceRatio(cover.market_index.order_price.quote_asset_id, cover.market_index.order_price.base_asset_id));
			cover.collateral = cover.collateral / getPrecision(0);
			cover.owed = cover.state.balance / getPrecision(cover.market_index.order_price.quote_asset_id);
			cover.interest = cover.interest_rate.ratio * 100;
		});

		return asset;
	}

	function flattenArray(array, sumBoolean, inverse) {
		inverse = (inverse === undefined) ? false : inverse;
		var orderBookArray = [];
		var maxStep;
		if (inverse) {
			array.sort(function(a, b) {
				return a[0] - b[0];
			});
			if (array && array.length) {
				var arrayLength = array.length - 1;
				orderBookArray.unshift([array[arrayLength][0], array[arrayLength][1]]);
				for (i = arrayLength - 1; i > 0; i--) {
					maxStep = Math.min((array[i][0] - array[i - 1][0]) / 2, 0.000001);
					orderBookArray.unshift([array[i][0] + maxStep, array[i + 1][1]]);
					if (sumBoolean) {
						array[i][1] += array[i - 1][1];
					}
					orderBookArray.unshift([array[i][0], array[i][1]]);
				}

				if (orderBookArray.length === 1) {
					orderBookArray.unshift([0, orderBookArray[0][1]]);
				}
			}
		} else {
			if (array && array.length) {
				orderBookArray.push([array[0][0], array[0][1]]);

				for (i = 1; i < array.length; i++) {
					maxStep = Math.min((array[i][0] - array[i - 1][0]) / 2, 0.001);
					orderBookArray.push([array[i][0] - maxStep, array[i - 1][1]]);
					if (sumBoolean) {
						array[i][1] += array[i - 1][1];
					}
					orderBookArray.push([array[i][0], array[i][1]]);
				}
			}

			if (orderBookArray.length === 1) {
				orderBookArray.push([orderBookArray[0][0] * 2, orderBookArray[0][1]]);
			}
		}
		return orderBookArray;
	}


	function fetchPrice(asset, inverse) {
		var deferred = $q.defer();
		inverse = (inverse) ? inverse : false;
		api.getPrice(asset).success(function(result) {
			var price = [];
			result = result.sort();
			if (inverse) {
				for (var i = 0; i < result.length; i++) {
					if (result[i][1] !== 0 && result[i][1] !== null) {
						price.push([
							result[i][0],
							result[i][1] = 1 / result[i][1]
						]);

					}
				}
			}
			deferred.resolve(result);
		});
		return deferred.promise;
	}

	function fetchPriceHistory(asset) {
		var deferred = $q.defer();
		api.getPriceHistory(asset).success(function(result) {
			deferred.resolve(result);
		});
		return deferred.promise;
	}

	return {
		init: init,
		getSymbol: getSymbol,
		getPrecision: getPrecision,
		fetchAssets: fetchAssets,
		fetchVolume: fetchVolume,
		fetchAsset: fetchAsset,
		filterFeeds: filterFeeds,
		fetchPrice: fetchPrice,
		fetchPriceHistory: fetchPriceHistory
	};

}]);