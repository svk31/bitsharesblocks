angular.module("app").factory('Charts', [function() {

	var defaultSize = {
		height: 300
	};

	var xAxisDefault = {
		title: {
			text: ''
		},
		allowDecimals: false
	};

	var yAxisDefault = {
		labels: {
			format: '{value}'
		}
	};

	var scrollbarDefault = {
		enabled: false
	};

	var defaultType = 'line';

	function serie(options) {
		var newSerie = {};
		if (options.type) {
			newSerie.type = options.type; // line, candlestick, column, area
		}

		newSerie.name = options.name;

		newSerie.tooltip = options.tooltip;

		if (options.id) {
			newSerie.id = options.id;
		}

		if (options.data) {
			newSerie.data = options.data;
		}

		if (options.stacking) {
			newSerie.stacking = options.stacking;
		}

		if (options.marker) {
			newSerie.marker = options.marker;
		}

		if (options.notVisible) {
			newSerie.visible = false;
		}

		if (options.yAxis) {
			newSerie.yAxis = options.yAxis;
		}

		return newSerie;
	}

	function serieTA(options) {
		var linkedTo = (options.linkedTo) ? options.linkedTo : 'primary';
		var type = (options.type) ? options.type : 'trendline';
		var algorithm = (options.algorithm) ? options.algorithm : 'SMA';
		var periods = (options.periods) ? options.periods : 15;

		var newSerie = {
			linkedTo: linkedTo,
			showInLegend: true,
			type: type,
			algorithm: algorithm,
			periods: periods,
			tooltip: {
				valueDecimals: 5,
				valueSuffix: ' USD/BTS'
			}
		};
		return newSerie;
	}

	function chartConfig(options) {
		var config = {};
		var size = (options.size) ? options.size : defaultSize;
		var type = (options.type) ? options.type : defaultType;
		var xAxis = (options.xAxis) ? options.xAxis : xAxisDefault;
		var yAxis = (options.yAxis) ? options.yAxis : yAxisDefault;
		var zoomType = (options.zoomType) ? options.zoomType : 'x';
		var scrollbar = (options.scrollbar) ? options.scrollbar : scrollbarDefault;
		var rangeSelector = true;

		var legend = {
			enabled: true,
			layout: 'horizontal',
			align: 'center',
			verticalAlign: 'bottom',
			borderWidth: 0
		};

		if (options.noLegend) {
			legend.enabled = false;
		}

		if (options.noRangeselector) {
			rangeSelector = false;
		}

		config.options = {
			chart: {
				type: options.type,
				series: {
					animation: false
				},
				zoomType: zoomType,
			},
			scrollbar: scrollbar,
			rangeSelector: rangeSelector,
			legend: legend
		};

		if (options.plotOptions) {
			config.options.plotOptions = options.plotOptions;
		}

		if (options.tooltip) {
			config.options.tooltip = options.tooltip;
		}

		config.series = [];
		if (options.series) {
			config.series = options.series;
		}

		config.title = {
			text: ''
		};

		config.useHighStocks = options.useHighStocks;

		config.size = size;

		config.xAxis = xAxis;

		config.yAxis = yAxis;

		return config;
	}

	return {
		chartConfig: chartConfig,
		serie: serie,
		serieTA: serieTA
	};


}]);