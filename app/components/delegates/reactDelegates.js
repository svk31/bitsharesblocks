
var InputBox = React.createClass({displayName: 'InputBox',
	changeHandler: function(input) {
		this.props.onFilterChange(					
			this.refs.filterTextInput.getDOMNode().value
			);
	},
	handleSubmit: function(event) {
		event.preventDefault();
	},
	render: function() {
		return (
			React.createElement("form", {onSubmit: this.handleSubmit}, 
			React.createElement("input", {ref: "filterTextInput", value: this.props.filterName, onChange: this.changeHandler, type: "text", className: "form-control", placeholder: this.props.placeHolder})
			)
			);
	}
});

var HeaderRow = React.createClass({displayName: 'HeaderRow',
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
			if (ev.target.cellIndex!==3 && ev.target.cellIndex!==4) {
				props.onSortClick(					
					sortIndex
					);
			}
		};

		var floatLeft = {float:'left', 'z-index': -1};
		var sortGlyph = (inverse) ? React.createElement("span", {style: floatLeft, className: "glyphicon glyphicon-sort-by-attributes-alt"}) : React.createElement("span", {style: floatLeft, className: "glyphicon glyphicon-sort-by-attributes"});
		
		return (
			React.createElement("tr", {onClick: clickHandler}, 
			React.createElement("th", {className: "bold sortable"}, sortIndex === 0 ? sortGlyph: null, " ", headers['delegates.rank']), 
			React.createElement("th", {className: "bold sortable"}, sortIndex === 1 ? sortGlyph: null, " ", headers['delegates.change24']), 
			React.createElement("th", {className: "bold sortable hidden-xs"}, sortIndex === 2 ? sortGlyph: null, " ", headers['delegates.change7']), 
			React.createElement("th", {className: "bold sortable"}, sortIndex === 3 ? sortGlyph: null, " ", headers['accounts.name']), 
			React.createElement("th", {className: "bold sortable"}, sortIndex === 4 ? sortGlyph: null, " ", headers['delegates.votes']), 
			React.createElement("th", {className: "bold sortable hidden-xs"}, sortIndex === 5 ? sortGlyph: null, " ", headers['delegates.produced']), 
			React.createElement("th", {className: "bold sortable hidden-xs"}, sortIndex === 6 ? sortGlyph: null, " ", headers['delegates.missed']), 
			React.createElement("th", {className: "bold sortable"}, sortIndex === 7 ? sortGlyph: null, " ", headers['delegates.rate']), 
			React.createElement("th", {className: "bold sortable"}, sortIndex === 8 ? sortGlyph: null, " ", headers['delegates.latency']), 
			React.createElement("th", {className: "bold sortable"}, sortIndex === 9 ? sortGlyph: null, " ", headers['delegates.feeds']), 
			React.createElement("th", {className: "bold sortable hidden-xs"}, sortIndex === 10 ? sortGlyph: null, " ", headers['delegates.feedFreq']), 
			React.createElement("th", {className: "bold sortable"}, sortIndex === 11 ? sortGlyph: null, " ", headers['delegates.rel']), 
			React.createElement("th", {className: "bold sortable"}, sortIndex === 12 ? sortGlyph: null, " ", headers['delegates.version'])
			)
			);
}
});

