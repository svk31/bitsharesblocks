var UserAssetHeaderRow = React.createClass({
	render: function() {
		var props = this.props;
		var headers = this.props.headers;
		var sortIndex = this.props.sortIndex;
		var inverse = this.props.inverse;

		var headerLength=0;
		for (var key in headers) {
			if (headers.hasOwnProperty(key)) {
				headerLength++;
			}
		}

		var clickHandler = function(ev) {
			var sortIndex = ev.target.cellIndex;
			if (!sortIndex) {
				var letters = ev.target.dataset.reactid.match(/[a-z]+/g);
				var subIndices = ev.target.dataset.reactid.match(/\d+/g);
				
				sortIndex = parseInt(subIndices[4],10);

				if (letters) {
					sortIndex = letters[0].charCodeAt(0) - 87;
				}
			}
			if (ev.target.cellIndex!==5) {
				props.onSortClick(					
					sortIndex
					);
			}
		};

		var floatLeft = {float:'left', 'z-index': -1};
		var sortGlyph = (inverse) ? <span style={floatLeft} className="glyphicon glyphicon-sort-by-attributes-alt"></span> : <span style={floatLeft} className="glyphicon glyphicon-sort-by-attributes"></span>;
		
		return (
			<tr onClick={clickHandler}>
			<th className="bold sortable">{sortIndex === 0 ? sortGlyph: null} {headers['assets.user.th1']}</th>
			<th className="bold sortable">{sortIndex === 1 ? sortGlyph: null} {headers['assets.market.th1']}</th>
			<th className="bold sortable">{sortIndex === 2 ? sortGlyph: null} {headers['assets.market.th7']}</th>
			<th className="bold sortable">{sortIndex === 3 ? sortGlyph: null} {headers['assets.user.th3']}</th>
			<th className="bold sortable">{sortIndex === 4 ? sortGlyph: null} {headers['charts.feeds.latest']}</th>
			<th >{headers['assets.user.th4']}</th>
			<th className="bold sortable">{sortIndex === 6 ? sortGlyph: null}{headers['assets.market.th8']}</th>
			<th className="bold sortable">{sortIndex === 7 ? sortGlyph: null} {headers['assets.user.th6']}</th>
			</tr>
			);
	}
});

var UserAssetRow = React.createClass({
	render: function() {
		var asset =this.props.data;
		var tdInit;	

		if (asset.initialized) {
			tdInit = <td className="success">Yes</td>;
		}
		else {
			tdInit = <td>No</td>;
		}			

		return (
			<tr>
			<td>{asset._id}</td>
			<td><a href={'asset/orderbook?asset='+asset.symbol}>{asset.symbol}</a></td>
			<td>{asset.dailyVolumeText}</td>
			<td>{ asset.vwapText }/{asset.symbol} </td>
			<td>{ asset.lastPriceText }/{asset.symbol} </td>
			<td>{ asset.current_share_supply }</td>
			<td>{ asset.capText }</td>
			{tdInit}
			</tr>
			);
	}
});

var UserAssetsTable = React.createClass({
	getInitialState: function() {
		return {
			sortIndex: 6,
			inverse: true,
			filterName: ''
		};
	},
	handleSortClick: function(index) {
		this.setState({
			sortIndex: index,
			inverse: !this.state.inverse
		});
	},
	onFilterChange: function(filterName) {
		this.setState({
			filterName: filterName
		});
	},
	displayName: 'UserAssetsTable',
	render: function() {
		var headers = this.props.headers;
		var filterFields = ['_id','symbol','dailyVolume', 'vwap', 'lastPrice','','cap', 'initialized'];
		var inverse = this.state.inverse;
		if (headers && this.props.data) {			
			var data = JSON.parse(this.props.data);
			var sortIndex = this.state.sortIndex;
			var sortField = filterFields[sortIndex];
			var filterName = this.state.filterName;

			var bodyRows = data
			.filter(function(asset) {
				return (asset.symbol.toLowerCase().indexOf(filterName.toLowerCase()) > -1 && asset._id!==0);
			})
			.sort(function(a,b) {
				if (inverse===false) {
					if (a[sortField] > b[sortField]) {
						return 1;
					} else if (a[sortField] < b[sortField]) {
						return -1;
					} else {
						if (a.initialized > b.initialized) {
							return 1;
						} else if (a.initialized < b.initialized) {
							return -1;
						}
					}					
				} else {
					if (a[sortField] > b[sortField]) {
						return -1;
					} else if (a[sortField] < b[sortField]) {
						return 1;
					} else {
						if (b.initialized > a.initialized) {
							return 1;
						} else if (b.initialized < a.initialized) {
							return -1;
						}
					}	
				}
				if (a.symbol > b.symbol) {
					return 1;
				} else if (a.symbol < b.symbol) {
					return -1;
				} else {
					return 0;
				}



			})
			.map(function(asset) {
				return (
					<UserAssetRow key={asset._id} data={asset}/>
					);

			});

			var styleLeft = {
				'marginLeft':'0px',
				'marginRight':'0px',
				'float':'none'
			};

			return (
				<div>
				<div style={styleLeft} className="checkbox container col-md-5 col-xs-12">
				<InputBox filterName={filterName} onFilterChange={this.onFilterChange} placeHolder={headers['delegates.filter']}/>
				</div>
				<table className="table table-condensed table-hover table-bordered">
				<thead>
				<UserAssetHeaderRow onSortClick={this.handleSortClick} headers={headers} sortIndex={sortIndex} inverse={inverse}/>
				</thead>
				<tbody>
				{bodyRows}
				</tbody>
				</table>
				</div>
				);
		}
		else {
			return <div></div>;
		}
	}
});

app.value('UserAssetsTable',UserAssetsTable);