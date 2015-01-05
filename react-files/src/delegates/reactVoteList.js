var VotesHeaderRow = React.createClass({
	render: function() {
		var props = this.props;
		var headers = this.props.headers;
		var sortIndex = this.props.sortIndex;
		var inverse = this.props.inverse;

		var clickHandler = function(ev) {
			props.onSortClick(					
				ev.target.cellIndex	
				);
		};

		return (
			<tr onClick={clickHandler}>
			<th className="bold sortable">{headers['blocks.blockNum']}</th>
			<th className="bold sortable">{headers['delegate.votes.net']}</th>
			</tr>
			);
	}
});

var VoteRow = React.createClass({
	render: function() {
		var vote =this.props.data;
		var tdLatency, tdActiveFeeds, tdUpdateFeeds, tdReliability;

		return (
			<tr>
			<td><a href={'blocks/block?id='+vote.block}>{vote.block}</a></td>
			<td>{vote.vote+' BTS'}</td>
			</tr>
			);
	}
});

var VotesTable = React.createClass({
	getInitialState: function() {
		return {
			sortIndex: 0,
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
	displayName: 'VotesTable',
	render: function() {
		var headers = this.props.headers;
		var filterFields = ['block','vote'];
		var inverse = this.state.inverse;
		
		if (headers && this.props.data) {			
			var data = JSON.parse(this.props.data);
			var sortIndex = this.state.sortIndex;
			var sortField = filterFields[sortIndex];
			var filterName = this.state.filterName;

			var bodyRows = data
			.sort(function(a,b) {
				if (sortField==='vote') {
					var atemp=parseInt(a[sortField].replace(/,/g,''),10);
					var btemp=parseInt(b[sortField].replace(/,/g,''),10);
					if (inverse===false) {
						if (atemp > btemp) {
							return 1;
						}
						if (atemp < btemp) {
							return -1;
						}
						return 0;	
					}
					else {
						if (atemp > btemp) {
							return -1;
						}
						if (atemp < btemp) {
							return 1;
						}
						return 0;	
					}
				}
				else {
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
				}


			})
			.map(function(vote) {
				return (
					<VoteRow key={vote.block} data={vote}/>
					);

			});

			var styleLeft = {
				'marginLeft':'0px',
				'marginRight':'0px'
			};

			return (
				<div>
				<table className="table table-condensed">
				<thead>
				<VotesHeaderRow onSortClick={this.handleSortClick} headers={headers} sortIndex={sortIndex} inverse={inverse}/>
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

app.value('VotesTable',VotesTable);
