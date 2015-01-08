angular.module('app')

.factory('Accounts', ['api', '$q', 'Assets', function(api, $q, Assets) {
	var _accounts = {};

	_accounts = store.get('accounts');
	if (!_accounts) {
		_accounts = {};
		_accounts[0] = 'MARKET';
	}

	function getAccountName(id) {
		var deferred = $q.defer();
		if (_accounts[id]) {
			deferred.resolve(_accounts[id]);
		} else {
			api.getAccountByNr(id).success(function(account) {
				_accounts[id] = account.name;
				store.set('accounts', _accounts);
				deferred.resolve(account.name);
			});
		}
		return deferred.promise;
	}


	function fetchAccounts(mostRecent, highestID, query) {
		var deferred = $q.defer();
		_getAccounts(mostRecent, highestID, query).then(function(result) {
			result.accounts = wallOps(result.accounts);
			deferred.resolve(result);
		});

		return deferred.promise;
	}

	function _getAccounts(mostRecent, highestID, query) {
		var deferred = $q.defer();
		if (query) {
			$q.all([
					api.searchAccounts(query),
					getAccountsCount()
				])
				.then(function(results) {
					deferred.resolve({
						accounts: results[0].data,
						accountsCount: results[1]
					});
				});
		} else if (mostRecent) {
			api.getAccounts().success(function(accounts) {
				deferred.resolve({
					accounts: accounts,
					accountsCount: parseInt(accounts[0]._id, 10)
				});
			});
		} else {
			$q.all([
					api.getAccountsPage(highestID),
					getAccountsCount()
				])
				.then(function(results) {
					deferred.resolve({
						accounts: results[0].data,
						accountsCount: results[1]
					});
				});
		}
		return deferred.promise;
	}

	function _getAccount(name, id) {
		var deferred = $q.defer();
		var accounts = [];
		if (name) {
			api.getAccount(name).success(function(result) {
				accounts.push(result);
				deferred.resolve(accounts);
			});
		} else if (id) {
			api.getAccountByNr(id).success(function(result) {
				accounts.push(result);
				deferred.resolve(accounts);
			});
		}
		return deferred.promise;
	}

	function fetchAccount(name, id) {
		var deferred = $q.defer();
		_getAccount(name, id).then(function(result) {
			deferred.resolve(wallOps(result));
		});
		return deferred.promise;
	}

	function getAccountsCount() {
		var deferred = $q.defer();
		api.getAccountsCount().success(function(result) {
			deferred.resolve(result.count);
		});
		return deferred.promise;
	}

	function wallOps(accounts) {
		// Sum burn operations for each account
		accounts.forEach(function(account, index) {
			account.totalBurn = {};
			account.burnArray = [];
			if (account.burn.length > 0) {
				account.burn.forEach(function(burn, index) {
					if (!account.totalBurn[burn.amount.asset_id]) {
						account.totalBurn[burn.amount.asset_id] = 0;
					}
					burn.assetSymbol = Assets.getSymbol(burn.amount.asset_id);
					burn.realAmount = burn.amount.amount / Assets.getPrecision(burn.amount.asset_id);
					account.totalBurn[burn.amount.asset_id] += burn.realAmount;

				});
				for (var assetID in account.totalBurn) {
					account.burnArray.push({
						asset: Assets.getSymbol(assetID),
						amount: account.totalBurn[assetID]
					});
				}
			} else {
				account.burnArray.push({
					asset: '',
					amount: 0
				});
			}
		});
		return accounts;
	}

	function getBlockNumber(id) {
		var deferred = $q.defer();
		api.getBlockByTrx(id).success(function(result) {
			console.log(result);
			deferred.resolve(result._id);
		});
		return deferred.promise;
	}

	return {
		getAccountName: getAccountName,
		fetchAccounts: fetchAccounts,
		fetchAccount: fetchAccount,
		getBlockNumber: getBlockNumber
	};

}]);