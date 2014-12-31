angular.module('app')

.controller('genesisBTSCtrl', ['$scope', '$rootScope', 'Translate', 'Charts', 'api',
	function($scope, $rootScope, Translate, Charts, api) {

		$scope.balanceLimit = 100;

		var Size = {
			height: 250
		};
		var scrollBar = {
			enabled: false
		};

		var series = [];
		series.push(new Charts.serie({
			name: '',
			tooltip: {
				valueDecimals: 2,
				valueSuffix: '%'
			}
		}));

		$scope.genesisPercentChart = new Charts.chartConfig({
			type: 'line',
			useHighStocks: false,
			series: series,
			size: Size,
			yAxis: {
				min: 0,
				title: {
					text: ''
				},
				labels: {
					format: '{value}'
				},
				allowDecimals: false
			}
		});

		api.getGenesis().success(function(genesis) {
			$scope.genesis = genesis[0];
			$scope.genesisPercentChart.series[0].data = $scope.genesis.cumulativePercentPlot;
		});

		function getTranslations() {
			Translate.genesis().then(function(result) {
				$scope.genesisPercentChart.series[0].name = result.tooltip;
				$scope.genesisPercentChart.xAxis.title.text = result.xlabel;
				$scope.genesisPercentChart.yAxis.title.text = result.ylabel;
			});
		}

		getTranslations();

		$rootScope.$on('$translateLoadingSuccess', function() {
			getTranslations();
		});

		$rootScope.$on('languageChange', function() {
			getTranslations();
		});

	}
]);