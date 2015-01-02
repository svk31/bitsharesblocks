angular.module('app')

.factory('Delegates', ['api', '$q', '$translate', '$filter', 'appcst', function(api, $q, $translate, $filter, appcst) {
	var _delegateNames = {};
	var _delegateNamesArray = [];
	var _versions = {};
	var _standyBoolean = false;

	var _activeTime = 0;
	var _standbyTime = 0;
	var _activeDelegates;
	var _standbyDelegates;

	var _currentDelegate;

	var _cacheLength = 10;
	var _delegateArray = [];
	var _delegateTime = [];

	var _votesArray = [];
	var _votesTime = [];

	_versions = store.get('versions');
	if (_versions === undefined) {
		_versions = {};
	}

	for (var id in _delegateNames) {
		_delegateNamesArray.push({
			name: _delegateNames[id].name,
			_id: id
		});
	}
	var _delegateNamesCount = _delegateNamesArray.length;

	function initDelegateNames() {
		var deferred = $q.defer();
		if (Object.keys(_delegateNames).length > 0) {
			deferred.resolve('done');
		} else {
			refreshDelegateNames().then(function(done) {
				deferred.resolve('done');
			});
		}
		return deferred.promise;
	}

	function getName(id) {
		if (id >= 0) {
			if (_delegateNames[id]) {
				return _delegateNames[id].name;
			} else {
				return '';
			}
		} else {
			return '';
		}
	}

	function getDelegateNames() {
		return _delegateNames;
	}

	function setStandbyBoolean(boolean) {
		_standyBoolean = boolean;
	}

	function getStandbyBoolean(boolean) {
		return _standyBoolean;
	}

	function getDelegateNamesArray() {
		if (_delegateNamesArray.length !== _delegateNamesCount) {
			for (var id in _delegateNames) {
				_delegateNamesArray.push({
					name: _delegateNames[id].name,
					_id: id
				});
			}
		}
		return _delegateNamesArray;
	}

	function refreshDelegateNames() {
		var deferred = $q.defer();
		api.getDelegateNames().success(function(result) {
			_delegateNamesCount = result.length;
			for (var i = 0; i < result.length; i++) {
				_delegateNames[result[i]._id] = {
					'name': result[i].name
				};
			}
			deferred.resolve('done');
		});
		return deferred.promise;
	}

	function fetchDelegates(cacheBoolean) {
		var promise = _getDelegates(cacheBoolean);
		var deferred = $q.defer();
		promise.then(function(result) {
			_versions = result.versions;
			store.set('versions', _versions);

			var delegates = _addInfo(result.delegates, result.ranks, result.latencies[0], result.activeFeeds);
			deferred.resolve({
				maintenance: result.maintenance,
				delegates: delegates
			});
		});
		return deferred.promise;
	}

	function _getDelegates(cacheBoolean) {
		var deferred = $q.defer();
		if (_standyBoolean) {
			if (Date.now() - _standbyTime > 1000 * 60) {
				api.getDelegates(cacheBoolean).success(function(result) {
					_standbyDelegates = result;
					_standbyTime = Date.now();
					deferred.resolve(result);
				});
			} else {
				deferred.resolve(_standbyDelegates);
			}
		} else {
			if (Date.now() - _activeTime > 1000 * 60) {
				api.getActiveDelegates(cacheBoolean).success(function(result) {
					_activeDelegates = result;
					_activeTime = Date.now();
					deferred.resolve(result);
				});
			} else {
				deferred.resolve(_activeDelegates);
			}

		}
		return deferred.promise;
	}

	function fetchVotes(delegateName) {
		var deferred = $q.defer();
		var isCached = _votesAreCached(delegateName);
		if (isCached.isCached) {
			deferred.resolve(_votesArray[isCached.index].result);
		} else {
			api.getDelegateVotes(delegateName).success(function(result) {
				if (result.votes) {
					for (var i = 0; i < result.votes.votes.length; i++) {
						result.votes.votes[i].vote = $filter('number')(result.votes.votes[i].vote, 0);
					}
					_votesArray.push({
						result: result,
						name: delegateName
					});
					_votesTime.push(Date.now());
				}
				deferred.resolve(result);
			});
		}

		if (_votesArray.length > _cacheLength) {
			_votesArray.splice(0, 1);
			_votesTime.splice(0, 1);
		}
		return deferred.promise;
	}


	function _getDelegate(name, rank, isCached) {
		var deferred = $q.defer();
		if (name === false) {
			if (!isCached.isCached && _currentDelegate) {
				_delegateArray.push(_currentDelegate);
				_delegateTime.push(Date.now());
			}
			api.getDelegateByRank(rank).success(function(result) {
				deferred.resolve(result);
			});
		} else {
			if (!_isCached.isCached && _currentDelegate) {
				_delegateArray.push(_currentDelegate);
				_delegateTime.push(Date.now());
			}
			api.getDelegate(name).success(function(result) {
				deferred.resolve(result);
			});
		}
		if (_delegateArray.length > _cacheLength) {
			_delegateArray.splice(0, 1);
			_delegateTime.splice(0, 1);
		}
		return deferred.promise;
	}

	function _isCached(name, rank) {
		var isCached = false;
		var i;

		if (_delegateArray.length > 0) {
			// Clean cache array
			for (i = _delegateArray.length - 1; i > 0; i--) {
				if (Date.now() - _delegateTime[i] > 60000) {
					_delegateTime.splice(i, 1);
					_delegateArray.splice(i, 1);
				}
			}
			// Determine if is cached
			for (i = 0; i < _delegateArray.length; i++) {
				if (_delegateArray[i].delegate.name === name || _delegateArray[i].delegate.rank === rank) {
					isCached = true;
					break;
				}
			}
		}

		return {
			isCached: isCached,
			index: i
		};
	}

	function _votesAreCached(name) {
		var isCached = false;
		var i;

		if (_votesArray.length > 0) {
			// Clean cache array
			for (i = _votesArray.length - 1; i > 0; i--) {
				if (Date.now() - _votesTime[i] > 60000) {
					_votesTime.splice(i, 1);
					_votesArray.splice(i, 1);
				}
			}
			// Determine if is cached
			for (i = 0; i < _votesArray.length; i++) {
				if (_votesArray[i].name === name) {
					isCached = true;
					break;
				}
			}
		}

		return {
			isCached: isCached,
			index: i
		};
	}

	function fetchDelegate(name, rank) {
		var deferred = $q.defer();
		var isCached = _isCached(name, rank);

		if (isCached.isCached) {
			deferred.resolve(_delegateArray[isCached.index]);
		} else {
			var promise = _getDelegate(name, rank, isCached);
			promise.then(function(result) {
				_currentDelegate = result;
				deferred.resolve(_updateInfo(result));
			});
		}

		return deferred.promise;
	}

	function _addInfo(delegates, ranks, latencies, activeFeeds) {
		var activeDelegates = 101;
		var feedsCutoff = 5 * activeDelegates;
		delegates.forEach(function(delegate, i) {

			// Add ranks
			delegate.dayChange = (ranks.dayChange[delegate._id] !== undefined) ? ranks.dayChange[delegate._id] : 'n/a';
			delegate.weekChange = (ranks.weekChange[delegate._id] !== undefined) ? ranks.dayChange[delegate._id] : 'n/a';

			// Count active feeds
			delegate.activeFeeds = 0;
			delegate.updateFreq = 0;
			if (delegate.rank < feedsCutoff) {
				for (var j = 0; j < activeFeeds.length; j++) {
					if (delegate._id === activeFeeds[j]._id) {
						delegate.activeFeeds = activeFeeds[j].activeFeeds;
						delegate.updateFreq = activeFeeds[j].uniqueCount / 2;
					}
				}
			} else {
				delegate.activeFeeds = 'n/a';
				delegate.updateFreq = 'n/a';
			}

			// Latencies
			if (delegate.rank <= activeDelegates && latencies.latencies[delegate._id] && latencies.latencies[delegate._id].avg >= 0) {
				if (typeof(latencies.latencies[delegate._id].avg) === 'number') {
					delegate.avgLatency = latencies.latencies[delegate._id].avg;
				} else {
					delegate.avgLatency = 'n/a';
				}
			} else {
				delegate.avgLatency = 'n/a';
			}

			// Check version
			delegate = checkVersion(delegate);
		});

		return delegates;
	}

	function checkVersion(delegate) {
		delegate.version = 4;
		delegate.versionIncrement = 0;
		if (delegate.public_data !== null && delegate.public_data.version) {
			var version = delegate.public_data.version.match(/\d+/g);
			if (version !== null) {
				delegate.versionIncrement = version[2] * 10;
				if (version !== null) {
					version[1] = parseInt(version[1], 10);
					version[2] = parseInt(version[2], 10);
					if (version[1] === _versions.main && version[2] >= _versions.increment.current) {
						if (angular.isDefined(version[3])) {
							version[3] = parseInt(version[3], 10);

							if (version[3] === _versions.RC.current) {
								if (_versions.RC.current !== -999) {
									delegate.version = 1;
								} else {
									delegate.version = 3;
								}
								delegate.versionIncrement += _versions.RC.current * _versions.RC.multiplier;
							} else if (version[3] <= _versions.RC.previous) {
								if (_versions.RC.current !== -999) {
									delegate.version = 2;
								} else {
									delegate.version = 3;
								}
								delegate.versionIncrement += _versions.RC.previous * (-1) * _versions.RC.multiplier;
							} else if (version[3] <= _versions.RC.old) {
								delegate.version = 3;
								delegate.versionIncrement += _versions.RC.old * (-1) * _versions.RC.multiplier;
							}
						} else {
							delegate.version = 1;
						}
					} else if (version[1] === _versions.main && version[2] === _versions.increment.previous) {
						delegate.version = 2;
					} else if (version[1] === _versions.main && version[2] <= _versions.increment.old) {
						delegate.version = 3;
					}
				}
			} else {
				delegate.public_data = {};
				delegate.public_data.version = 'Unknown!';
			}
		} else {
			delegate.public_data = {};
			delegate.public_data.version = 'Not set!';
		}
		return delegate;
	}

	function _updateInfo(result) {
		var delegate = result.delegate;
		delegate.totalFees = result.totalFees;

		// Add ranks
		if (typeof(result.ranks.dayChange === 'number')) {
			delegate.showDayChange = true;
		}
		if (typeof(result.ranks.weekChange === 'number')) {
			delegate.showWeekChange = true;
		}
		delegate.dayChange = (result.ranks.dayChange !== undefined) ? result.ranks.dayChange : 'n/a';
		delegate.weekChange = (result.ranks.weekChange !== undefined) ? result.ranks.dayChange : 'n/a';

		// Check version
		delegate = checkVersion(delegate);

		// Extract public data
		if (delegate.public_data) {
			if (delegate.public_data.gui_data && delegate.public_data.gui_data.website) {

				if (delegate.public_data.gui_data.website.match(/http/)) {
					delegate.website = delegate.public_data.gui_data.website;
				} else {
					delegate.website = 'http://' + delegate.public_data.gui_data.website;
				}
			}
			if (delegate.public_data.website) {
				if (delegate.public_data.website.match(/http/)) {
					delegate.website = delegate.public_data.website;
				} else {
					delegate.website = 'http://' + delegate.public_data.website;
				}
			}
			if (delegate.public_data.delegate) {
				if (delegate.public_data.delegate.role >= 0) {
					$translate('delegate.data.role_' + delegate.public_data.delegate.role).then(function(role) {
						delegate.role = role;
					});
				}
			}
		}

		// Calculate total earnings
		delegate.totalEarnings = 0;

		var withLength;
		if (result.withdrawals) {
			withLength = result.withdrawals.length;
			var currentDate = new Date();

			if (withLength > 0) {
				result.withdrawals.unshift([result.initialFee, 0]);
				result.withdrawals.push([currentDate.getTime(), result.withdrawals[result.withdrawals.length - 1][1] + delegate.delegate_info.pay_balance]);
			} else {
				result.withdrawals.push([result.initialFee, 0]);
				result.withdrawals.push([currentDate.getTime(), delegate.delegate_info.pay_balance]);
			}
			delegate.totalEarnings = result.withdrawals[result.withdrawals.length - 1][1] + result.totalFees;
		}

		return {
			delegate: delegate,
			withdrawals: result.withdrawals,
			latencies: result.latencies,
			votes: result.votes
		};
	}

	function filterFeeds(boolean) {
		var feeds = _currentDelegate.feeds;
		var yesterday = new Date(Date.now());
		var filteredFeeds = [];
		var feedInfo = {};
		yesterday.setDate(yesterday.getDate() - 1);

		var feed;
		if (boolean) {
			if (feeds[0]) {
				for (feed in feeds[0].feeds) {
					match = feeds[0].feeds[feed].last_update.match(appcst.R_ISO8601_STR);
					var currentDate = new Date(Date.UTC(match[1], match[2] - 1, match[3], match[4], match[5], match[6]));
					if (currentDate > yesterday) {
						filteredFeeds.push(feeds[0].feeds[feed]);
					}
				}
				feedInfo.activeFeeds = feeds[0].activeFeeds;
				feedInfo.totalFeeds = feeds[0].totalFeeds;
			} else {
				feedInfo = {};
				feedInfo.activeFeeds = 0;
				feedInfo.totalFeeds = 0;
			}
		} else {
			if (feeds[0]) {
				for (feed in feeds[0].feeds) {
					filteredFeeds.push(feeds[0].feeds[feed]);
				}
				feedInfo.activeFeeds = feeds[0].activeFeeds;
				feedInfo.totalFeeds = feeds[0].totalFeeds;
			} else {
				feedInfo = {};
				feedInfo.activeFeeds = 0;
				feedInfo.totalFeeds = 0;
			}
		}

		return {
			feeds: filteredFeeds,
			feedInfo: feedInfo
		};
	}


	return {
		initDelegateNames: initDelegateNames,
		getName: getName,
		getDelegateNames: getDelegateNames,
		getDelegateNamesArray: getDelegateNamesArray,
		fetchDelegates: fetchDelegates,
		setStandbyBoolean: setStandbyBoolean,
		getStandbyBoolean: getStandbyBoolean,
		fetchDelegate: fetchDelegate,
		filterFeeds: filterFeeds,
		fetchVotes: fetchVotes,
		checkVersion: checkVersion
	};

}]);