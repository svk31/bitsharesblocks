angular.module('app.services', [])

.factory('getAssetDetail', function($q, api) {


	return {
		fetch: function(assetId) {
			var deferred = $q.defer();
			api.getAssetDetail(assetId).success(function(result) {
				deferred.resolve({
					symbol: result.symbol,
					precision: result.precision
				});
			});
			return deferred.promise;
		}
	};
})

.constant('appcst', {
	R_ISO8601_STR: /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/,
	translation: {
		"nav": {
			"home": "Home",
			"blocks": "Blocks",
			"delegates": "Delegates",
			"accounts": "Accounts",
			"assets": "Assets",
			"charts": "Charts",
			"general": "General",
			"supply": "DVS Supply and Fees",
			"btsgenesis": "DVS Genesis",
			"btsxgenesis": "BTSX Genesis",
			"about": "About"
		},
		"alerts": {
			"del1": "I've created a new delegate, please consider changing your votes to support",
			"del2": "instead",
			"del3": "More info",
			"del4": "here"
		},
		"footer": {
			"vote": "Please vote for my delegate",
			"donate": "Donate",
			"info": "Info/Updates",
			"thread": "BitsharesTalk Thread",
			"version": "Client version",
			"language": "Language"
		},
		"apiModal": {
			"title": "Change API server",
			"body": "You are automatically assigned an API server close to you, but if you are experiencing issues you may manually select a new API server here:",
			"close": "Close",
			"auto": "Automatic (default)",
			"new_york": "New York, USA",
			"singapore": "Singapore",
			"api": "API"
		},
		"home": {
			"history": "BTS PRICE HISTORY LAST 14 DAYS",
			"price": "Price",
			"MA": "30-day Moving Average",
			"health": {
				"title": "NETWORK HEALTH",
				"alert": "Network Alert Level:",
				"particip": "Delegate Participation Rate:",
				"confirm": "Average Confirmation Time:",
				"forks": "Forks in last 24hrs:",
				"forkBlock": "Block height of last fork:",
				"signee": "Fork delegate signee:",
				"latency": "Latency of delegate:"
			},
			"delegate": {
				"title": "DELEGATE STATS",
				"reg": "Registered delegates",
				"votes": "Delegates with votes",
				"payReg": "100% pay registration",
				"new24": "New delegates last 24h",
				"new7d": "New delegates last 7d",
				"pay": "Max pay rate",
				"averagePay": "Average pay rate"
			},
			"blockchain": {
				"title": "BLOCKCHAIN STATS",
				"supply": "Share supply",
				"unclaimed": "Unclaimed",
				"collat": "Tied in collateral",
				"change": "24h supply change",
				"current": "Current block",
				"trx": "Blocks with transactions",
				"missed": "Total missed blocks"
			},
			"asset": {
				"title": "ASSET STATS",
				"number": "Number of assets",
				"user": "User issued assets",
				"shortReg": "Short name registration",
				"longReg": "Long name registration",
				"new7d": "New assets last 7d",
				"new30d": "New assets last 30d",
				"trx": "Asset transactions"
			},
			"user": {
				"title": "USER STATS",
				"number": "Number of accounts",
				"unique": "Number of unique accounts",
				"uniqueNew": "New unique accounts",
				"sub": "Number of sub-accounts",
				"new24": "New accounts last 24h",
				"new7d": "New accounts last 7d"
			},
			"missed": {
				"title": "LAST 10 MISSED BLOCKS"
			},
			"blocks": {
				"title": "LAST 10 BLOCKS"
			},
			"newUsers": {
				"title": "NEW USERS"
			},
			"burns": {
				"title": "BURN-BOX",
				"recent": "Most recent burns",
				"largest": "Largest burns"
			}
		},
		"blocks": {
			"search1": "search for a block height or transaction id",
			"search2": "go to block height",
			"current": "CURRENT",
			"higher": "HIGHER",
			"lower": "LOWER",
			"first": "FIRST",
			"last": "LAST",
			"blocks": "BLOCKS",
			"showTrx": "Only show blocks with transactions",
			"blockNum": "Block number",
			"timestamp": "Timestamp",
			"delegate": "Delegate",
			"trxCount": "Transaction count",
			"trxValue": "Transaction value",
			"fees": "Fees",
			"types": "Transaction types"
		},
		"block": {
			"block": "Block",
			"previous": "Previous block",
			"next": "Next block",
			"details": {
				"title": "BLOCK DETAILS",
				"signee": "Delegate signee",
				"size": "Block size",
				"latency": "Latency",
				"time": "Processing time",
				"hash1": "Previous hash",
				"hash2": "Next secret hash",
				"hash3": "Previous secret hash",
				"shares": "Shares issued",
				"collected": "Fees collected",
				"destroyed": "Fees destroyed"
			},
			"trx": {
				"title": "TRANSACTION",
				"type": "Operation type",
				"id": "Transaction ID",
				"fee": "Transaction fee",
				"public": "Public data",
				"delegate": "Delegate name",
				"feedUpdates": "Feed updates",
				"feedPrice": "Feed price",
				"votes": "Votes in transaction",
				"price": "Price ratio",
				"interest": "Interest rate",
				"priceLimit": "Price limit",
				"collateral": "Collateral",
				"assetName": "Asset name",
				"assetAmount": "Amount of asset",
				"base": "Amount of base asset",
				"amount": "Amount",
				"noVotes": "No votes in this transaction",
				"account": "Account",
				"message": "Message",
				"key": "Owner key",
				"asset": "Asset",
				"description": "Asset Description",
				"issuer": "Issuer account",
				"for": "For delegate",
				"burn": "Burn",
				"asset_create": "Create asset",
				"asset_issue": "Issue asset",
				"add_collateral": "Add collateral",
				"withdraw_pay": "Delegate pay withdrawal",
				"all": "Show all transactions",
				"placeholder": "Filter by transaction types",
				"withdrawal": "Withdrawal",
				"deposit": "Deposit",
				"slate": "Define delegate slate",
				"slateID": "Delegate slate ID"
			}
		},
		"delegates": {
			"search": "Find a delegate",
			"title": "DELEGATES INFO",
			"rank": "Rank",
			"change24": "24h change",
			"change7": "7d change",
			"votes": "Number of votes",
			"produced": "Produced",
			"missed": "Missed",
			"rate": "Pay rate",
			"latency": "Average latency",
			"feeds": "Active feeds",
			"feedFreq": "Feed frequency",
			"rel": "Reliability",
			"version": "Version",
			"filter": "filter",
			"no_version": "Not set",
			"active": "Show active delegates",
			"standby": "Show standby delegates"
		},
		"delegate": {
			"prevRank": "Previous rank",
			"nextRank": "Next rank",
			"votesChart": "VOTES EVOLUTION",
			"sumVotes": "Sum of votes",
			"payChart": {
				"title": "NET EARNINGS",
				"name": "Cumulative earnings"
			},
			"rank": {
				"title": "RANK AND VOTES",
				"current": "Current rank",
				"dayChange": "24h rank change",
				"weekChange": "7 day rank change",
				"votes": "Number of votes for",
				"percentVotes": "Percent number of votes for"
			},
			"data": {
				"title": "PUBLIC DATA",
				"description": "Description",
				"proposal": "Delegate bid",
				"location": "Server location",
				"country": "Delegate country",
				"handle": "BitsharesTalk username",
				"ann": "Announcements",
				"role": "Role",
				"website": "Website",
				"role_0": "Development",
				"role_1": "Marketing",
				"role_2": "Faucet",
				"role_3": "Backbone",
				"role_4": "Charity",
				"role_5": "Technical Support",
				"role_6": "Law/Regulations",
				"role_7": "Media/Public Relations"
			},
			"feeds": {
				"title": "DELEGATE FEEDS",
				"total": "Total number of feeds",
				"active": "Active feeds",
				"show": "Show feeds",
				"valid": "Only show valid feeds"
			},
			"info": {
				"title": "DELEGATE INFO",
				"earnings": "Total earnings",
				"withdrawn": "Withdrawn earnings",
				"fees": "Total fees paid"
			},
			"prod": {
				"title": "BLOCK PRODUCTION",
				"prod": "Blocks produced",
				"missed": "Blocks missed",
				"last": "Last Block Produced",
				"lat50": "Average latency last 50 blocks",
				"lat100": "Average latency last 100 blocks",
				"lat200": "Average latency last 200 blocks"
			},
			"votes": {
				"title": "VOTES HISTORY",
				"total": "TOTAL VOTES",
				"net": "Net votes >= 10,000"
			},
			"slate": {
				"title": "SLATE"
			}
		},
		"accounts": {
			"title": "ACCOUNTS",
			"search1": "Find an account by name",
			"search2": "go to id number",
			"recent": "MOST RECENT",
			"newer": "NEWER",
			"older": "OLDER",
			"oldest": "OLDEST",
			"name": "Account Name",
			"id": "Id",
			"reg": "Registration date",
			"regBlock": "Registration block",
			"update": "Last update",
			"yes": "Yes",
			"no": "No",
			"wall": "Wall total"
		},
		"account": {
			"previous": "Previous account",
			"next": "Next account",
			"title1": "ACCOUNT INFO",
			"id": "Account ID",
			"owner": "Owner",
			"title2": "ACTIVE KEY HISTORY",
			"date": "Date",
			"key": "Key",
			"website": "Website",
			"burn": "WALL BURNS",
			"parent": "Parent account",
			"subs": "Sub-accounts"
		},
		"assets": {
			"plot": {
				"title": "ALL ASSETS TRANSACTION TYPES LAST 7 DAYS",
				"type1": "Ask",
				"type2": "Bid",
				"type3": "Short",
				"type4": "Cover"
			},
			"market": {
				"title": "MARKET ISSUED ASSETS",
				"th1": "Asset Symbol",
				"th2": "Bid depth",
				"th3": "Ask depth",
				"th4": "Valid Feeds",
				"th5": "Median Feed Price",
				"th6": "Share Supply",
				"th7": "24h Volume",
				"th8": "Market Cap",
				"yield": "Yield"
			},
			"user": {
				"show": "Show user issued assets",
				"title": "USER ISSUED ASSETS",
				"th1": "Asset ID",
				"th3": "24hr Average Price",
				"th4": "Current Supply",
				"th5": "Maximum Supply",
				"th6": "Initialized"
			}
		},
		"asset": {
			"orderbook": "ORDER BOOK",
			"bids": "BIDS",
			"asks": "ASKS",
			"shorts": "SHORTS",
			"priceH": "PRICE HISTORY",
			"alert1": "Market inactive: Insufficient number of active feeds",
			"alert2": "Market inactive: Insufficient market depth",
			"alert3": "The orderbook is empty",
			"collateral": "Collateral",
			"supply": "SUPPLY",
			"supplyAnd": "AND COLLATERAL (DVS) HISTORY",
			"sell": "Sell",
			"buy": "Buy",
			"short": "Short",
			"chartSupply": "Supply",
			"ohlc": "Price: OHLC",
			"external": "External Coinmarketcap price",
			"volume": "Volume",
			"marketAsset": "Market issued asset",
			"range": "Today's range",
			"assetInfo": {
				"title": "ASSET INFO",
				"base": "Base Asset",
				"name": "Full Name",
				"precision": "Precision",
				"regdate": "Registration Date"
			},
			"market": {
				"title": "MARKET INFO",
				"reserve": "Reserve Fund"
			},
			"feeds": {
				"avg": "Average Feed Price",
				"med": "Median Feed Price",
				"null": "Not enough feeds in the last 24hrs",
				"last": "Last update (UTC)"
			},
			"covers": {
				"title": "MARGIN CALL ORDERS",
				"price": "Call price",
				"owed": "Owed",
				"expiration": "Expiration date"
			},
			"order_history": {
				"title": "ORDER HISTORY",
				"paid": "Paid",
				"received": "Received"
			}
		},
		"charts": {
			"titles": {
				"new": "NEW ACCOUNTS",
				"total": "TOTAL NUMBER OF ACCOUNTS",
				"assetTrx": "ALL ASSET TRANSACTION TYPES",
				"btsTrx": "DVS TRANSACTION TYPES",
				"trxCount": "DVS NUMBER OF TRANSACTIONS",
				"volume": "DVS TRANSACTION VOLUME",
				"btcPrice": "DVS/BTC PRICE HISTORY",
				"usdPrice": "PRICE HISTORY",
				"prices": "PRICE CHARTS",
				"trx": "TRANSACTION CHARTS",
				"accounts": "ACCOUNTS CHARTS",
				"supply": "SUPPLY CHARTS",
				"feeds": "FEEDS CHARTS"
			},
			"value": "Value",
			"reg": "Account registration",
			"transfer": "Transfer",
			"feed": "Delegate feed update",
			"update": "Account update",
			"new": "New accounts",
			"ma15": "15-day Moving Average",
			"feeds": {
				"title": "FEED TRACKING",
				"latest": "Latest price",
				"vwap": "24hr weighted average price",
				"deviation": "Deviation from feed"
			}
		},
		"supply": {
			"title1": "INFO",
			"title2": "ANNUALIZED DAILY INFLATION",
			"title3": "TOTAL SUPPLY OF DVS",
			"title4": "DVS FEES PAID OVER TIME",
			"height": "Height of BTSX => DVS hardfork block",
			"supply": "Supply at fork",
			"change": "Change in supply since the hardfork",
			"changeY": "BTS annualized inflation",
			"supplyY":"DVS supply",
			"feesY": "DVS fees"
		},
		"genesis": {
			"stats": "STATISTICS",
			"biggest": "ADDRESS COUNT BY BALANCE",
			"total": "Total number of addresses",
			"supply": "Total initial supply",
			"sharedrop": "AGS+PTS+DNS+VOTE sharedrop amount",
			"market": "Number of market assets",
			"whale": "Largest balance",
			"higher": "Addresses with balance higher than",
			"percent": "PERCENT OF TOTAL SUPPLY BY NUMBER OF ADDRESSES",
			"top": "TOP",
			"sharedropTitle": "SHAREDROP",
			"addresses": "ADDRESSES",
			"address": "Address",
			"balance": "Balance",
			"percentOf": "% of total",
			"cumul": "Cumulative % of total",
			"x": "Number of accounts",
			"y": "% of total supply",
			"tooltip": "Percentage of total supply",
			"piechart": {
				"title": "PIECES OF THE PIE"
			}
		}
	}
});