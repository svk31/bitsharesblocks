angular.module('app')

.controller('supplyCtrl', ['$rootScope', '$scope', '$filter', '$translate', 'api', 'Charts', 'Translate', 'Home', 'appcst',
	function($rootScope, $scope, $filter, $translate, api, Charts, Translate, Home, appcst) {

		$scope.baseAsset = appcst.baseAsset;
		$scope.translateBase = {
			value: appcst.baseAsset
		};
		$scope.data = {
			'hardFork': 1,
			'supply': 2000000000.0
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
					}
				},
				allowDecimals: false
			}
		});


		var tooltip = {
			valueDecimals: 2,
			valueSuffix: ' ' + $scope.baseAsset
		};
		$scope.supplyChart = angular.copy($scope.inflationChart);
		$scope.supplyChart.series[0].tooltip = tooltip;
		$scope.supplyChart.yAxis.labels.formatter = function() {
			return $filter('number')(this.value, 0) + ' ' + $scope.baseAsset;
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
						return $filter('currency')(this.value, '', 0) + ' ' + $scope.baseAsset;
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

			$scope.currentInflation = derivativeArray[derivativeArray.length - 1][1];
			$scope.inflationChart.series[0].data = derivativeArray;
			$scope.supplyChart.series[0].data = supplyArray;

			// Future supply estimations
			var currentDate = new Date();
			var halvings = [];
			for (i = 1; i < 20; i++) {
				halvings.push(new Date(2014 + 4 * i, 10)); // Halvings occur every 4 years in november
			}

			function getMaxInflation(date) {
				var maxInflation = 50;
				for (i = 0; i < halvings.length; i++) {
					if (currentDate > halvings[i]) {
						maxInflation /= 2;
					} else {
						break;
					}
				}
				return maxInflation;
			}

			var finalSupply = $scope.data.currentSupply;
			var maxSupply = $scope.data.currentSupply;

			var maxInflation = getMaxInflation(currentDate);
			var inflation = result.currentPay; // Current average payrate for all delegates
			var inflationProportion = result.currentPay / maxInflation;

			var blocksPer15Days = 6 * 60 * 24 * 15;

			while (maxInflation * blocksPer15Days > 1000) {
				currentDate.setDate(currentDate.getDate() + 15);

				maxInflation = getMaxInflation(currentDate);
				inflation = inflationProportion * maxInflation;

				finalSupply += inflation * blocksPer15Days;
				maxSupply += maxInflation * blocksPer15Days;
			}

			$scope.finalSupply = finalSupply;
			$scope.maxSupply = maxSupply;
		});

		api.getFees().success(function(result) {
			$scope.feesChart.series[0].data = result.fees.sort();
		});

	}
]);