var DelegateRow = React.createClass({displayName: 'DelegateRow',
	getInitialState: function() {
		return {hover:false};
	},
	handleMouseEnter: function() {
		this.setState({hover: true});
	},

	handleMouseLeave: function() {
		this.setState({hover: false});
	},
	render: function() {
		var headers = this.props.headers;
		var delegate =this.props.data;
		var no_version = headers['delegates.no_version'];
		var votesFor = headers['delegate.rank.votes'];
		var tdLatency, tdActiveFeeds, tdUpdateFeeds, tdReliability, tdVersion;

		if (delegate.delegate_info.blocks_produced < 1 || delegate.avgLatency === 'n/a') {
			tdLatency = React.createElement("td", {className: "success"}, "n/a");
		}
		else if (delegate.avgLatency >=-1.5 && delegate.avgLatency <=1.5) {
			tdLatency = React.createElement("td", {className: "success"}, (Math.round(delegate.avgLatency*100) / 100)+'s');
		}
		else if ((delegate.avgLatency > 1.5 && delegate.avgLatency <=3) || (delegate.avgLatency < -1.5 && delegate.avgLatency > - 3)) {
			tdLatency = React.createElement("td", {className: "warning"}, (Math.round(delegate.avgLatency*100) / 100)+'s');
		}
		else if (delegate.avgLatency > 3 || delegate.avgLatency < -3 ) {
			tdLatency = React.createElement("td", {className: "danger"}, (Math.round(delegate.avgLatency*100) / 100)+'s');
		}

		if (delegate.activeFeeds >=5) {
			tdActiveFeeds = React.createElement("td", {className: "success"}, delegate.activeFeeds);	
		}
		else if (delegate.activeFeeds <=4 && delegate.activeFeeds>=1) {
			tdActiveFeeds = React.createElement("td", {className: "warning"}, delegate.activeFeeds);
		}
		else {
			tdActiveFeeds = React.createElement("td", {className: "danger"}, delegate.activeFeeds);
		}

		if (delegate.updateFreq >=25) {
			tdUpdateFeeds = React.createElement("td", {className: "success hidden-xs"}, delegate.updateFreq);
		}
		else if (delegate.updateFreq<25 && delegate.updateFreq>=12) {
			tdUpdateFeeds = React.createElement("td", {className: "warning hidden-xs"}, delegate.updateFreq);
		}
		else {
			tdUpdateFeeds = React.createElement("td", {className: "danger hidden-xs"}, delegate.updateFreq);
		}

		if (delegate.reliability >=98) {
			tdReliability =	React.createElement("td", {className: "success"}, Math.round(delegate.reliability*100)/100+'%');
		}
		else if (delegate.reliability<98 && delegate.reliability>=95) {
			tdReliability =	React.createElement("td", {className: "info"}, Math.round(delegate.reliability*100)/100+'%');
		}
		else if (delegate.reliability<95 && delegate.reliability>=90) {
			tdReliability =	React.createElement("td", {className: "warning"}, Math.round(delegate.reliability*100)/100+'%');
		}
		else if (delegate.delegate_info.blocks_produced > 0) {
			tdReliability =	React.createElement("td", {className: "danger"}, Math.round(delegate.reliability*100)/100+'%');
		}
		else {
			tdReliability =	React.createElement("td", {className: "success"}, "n/a");
		}

		if (delegate.version === 1) {
			tdVersion = React.createElement("td", {className: "success"}, delegate.public_data.version);
		}
		else if (delegate.version === 2) {
			tdVersion = React.createElement("td", {className: "warning"}, delegate.public_data.version);
		}
		else if (delegate.version === 999) {
			tdVersion = React.createElement("td", {className: "danger"}, no_version);
		}
		else {
			tdVersion = React.createElement("td", {className: "danger"}, delegate.public_data.version);
		}

		return (
			React.createElement("tr", null, 
			React.createElement("td", null, delegate.rank), 
			React.createElement("td", null, delegate.dayChange), 
			React.createElement("td", {className: "hidden-xs"}, delegate.weekChange), 
			React.createElement("td", {className: delegate.rank <=101 ? 'bold':''}, React.createElement("a", {href: 'delegate/info?name='+delegate.name}, delegate.name)), 
			React.createElement("td", null, 
			React.createElement(Tooltip, {className: "tooltipContainer", 
			horizontalPosition: "right", 
			horizontalAlign: "left", 
			verticalPosition: "bottom", 
			arrowSize: 10, 
			borderColor: "#ccc", 
			show: this.state.hover}, 
			React.createElement("div", {
			onMouseEnter: this.handleMouseEnter, 
			onMouseLeave: this.handleMouseLeave}, 
			delegate.delegate_info.votes_for_percent+'%'), 
			
			React.createElement("p", {style: {
				margin: 0,
				padding: '5px 5px 0px 5px',
				backgroundColor: "white",
				fontSize:'0.90em'
			}}, votesFor, ":"), 
			React.createElement("p", {style: {
				margin: 0,
				padding: '0px 5px 5px 5px',
				backgroundColor: "white",
				fontWeight:'bold'
			}}, delegate.votesFor, " ",  headers.baseAsset)
			)), 
			React.createElement("td", {className: "hidden-xs"}, delegate.blocksProduced), 
			React.createElement("td", {className: "hidden-xs"}, delegate.blocksMissed), 
			React.createElement("td", null, delegate.delegate_info.pay_rate+'%'), 
			tdLatency, 
			tdActiveFeeds, 
			tdUpdateFeeds, 
			tdReliability, 
			tdVersion
			)
			);
}
});

var DelegatesTable = React.createClass({
	getInitialState: function() {
		return {
			sortIndex: 0,
			inverse: false,
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
	displayName: 'DelegatesTable',
	render: function() {
		var headers = this.props.headers;
		var filterFields = ['rank','dayChange','weekChange','name','votes_for_percent','blocks_produced',
		'blocks_missed','pay_rate','avgLatency','activeFeeds','updateFreq','reliability','versionIncrement'];
		var inverse = this.state.inverse;
		if (headers && this.props.data) {			
			// var data = this.props.data;
			var data = JSON.parse(this.props.data);
			var sortIndex = this.state.sortIndex;
			var sortField = filterFields[sortIndex];
			var filterName = this.state.filterName;

			var bodyRows = data
			.filter(function(delegate) {
				return (delegate.name.toLowerCase().indexOf(filterName.toLowerCase()) > -1);
			})
			.sort(function(a,b) {
				if (sortIndex > 3 && sortIndex < 8) {
					a = a['delegate_info'];
					b = b['delegate_info'];
				}
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
			.map(function(delegate) {

				return (
					React.createElement(DelegateRow, {key: delegate.rank, data: delegate, headers: headers})
					);

			});

			var styleLeft = {
				'marginLeft':'0px',
				'marginRight':'0px',
				'float':'none'
			};

			return (
				React.createElement("div", null, 
				React.createElement("div", {style: styleLeft, className: "checkbox container col-md-5 col-xs-12"}, 
				React.createElement(InputBox, {filterName: filterName, onFilterChange: this.onFilterChange, placeHolder: headers['delegates.filter']})
				), 
				React.createElement("table", {className: "table table-condensed table-hover table-bordered"}, 
				React.createElement("thead", null, 
				React.createElement(HeaderRow, {onSortClick: this.handleSortClick, headers: headers, sortIndex: sortIndex, inverse: inverse})
				), 
				React.createElement("tbody", null, 
				bodyRows
				)
				)
				)
				);
		}
		else {
			return React.createElement("div", null);
		}
	}
});

app.value('DelegatesTable',DelegatesTable);