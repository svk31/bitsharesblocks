angular.module('app')

.factory('Blocks', ['api', '$q', 'Assets', 'Accounts', function(api, $q, Assets, Accounts) {

	var _booleanTrx = false;
	var _blocksArray = [];
	var _maxBlock;
	var _blockCount = 20;
	var _currentBlock;

	function setBooleanTrx(boolean) {
		_booleanTrx = boolean;
	}

	function getBooleanTrx() {
		return _booleanTrx;
	}

	function getBlocks() {
		return _blocksArray;
	}

	function _getNew() {
		var deferred = $q.defer();
		if (_booleanTrx) {
			api.getNewBlocksTrx(_maxBlock).success(function(newBlocks) {
				deferred.resolve(newBlocks);
			});
		} else {
			api.getNewBlocks(_maxBlock).success(function(newBlocks) {
				if (newBlocks.length > 0) {
					_currentBlock = newBlocks[0]._id;
				}
				deferred.resolve(newBlocks);
			});
		}
		return deferred.promise;

	}

	function _getRecent() {
		var deferred = $q.defer();
		if (_booleanTrx) {
			api.getRecentBlocksTrx().success(function(blocks) {
				deferred.resolve(blocks);
			});

		} else {
			api.getRecentBlocks().success(function(blocks) {
				_currentBlock = blocks[0]._id;
				deferred.resolve(blocks);
			});
		}
		return deferred.promise;
	}

	function _updateFees(blocks) {
		if (blocks.length > 0 && blocks[0] !== _maxBlock) {
			for (var i = 0; i < blocks.length; i++) {
				if (blocks[i].trxLength > 0) {
					blocks[i].formFees = [];
					blocks[i].totalValue = [];
					for (var feesAsset in blocks[i].fees) {
						feesAsset = parseInt(feesAsset, 10);
						blocks[i].formFees.push({
							'price': parseInt(blocks[i].fees[feesAsset], 10) / Assets.getPrecision(feesAsset),
							'asset': Assets.getSymbol(feesAsset)
						});
					}
					if (blocks[i].transactions) {
						for (var valueAsset in blocks[i].transactions.totalvalue) {
							valueAsset = parseInt(valueAsset, 10);
							blocks[i].totalValue.push({
								'value': parseInt(blocks[i].transactions.totalvalue[valueAsset], 10) / Assets.getPrecision(valueAsset),
								'asset': Assets.getSymbol(valueAsset)
							});
						}

						blocks[i].uniqueTypes = [];
						for (var j = 0; j < blocks[i].types.length; j++) {
							var exists = false;
							for (var k = 0; k < blocks[i].uniqueTypes.length; k++) {
								if (blocks[i].uniqueTypes[k].type === blocks[i].types[j]) {
									exists = true;
									break;
								}
							}
							if (!exists) {
								blocks[i].uniqueTypes.push({
									type: blocks[i].types[j],
									count: 1
								});
							} else {
								blocks[i].uniqueTypes[k].count++;
							}
						}
					}
				}
			}

			blocks.sort(function(a, b) {
				return a._id - b._id;
			}).forEach(function(block, index) {
				_blocksArray.unshift(block);
				if (_blocksArray.length > 20) {
					_blocksArray.pop();
				}
			});

			_maxBlock = Math.max(blocks[0]._id, blocks[blocks.length - 1]._id);

		}
		return {
			blocks: _blocksArray,
			maxBlock: _maxBlock
		};
	}

	function _getBlocksPage(pageDelta, lastBlock, types, state) {
		var deferred = $q.defer(),
			query = {};

		var maxBlock;

		if (_blocksArray[0] && lastBlock === undefined) {
			highestBlock = _blocksArray[_blocksArray.length - 1]._id - (1 + (pageDelta - 1) * _blockCount);
		} else if (lastBlock) {
			highestBlock = lastBlock;
		}

		if (_booleanTrx) {

			query.types = types;

			if (pageDelta >= 0 && pageDelta < 2) {
				lastBlock = Math.max(highestBlock, _blockCount);
				query.sort = -1;
				query.block = lastBlock;
				query.inverse = false;

			} else if (pageDelta < 0) {
				highestBlock = Math.max(_blocksArray[0]._id, _blocksArray[_blocksArray.length - 1]._id);
				query.sort = 1;
				query.block = highestBlock;
				query.inverse = true;
			} else {
				query.sort = 1;
				query.block = 0;
				query.inverse = true;
			}

			_getTransactions(query)
				.then(function(result) {
					if (pageDelta > 0 && result.blocks.length === 0) {
						result.finalPage = true;
					}
					deferred.resolve(result);
				});
		} else {
			api.getBlocksPage(highestBlock).success(function(blocks) {
				deferred.resolve({
					blocks: blocks
				});
			});
		}
		// _blocksArray = [];
		return deferred.promise;
	}

	function _getCurrentBlock() {
		var deferred = $q.defer();
		api.getCurrentBlock().success(function(currentBlock) {
			_currentBlock = currentBlock.height;
			deferred.resolve(currentBlock.height);
		});
		return deferred.promise;
	}

	function fetchPage(pageDelta, lastBlock, types, state) {
		var deferred = $q.defer();
		$q.all([
				_getBlocksPage(pageDelta, lastBlock, types, state),
				_getCurrentBlock()
			])
			.then(function(results) {
				var blocks = results[0].blocks;
				var finalPage = results[0].finalPage || false;
				var currentBlock;
				if (_booleanTrx) {
					currentBlock = results[0].maxBlock;
				} else {
					currentBlock = results[1];
				}

				var blocksArray = _updateFees(blocks);
				deferred.resolve({
					blocks: blocksArray.blocks,
					maxBlock: blocksArray.maxBlock,
					currentBlock: currentBlock,
					finalPage: finalPage
				});
				// });

			});
		return deferred.promise;
	}

	function fetchRecent() {
		var deferred = $q.defer();
		var promise = _getRecent();
		promise.then(function(blocks) {
			deferred.resolve(_updateFees(blocks));
		});
		return deferred.promise;
	}

	function fetchNew() {
		var deferred = $q.defer();
		var promise = _getNew();
		promise.then(function(blocks) {
			deferred.resolve(_updateFees(blocks));
		});
		return deferred.promise;
	}

	function _getTransactions(query) {
		query.sort = (query.sort) ? query.sort : -1;
		var deferred = $q.defer();
		api.getTransactions(JSON.stringify(query)).success(function(result) {
			deferred.resolve(result);
		});
		return deferred.promise;
	}

	function fetchTransactions(query) {
		var deferred = $q.defer();
		_getTransactions(query).then(function(result) {
			result.blocks = _updateFees(result.blocks);
			deferred.resolve(result);
		});
		return deferred.promise;
	}

	function fetchBurns(sort) {
		var deferred = $q.defer();
		api.getBurns(sort).success(function(result) {
			var burns = [],
				accounts = [];
			result.forEach(function(block) {
				block.burn.operations.forEach(function(op) {
					if (op.type === 'burn_op_type' && op.data.message.length > 0) {
						burns.push({
							block: block._id,
							realAmount: op.data.amount.amount / Assets.getPrecision(op.data.amount.asset_id),
							assetSymbol: Assets.getSymbol(op.data.amount.aset_id),
							message: op.data.message
						});
						accounts.push(Accounts.getAccountName(op.data.account_id));
					}
				});
			});
			$q.all(accounts).then(function(names) {
				names.forEach(function(name, index) {
					burns[index].name = name;
				});
				deferred.resolve(burns);
			});
		});
		return deferred.promise;
	}

	return {
		fetchRecent: fetchRecent,
		fetchNew: fetchNew,
		fetchPage: fetchPage,
		getBooleanTrx: getBooleanTrx,
		setBooleanTrx: setBooleanTrx,
		getBlocks: getBlocks,
		fetchTransactions: fetchTransactions,
		fetchBurns: fetchBurns
	};

}]);