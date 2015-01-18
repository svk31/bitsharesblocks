angular.module('app')

.controller('supplyCtrl', ['$rootScope', '$scope', '$filter', '$translate', 'api', 'Charts', 'Translate',
	function($rootScope, $scope, $filter, $translate, api, Charts, Translate) {


		$scope.data = {
			'hardFork': 991700,
			'supply': 2498764341.60685
		};

		var Size = {
			height: 300
		};

		var xAxis = {
			type: 'datetime',
			title: {
				text: ''
			},
			allowDecimals: false
		};

		$scope.inflationChart = new Charts.chartConfig({
			useHighStocks: false,
			series: [new Charts.serie({
				tooltip: {
					valueDecimals: 2,
					valueSuffix: '%'
				},
				marker: {
					enabled: false
				}
			})],
			size: Size,
			noLegend: true,
			xAxis: xAxis,
			yAxis: {
				title: {
					text: ''
				},
				labels: {
					formatter: function() {
						return $filter('number')(this.value, 0) + '%';
					},
				},
				allowDecimals: false
			}
		});


		var tooltip = {
			valueDecimals: 2,
			valueSuffix: ' BTS'
		};
		$scope.supplyChart = angular.copy($scope.inflationChart);
		$scope.supplyChart.series[0].tooltip = tooltip;
		$scope.supplyChart.yAxis.labels.formatter = function() {
			return $filter('number')(this.value, 0) + ' BTS';
		};

		$scope.feesChart = new Charts.chartConfig({
			type: 'column',
			useHighStocks: true,
			series: [new Charts.serie({
				tooltip: tooltip
			})],
			size: Size,
			noLegend: true,
			xAxis: xAxis,
			yAxis: {
				title: {
					text: ''
				},
				type: 'logarithmic',
				labels: {
					align: 'left',
					formatter: function() {
						return $filter('currency')(this.value, '', 0) + ' BTS';
					}
				},
				allowDecimals: false
			}
		});

		function getTranslations() {
			Translate.supply().then(function(result) {
				$scope.inflationChart.series[0].name = result.inflationY;
				$scope.inflationChart.yAxis.title.text = result.inflationY;

				$scope.supplyChart.series[0].name = result.supplyY;
				$scope.supplyChart.yAxis.title.text = result.supplyY;

				$scope.feesChart.series[0].name = result.feesY;
				$scope.feesChart.yAxis.title.text = result.feesY;
			});
		}

		getTranslations();

		$rootScope.$on('$translateLoadingSuccess', function() {
			getTranslations();
		});

		$rootScope.$on('languageChange', function() {
			getTranslations();
		});

		api.getInflation().success(function(result) {
			$scope.data.currentSupply = result.supply[result.supply.length - 1][1];
			$scope.data.deltaSupply = $scope.data.currentSupply - $scope.data.supply;
			$scope.data.percentChange = 100 * $scope.data.deltaSupply / $scope.data.supply;

			var derivativeArray = [],
				supplyArray = [];
			var step = 5,
				der, dayCounter = 1,
				previous = [0, 0];

			// Remove some intermediate points
			var start = result.supply[0][0];
			for (var i = 1; i < result.supply.length; i++) {
				if ((result.supply[i][0] - start) / (1 * 86400000) > dayCounter) {
					der = 1000 * (result.supply[i][1] - result.supply[previous[0]][1]) / (result.supply[i][0] - result.supply[previous[0]][0]);
					derivativeArray.push([result.supply[i][0], 100 * (der / result.supply[i][1]) * (365 * 24 * 60 * 60)]);
					dayCounter++;
					previous[0] = i;
				}

				if (result.supply[i][1] - result.supply[i - 1][1] > 10000 || (i - previous[1] > 10)) {
					supplyArray.push(result.supply[i]);
					previous[1] = i;
				}
			}

			$scope.inflationChart.series[0].data = derivativeArray;
			$scope.supplyChart.series[0].data = supplyArray;
		});

		api.getFees().success(function(result) {
			$scope.feesChart.series[0].data = result.fees.sort();
		});

	}
]);