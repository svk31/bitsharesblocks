angular.module('app')

.factory('Assets', ['api', '$q', '$filter', 'appcst', function(api, $q, $filter, appcst) {
	var baseAsset = appcst.baseAsset;
	var iniatilized = true;
	var myFunction = {};
	var basePrecision = appcst.basePrecision;
	var _assets = {};

	_assets = store.get('assets');
	if (_assets === undefined) {
		_assets = {};
		_assets['0'] = {
			'symbol': baseAsset,
			'precision': basePrecision
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
			return baseAsset;
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
			deferred.resolve(_assetsInfo(result, marketBoolean));
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

	function _assetsInfo(result, marketBoolean) {
		var i, supply = {},
			assets = result.assets,
			feeds = result.feeds,
			prices = {};

		if (marketBoolean) {

			// Get feed info
			assets.forEach(function(asset) {
				for (var i = 0; i < feeds.length; i++) {
					if (asset._id === feeds[i]._id) {
						asset.medianFeed = feeds[i].medianFeed;
						asset.numberValidFeeds = feeds[i].numberValidFeeds;
					}
				}
			});

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

				if (!assets[i].lastOrder) {
					assets[i].lastOrder = 0;
				}
				assets[i].decimals = precision.toString().length;

				assets[i].collateral = supply[assets[i]._id];
				assets[i].collateralRatio = (assets[i].current_supply !== 0) ? 100 * supply[assets[i]._id] * assets[i].medianFeed / assets[i].current_supply : 0;

				assets[i].yield = (assets[i].current_supply > 0) ? 100 * (assets[i].collected_fees / assets[i].precision) / assets[i].current_supply : 0;

				assets[i].cap = {};
				assets[i].price = (assetPrice !== 0) ? assetPrice * (100000 / precision) : 0;

				assets[i].marketCap = (assets[i].price !== 0) ? (assets[i].current_supply / assets[i].price) : 0;
				assets[i].cap.BTS = (assets[i].price !== 0) ? (assets[i].current_supply / assets[i].price) : 0;
				assets[i].cap.BTC = (assets[i].price !== 0) ? prices.BTC * (assets[i].current_supply / assets[i].price) : 0;
				assets[i].cap.USD = (assets[i].price !== 0) ? prices.USD * (assets[i].current_supply / assets[i].price) : 0;
				assets[i].cap.CNY = (assets[i].price !== 0) ? prices.CNY * (assets[i].current_supply / assets[i].price) : 0;
				assets[i].cap.EUR = (assets[i].price !== 0) ? prices.EUR * (assets[i].current_supply / assets[i].price) : 0;

				assets[i].volume = {};
				assets[i].volume.BTS = assets[i].dailyVolume || 0;
				assets[i].volume.BTC = (assets[i].dailyVolume !== 0) ? prices.BTC * (assets[i].dailyVolume) : 0;
				assets[i].volume.USD = (assets[i].dailyVolume !== 0) ? prices.USD * (assets[i].dailyVolume) : 0;
				assets[i].volume.CNY = (assets[i].dailyVolume !== 0) ? prices.CNY * (assets[i].dailyVolume) : 0;
				assets[i].volume.EUR = (assets[i].dailyVolume !== 0) ? prices.EUR * (assets[i].dailyVolume) : 0;

				var decimals = (assets[i].symbol.indexOf('BTC') === -1 && assets[i].symbol !== 'GOLD') ? 0 : 3;
				assets[i].current_supply = $filter('number')(assets[i].current_supply, decimals) + ' ' + assets[i].symbol;
				assets[i].max_supply = $filter('number')(assets[i].max_supply, decimals) + ' ' + assets[i].symbol;

			}
		} else {
			for (i = 0; i < assets.length; i++) {
				assets[i].decimals = assets[i].precision.toString().length;
				// decimals = (assets[i].symbol.indexOf('BTC') === -1 && assets[i].symbol !== 'GOLD') ? 0 : 3;

				assets[i].max_supply = $filter('number')(assets[i].max_supply, assets[i].decimals) + ' ' + assets[i].symbol;
				assets[i].dailyVolumeText = $filter('number')(assets[i].dailyVolume, 2) + ' ' + baseAsset;

				assets[i].lastPrice = (assets[i].lastPrice !== 0) ? (1 / assets[i].lastPrice) : 0;
				assets[i].cap = (assets[i].lastPrice) * assets[i].current_supply;
				assets[i].capText = $filter('number')(assets[i].cap, 0) + ' ' + baseAsset;
				assets[i].vwapText = $filter('number')((assets[i].vwap !== 0) ? 1 / assets[i].vwap : 0, 3) + ' ' + baseAsset;
				assets[i].lastPriceText = $filter('number')(assets[i].lastPrice, 3) + ' ' + baseAsset;
				assets[i].current_supply = $filter('number')(assets[i].current_supply, Math.floor(assets[i].decimals % 4)) + ' ' + assets[i].symbol;

			}
		}

		return assets;
	}

	function fetchVolume(query) {
		var deferred = $q.defer();
		api.getAssetVolume2(query).success(function(volume) {
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
			var returnArray = {};
			returnArray.asset = result;
			if (result.issuer_id === -2) {
				returnArray = assetInfo(result);
			}
			deferred.resolve(returnArray);
		});
		return deferred.promise;
	}

	function _getOrderBook(id) {
		var deferred = $q.defer();
		api.getOrderBook(id).success(function(result) {
			deferred.resolve(result);
		});
		return deferred.promise;
	}

	function fetchOrderBook(id) {
		var deferred = $q.defer();
		_getOrderBook(id).then(function(result) {
			var returnArray = {};
			returnArray.asset = orderBook(result);
			deferred.resolve(returnArray);
		});
		return deferred.promise;
	}

	function assetInfo(asset, boolean) {
		if (!asset.shorts) {
			asset.shorts = [];
		}
		if (!asset.bids) {
			asset.bids = [];
		}
		if (!asset.asks) {
			asset.asks = [];
		}

		var collateral, collateralAsset;
		if (asset.issuer_id === -2) {
			var feedPrice = (asset.medianFeed) ? asset.medianFeed : 0;

			collateral = asset.collateral[asset.collateral.length - 1][1];
			collateralAsset = asset.collateral[asset.collateral.length - 1][1] * feedPrice;

			asset.yield = (asset.current_supply > 0) ? 100 * (asset.collected_fees / asset.precision) / asset.current_supply : 0;

			// Convert collateral to asset unit
			for (i = 0; i < asset.collateral.length; i++) {
				asset.collateral[i][1] *= feedPrice;
			}

			// Get filtered feeds
			asset.feedInfo = filterFeeds(asset.feeds, true);
		}

		return {
			collateral: collateral,
			collateralAsset: collateralAsset,
			asset: asset
		};
	}

	function filterFeeds(feeds, boolean) {
		var tempFeeds = [],
			enoughFeeds = false,
			total = 0,
			averageFeed = 0;

		var yesterday = new Date(Date.now());
		yesterday.setDate(yesterday.getDate() - 1);


		if (feeds.length > 0) {
			feeds.forEach(function(feed, index) {
				if (boolean) {
					var match = feed.last_update.match(appcst.R_ISO8601_STR);
					var currentDate = new Date(Date.UTC(match[1], match[2] - 1, match[3], match[4], match[5], match[6]));
					if (currentDate > yesterday) {
						tempFeeds.push(feed);
						total += feed.price;
					}
				} else {
					tempFeeds.push(feed);
					total += feed.price;
				}
			});
			averageFeed = total / tempFeeds.length;
			enoughFeeds = (tempFeeds.length > 50) ? true : false;

			averageFeed = (averageFeed === 0) ? 0 : 1 / averageFeed;
		}

		return {
			enoughFeeds: enoughFeeds,
			feeds: tempFeeds,
			averageFeed: averageFeed
		};
	}

	function orderBook(asset) {

		var priceRatio = _getPriceRatio(asset._id, 0);
		var prefix = '',
			priceString,
			i;
		if (asset.issuer_id === -2) {
			prefix = 'bit';
			if (!asset.medianFeed) {
				asset.medianFeed = 0;
			}
			if (asset.medianFeed !== 0) {
				asset.medianLine = 1 / asset.medianFeed;
			} else {
				asset.medianLine = 0;
			}


			// Short wall
			var wall = {};

			wall.amount = 0;
			wall.price = asset.medianFeed;

			asset.shortSum = [];

			asset.shorts.sort(function(a, b) {
				return b.price_limit - a.price_limit;
			});

			if (asset.shorts.length > 0) {
				// Split orders with and without price limit
				for (i = 0; i < asset.shorts.length; i++) {
					if (asset.shorts[i].price_limit === 'None' || (asset.shorts[i].price_limit >= wall.price && wall.price > 0)) {
						wall.amount += asset.shorts[i].collateral * wall.price / 2;
					} else if (i > 0) {
						if (asset.shorts[i - 1].price_limit === asset.shorts[i].price_limit) {
							asset.shortSum[asset.shortSum.length - 1][1] += asset.shorts[i].collateral / 2;
						} else {
							asset.shortSum.push([1 / asset.shorts[i].price_limit, asset.shorts[i].collateral / 2]);
						}

					} else {
						asset.shortSum.push([1 / asset.shorts[i].price_limit, asset.shorts[i].collateral / 2]);
					}

					priceString = _splitPrice(asset.shorts[i].price_limit, asset.symbol);
					asset.shorts[i].priceInt = priceString[0];
					asset.shorts[i].priceDec = priceString[1];
				}

				wall.amount *= (1 / wall.price);
				var temp = [];
				if (wall.amount > 0) {
					asset.shortSum.push([1 / wall.price, wall.amount]);
				}

				// Sort in ascending order
				asset.shortSum.sort(function(a, b) {
					return a[0] - b[0];
				});

				temp.push([asset.shortSum[0][0], asset.shortSum[0][1]]);

				// Sum orders at same price
				var sum = 0;
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
				asset.shortSum = flattenArray(asset.shortSum, true, asset.medianFeed);

				// Filter shorts too far outside a normal range
				asset.shorts = asset.shorts.filter(function(entry, i) {
					if (entry.price_limit < asset.medianFeed / 2) {
						return false || i < 10;
					}
					return true;
				});

				// Saturate price limit at feed price
				asset.shorts.forEach(function(short) {
					short.price_limit = (short.price_limit > asset.medianFeed || short.price_limit === 'None') ? asset.medianFeed : short.price_limit;
					priceString = _splitPrice(1 / short.price_limit, asset.symbol);
					short.priceInt = priceString[0];
					short.priceDec = priceString[1];
				});

				// Sort shorts: by price limit then by interest
				asset.shorts.sort(function(a, b) {
					return (a.price_limit !== b.price_limit) ? b.price_limit - a.price_limit : b.interest - a.interest;
				});
			}

			// Sort and limit covers
			var now = Date.now();
			var feedPrice = (1 / asset.medianFeed);
			var expiredCovers = {};
			expiredCovers.price = feedPrice;
			expiredCovers.amount = 0;
			expiredCovers.count = 0;
			expiredCovers.type = 'cover';
			var forcedCovers = {};
			forcedCovers.price = feedPrice * 1.1;
			forcedCovers.amount = 0;
			forcedCovers.count = 0;
			forcedCovers.type = 'cover';
			if (asset.covers) {

				asset.covers.sort(function(a, b) {
					return (new Date(a.expiration)) - (new Date(b.expiration));
				});

				asset.covers.forEach(function(cover) {
					cover.callPrice = 1 / (cover.market_index.order_price.ratio * _getPriceRatio(cover.market_index.order_price.quote_asset_id, cover.market_index.order_price.base_asset_id));
					cover.collateral = cover.collateral / getPrecision(0);
					cover.owed = cover.state.balance / getPrecision(cover.market_index.order_price.quote_asset_id);
					cover.interest = cover.interest_rate.ratio * 100;
					cover.expiration = new Date(cover.expiration);

					if (cover.expiration < now) {
						expiredCovers.amount += cover.owed * feedPrice;
						expiredCovers.count++;
					} else if (cover.callPrice < feedPrice) {
						forcedCovers.amount += cover.owed * feedPrice;
						forcedCovers.count++;
					}

					priceString = _splitPrice(cover.callPrice, asset.symbol);
					cover.priceInt = priceString[0];
					cover.priceDec = priceString[1];
				});

				// Filter covers to only show for next week or forced margin calls
				var oneWeek = new Date();
				oneWeek.setDate(oneWeek.getDate()+7);
				asset.covers = asset.covers.filter(function(entry, i) {
					return (entry.expiration < oneWeek || entry.callPrice < feedPrice) || i < 30;
				});

				if (expiredCovers.amount > 0) {
					priceString = _splitPrice(expiredCovers.price, asset.symbol);
					expiredCovers.priceInt = priceString[0];
					expiredCovers.priceDec = priceString[1];
					asset.asks.push(expiredCovers);
					for (i = asset.sum.asks.length - 1; i >= 0; i--) {

						if (asset.sum.asks[i][0] < expiredCovers.price) {
							if (i !== asset.sum.asks.length - 1) {
								asset.sum.asks.splice(i + 1, 0, [expiredCovers.price, asset.sum.asks[i + 1][1] + expiredCovers.amount]);
							} else {
								asset.sum.asks.splice(i + 1, 0, [expiredCovers.price, expiredCovers.amount]);
							}
							break;
						}
					}
					for (i = i; i >= 0; i--) {
						asset.sum.asks[i][1] += expiredCovers.amount;
					}
				}

				if (forcedCovers.amount > 0) {
					priceString = _splitPrice(forcedCovers.price, asset.symbol);
					forcedCovers.priceInt = priceString[0];
					forcedCovers.priceDec = priceString[1];

					asset.asks.push(forcedCovers);
					for (i = asset.sum.asks.length - 1; i >= 0; i--) {

						if (asset.sum.asks[i][0] < forcedCovers.price) {
							if (i !== asset.sum.asks.length - 1) {
								asset.sum.asks.splice(i + 1, 0, [forcedCovers.price, asset.sum.asks[i + 1][1] + forcedCovers.amount]);
							} else {
								asset.sum.asks.splice(i + 1, 0, [forcedCovers.price, forcedCovers.amount]);
							}
							break;
						}
					}
					for (i = i; i >= 0; i--) {
						asset.sum.asks[i][1] += forcedCovers.amount;
					}
				}
			}

			// console.log(asset.asks);
			// console.log(asset.sum.asks);


		}

		// Apply price ratio to order history
		var decimals = (asset.symbol.indexOf('BTC') === -1 && asset.symbol !== 'GOLD') ? 4 : 8;
		var date24h = new Date();
		date24h = new Date(date24h.setDate(date24h.getDate() - 1));
		var tradesFound = false;
		asset.lastPrice = 0;
		asset.dailyVolume = 0;

		if (asset.order_history.length > 0) {
			asset.lastPrice = 1 / (asset.order_history[0].bid_index.order_price.ratio * priceRatio);
			asset.dailyLow = 1 / (asset.order_history[0].ask_index.order_price.ratio * priceRatio);
			asset.dailyHigh = 0;

			asset.order_history.forEach(function(order) {
				order.localTime = new Date(order.timestamp);
				if (date24h < order.localTime) {
					tradesFound = true;
					asset.dailyHigh = Math.max(asset.dailyHigh, 1 / (order.ask_index.order_price.ratio * priceRatio));
					asset.dailyLow = Math.min(asset.dailyLow, 1 / (order.ask_index.order_price.ratio * priceRatio));
					asset.dailyVolume += order.ask_paid.amount / basePrecision;
				}

				order.ask_paid.amount = $filter('number')(order.ask_paid.amount / basePrecision, 2) + ' ' + baseAsset;
				order.ask_received.amount = $filter('number')(order.ask_received.amount / asset.precision, 3) + ' ' + asset.symbol;
				order.ask_index.order_price.ratio = $filter('number')(1 / (order.ask_index.order_price.ratio * priceRatio), 3) + ' ' + baseAsset + '/' + asset.symbol;

				order.bid_paid.amount = $filter('number')(order.bid_paid.amount / asset.precision, 3) + ' ' + asset.symbol;
				order.bid_received.amount = $filter('number')(order.bid_received.amount / basePrecision, 2) + ' ' + baseAsset;
				order.bid_index.order_price.ratio = $filter('number')(1 / (order.bid_index.order_price.ratio * priceRatio), 3) + ' ' + baseAsset + '/' + asset.symbol;

				order.quote_fees.amount = $filter('number')(order.quote_fees.amount / asset.precision, decimals) + ' ' + asset.symbol;

			});

			// Filter order history to show only for 24h or max of 30 rows
			asset.order_history = asset.order_history.filter(function(entry, i) {
				return (new Date(entry.timestamp) > date24h && i < 30) || i < 30;
			});

			if (tradesFound) {
				asset.dailyLow = $filter('number')(asset.dailyLow, 2) + ' ' + baseAsset + '/' + prefix + asset.symbol;
				asset.dailyHigh = $filter('number')(asset.dailyHigh, 2) + ' ' + baseAsset + '/' + prefix + asset.symbol;
			} else {
				asset.dailyLow = '0';
				asset.dailyHigh = '0';
			}
			asset.lastPrice = $filter('number')(asset.lastPrice, 3) + ' ' + baseAsset + '/' + prefix + asset.symbol;
			asset.feedText = $filter('number')(1 / asset.medianFeed, 2) + ' ' + baseAsset + '/' + prefix + asset.symbol;
		}

		// Asks and bids

		if (asset.asks.length > 0) {
			asset.asks = asset.asks.filter(function(ask, i) {
				return ask.price > asset.asks[0].price / 2 || i < 10;
			});

			for (i = 0; i < asset.asks.length; i++) {
				priceString = _splitPrice(asset.asks[i].price, asset.symbol);
				asset.asks[i].priceInt = priceString[0];
				asset.asks[i].priceDec = priceString[1];
			}

			asset.asks.sort(function(a, b) {
				return b.price - a.price;
			});
		}

		if (asset.bids.length > 0) {
			asset.bids = asset.bids.filter(function(bid, i) {
				return bid.price < asset.bids[0].price * 2 || i < 10;
			});

			for (i = 0; i < asset.bids.length; i++) {
				priceString = _splitPrice(asset.bids[i].price, asset.symbol);
				asset.bids[i].priceInt = priceString[0];
				asset.bids[i].priceDec = priceString[1];
			}

			asset.bids.sort(function(a, b) {
				return a.price - b.price;
			});
		}



		asset.sum.asks = flattenArray(asset.sum.asks, false, asset.medianFeed, true);
		asset.sum.bids = flattenArray(asset.sum.bids, false, asset.medianFeed);

		return asset;
	}

	function flattenArray(array, sumBoolean, medianFeed, inverse) {
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

				// Ensure order book step plots go all the way and don't stop in the middle of nowhere
				if (orderBookArray[0][0] !== 0) {
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

				// Ensure order book step plots go all the way and don't stop in the middle of nowhere
				orderBookArray.push([orderBookArray[orderBookArray.length - 1][0] * 2, orderBookArray[orderBookArray.length - 1][1]]);
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

	function _splitPrice(price, symbol) {
		var assetDecimals = 3;
		if (symbol.indexOf('BTC') !== -1 || symbol.indexOf('GOLD') !== -1) {
			assetDecimals = 6;
		}

		return $filter('number')(price, assetDecimals).split('.');
	}

	return {
		init: init,
		getSymbol: getSymbol,
		getPrecision: getPrecision,
		fetchAssets: fetchAssets,
		fetchVolume: fetchVolume,
		fetchAsset: fetchAsset,
		assetInfo: assetInfo,
		fetchPrice: fetchPrice,
		fetchPriceHistory: fetchPriceHistory,
		fetchOrderBook: fetchOrderBook,
		filterFeeds: filterFeeds
	};

}]);