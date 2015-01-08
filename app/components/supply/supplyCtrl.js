angular.module('app')

.controller('supplyCtrl', ['$scope','$filter','$translate','api',
	function ($scope,$filter,$translate,api) {


		$scope.data = {'hardFork':1,'supply':2457464814.86};

		var Size= {
			height: 300
		};

		$scope.inflationChart = {
			options: {
				chart: {
					type: 'line',
					zoomType: 'x'
				},
				legend: {enabled:false}
			},
			series: [{
				name: '',
				marker: {
					enabled: false
				},
				tooltip: {
					valueDecimals: 2,
					valueSuffix: ' DVS'}
				}],
				title: {
					text: ''
				},

				useHighStocks: false,
				size: Size,
				loading: false,

				xAxis: {
					type: 'datetime',
					title: {text: ''},
					allowDecimals: false
				},
				yAxis: {
					title: {text: ''},
					labels: {
						formatter: function () {
							return $filter('number')(this.value, 0) + ' DVS';
						},

					},
					allowDecimals: false
				},
			};

			$scope.showMore = function() {
				if ($scope.balanceLimit < 200) {
					$scope.balanceLimit += 20;
				}
				else {
					$scope.balanceLimit = 20;
				}
			};

			$scope.supplyChart = angular.copy($scope.inflationChart);

			$scope.feesChart = {
				options: {
					chart: {
						type: 'column',
						zoomType: 'x'
					},
					legend: {enabled:false},
					scrollbar: {
						enabled: false
					},
				},
				series: [{
					name: '',
					marker: {
						enabled: false
					},
					tooltip: {
						valueDecimals: 2,
						valueSuffix: ' DVS'}
					}],
					title: {
						text: ''
					},

					useHighStocks: true,
					size: Size,
					loading: false,

					xAxis: {
						type: 'datetime',
						title: {text: ''},
						allowDecimals: false
					},
					yAxis: {
						title: {text: ''},
						type: 'logarithmic',
						labels: {
							align:'left',
							formatter: function () {
								return $filter('currency')(this.value, '', 0) + ' DVS';
							}
						},
						allowDecimals: false
					},
				};

				$translate(['supply.changeY','supply.supplyY','supply.feesY']).then(function(y) {
					$scope.inflationChart.series[0].name = y["supply.changeY"];
					$scope.inflationChart.yAxis.title.text = y["supply.changeY"];

					$scope.supplyChart.series[0].name = y["supply.supplyY"];
					$scope.supplyChart.yAxis.title.text = y["supply.supplyY"];

					$scope.feesChart.series[0].name = y["supply.feesY"];
					$scope.feesChart.yAxis.title.text = y["supply.feesY"];
				});


				$scope.showMore = function() {
					if ($scope.balanceLimit < 200) {
						$scope.balanceLimit += 20;
					}
					else {
						$scope.balanceLimit = 20;
					}
				};

				api.getInflation().success(function(result) {
					$scope.data.currentSupply = result.supply[result.supply.length-1][1];
					$scope.data.deltaSupply = $scope.data.currentSupply - $scope.data.supply;
					$scope.inflationChart.series[0].data = result.inflation;

					$scope.supplyChart.series[0].data = result.supply;
				});

				api.getFees().success(function(result) {
					$scope.feesChart.series[0].data = result.fees.sort();

				});

			}]);