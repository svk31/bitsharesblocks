angular.module('app')

.factory('Blocks', ['api', '$q', 'Assets', function(api, $q, Assets) {

	var _booleanTrx = false;
	var _blocksArray = [];
	var _maxBlock;
	var _blockCount = 20;
	var _currentBlock;
	var _trxCount;

	function setBooleanTrx(boolean) {
		_booleanTrx = boolean;
	}

	function getBooleanTrx() {
		return _booleanTrx;
	}

	function getBlocks() {
		return _blocksArray;
	}

	function getTrxCount() {
		return _trxCount;
	}

	function _getNew() {
		var deferred = $q.defer();
		if ( _booleanTrx ) {
			api.getNewBlocksTrx(_maxBlock).success(function(newBlocks) {
				deferred.resolve(newBlocks);
			});	
		}
		else {			
			api.getNewBlocks(_maxBlock).success(function(newBlocks) {
				if (newBlocks.length>0) {
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
			api.getRecentBlocksTrx().success(function (blocks) {
				deferred.resolve(blocks);
			});

		}
		else {
			api.getRecentBlocks().success(function (blocks) {
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
						feesAsset = parseInt(feesAsset,10);
						blocks[i].formFees.push({'price':parseInt(blocks[i].fees[feesAsset],10)/Assets.getPrecision(feesAsset),'asset':Assets.getSymbol(feesAsset)});
					}
					if (blocks[i].transactions) {
						for (var valueAsset in blocks[i].transactions.totalvalue) {
							valueAsset = parseInt(valueAsset,10);
							blocks[i].totalValue.push({'value':parseInt(blocks[i].transactions.totalvalue[valueAsset],10)/Assets.getPrecision(valueAsset),'asset':Assets.getSymbol(valueAsset)});
						}

						blocks[i].uniqueTypes = [];
						for (var j = 0; j < blocks[i].types.length; j++) {
							var exists = false;
							for (var k = 0; k < blocks[i].uniqueTypes.length; k++) {
								if ( blocks[i].uniqueTypes[k].type === blocks[i].types[j] ) {
									exists = true;
									break;
								}
							}
							if (!exists) {
								blocks[i].uniqueTypes.push({
									type: blocks[i].types[j],
									count: 1
								});
							}
							else {
								blocks[i].uniqueTypes[k].count++;
							}
						}
					}
				}
			}

			blocks.sort(function(a,b) {
				return a._id-b._id;
			}).forEach(function(block,index) {
				_blocksArray.unshift(block);
				if (_blocksArray.length > 20) {
					_blocksArray.pop();	
				}			
			});

			_maxBlock = Math.max(blocks[0]._id,blocks[blocks.length-1]._id);

		}
		return {
			blocks: _blocksArray,
			maxBlock: _maxBlock
		};
	}

	function _getBlocksPage(pageDelta, lastBlock, state) {
		var deferred = $q.defer();

		var maxBlock;

		if (_blocksArray[0] && lastBlock===undefined) {
			highestBlock = _blocksArray[_blocksArray.length-1]._id-(1+(pageDelta-1)*_blockCount);
		}
		else if(lastBlock) {
			highestBlock=lastBlock;
		}

		highestBlock=Math.max(highestBlock,_blockCount);

		if (_booleanTrx) {
			if (pageDelta<=0) {
				if (lastBlock) {
					maxBlock = lastBlock;
				}
				else {
					maxBlock= _maxBlock;
				}

				api.getTrxBlocksPageInverse(maxBlock).success(function (result) {
					_trxCount = result.trxCount;
					deferred.resolve(result.blocks);
				});
			}
			else {
				var minBlock;

				if (state && pageDelta===0) {
					minBlock=_maxBlock+1;
				}
				else {
					minBlock = Math.min(_blocksArray[0]._id,_blocksArray[_blocksArray.length-1]._id)-1;
				}
				if (pageDelta>1) {
					minBlock=20;
				}
				api.getTrxBlocksPage(minBlock).success(function (result) {
					_trxCount = result.trxCount;
					deferred.resolve(result.blocks);
				});
			}
		}
		else {
			api.getBlocksPage(highestBlock).success(function (blocks) {
				deferred.resolve(blocks);
			});
		}
		_blocksArray = [];
		return deferred.promise;
	}

	function _getCurrentBlock() {
		var deferred = $q.defer();
		api.getCurrentBlock().success(function(currentBlock) {
			_currentBlock = currentBlock;
			deferred.resolve(currentBlock);
		});
		return deferred.promise;
	}

	function fetchPage(pageDelta, lastBlock, state) {
		var deferred = $q.defer();
		var promisePage = _getBlocksPage(pageDelta, lastBlock, state);

		promisePage.then(function(blocks) {
			var blocksArray = _updateFees(blocks);
			var promiseCurrent = _getCurrentBlock();
			promiseCurrent.then(function(currentBlock) {
				_currentBlock = currentBlock;
				deferred.resolve({
					blocks: blocksArray.blocks,
					maxBlock: blocksArray.maxBlock,
					currentBlock: currentBlock
				});	
			});

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



	return {
		fetchRecent: fetchRecent,
		fetchNew: fetchNew,
		fetchPage: fetchPage,
		getBooleanTrx: getBooleanTrx,
		setBooleanTrx: setBooleanTrx,
		getBlocks: getBlocks,
		getTrxCount: getTrxCount
	};

}]);