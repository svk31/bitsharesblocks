var MarketAssetHeaderRow = React.createClass({
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
			console.log(ev.target.cellIndex);
			if (ev.target.cellIndex!==3 && ev.target.cellIndex!==4) {
				props.onSortClick(					
					ev.target.cellIndex	
					);
			}
		};

		return (
			<tr onClick={clickHandler}>
			<th className="bold sortable">{headers['assets.user.th1']}</th>
			<th className="bold sortable">{headers['assets.market.th1']}</th>
			<th className="bold sortable">{headers['assets.market.th7']}</th>
			<th >{headers['assets.user.th4']}</th>
			<th >{headers['assets.user.th5']}</th>
			<th className="bold sortable">{headers['assets.user.th6']}</th>
			</tr>
			);
	}
});

var MarketAssetRow = React.createClass({
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
			<td><a href={'assets/asset?id='+asset.symbol}>{asset.symbol}</a></td>
			<td>{asset.dailyVolume}</td>
			<td>{asset.current_share_supply }</td>
			<td>{asset.maximum_share_supply}</td>
			{tdInit}
			</tr>
			);
	}
});

var MarketAssetsTable = React.createClass({
	getInitialState: function() {
		return {
			sortIndex: 5,
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
	displayName: 'MarketAssetsTable',
	render: function() {
		var headers = this.props.headers;
		var filterFields = ['_id','symbol','dailyVolume','','','initialized'];
		var inverse = this.state.inverse;
		if (headers && this.props.data) {			
			// var data = this.props.data;
			var data = JSON.parse(this.props.data);
			// console.log(data);
			var sortIndex = this.state.sortIndex;
			var sortField = filterFields[sortIndex];
			var filterName = this.state.filterName;

			var bodyRows = data
			.filter(function(asset) {
				return (asset.symbol.toLowerCase().indexOf(filterName) > -1 && asset._id!==0);
			})
			.sort(function(a,b) {
				if (inverse===false) {
					if (a[sortField] > b[sortField]) {
						return 1;
					}
					if (a[sortField] < b[sortField]) {
						return -1;
					}
					return 0;	
				}
				else {
					if (a[sortField] > b[sortField]) {
						return -1;
					}
					if (a[sortField] < b[sortField]) {
						return 1;
					}
					return 0;	
				}

			})
			.map(function(asset) {
				return (
					<MarketAssetRow key={asset._id} data={asset}/>
					);

			});

			var styleLeft = {
				'marginLeft':'0px',
				'marginRight':'0px'
			};

			return (
				<div>
				<div style={styleLeft} className="checkbox container col-md-5 col-xs-12">
				<InputBox filterName={filterName} onFilterChange={this.onFilterChange} placeHolder={headers['delegates.filter']}/>
				</div>
				<table className="table table-condensed table-hover table-bordered">
				<thead>
				<MarketAssetHeaderRow onSortClick={this.handleSortClick} headers={headers} sortIndex={sortIndex} inverse={inverse}/>
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

app.value('MarketAssetsTable',MarketAssetsTable);