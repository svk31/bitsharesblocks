angular.module("app").factory('Alerts', ['$alert', function($alert) {


	function maintenance() {
		return $alert({
			'title': 'Currently re-indexing transactions, some data may be incorrect, thank you for your understanding',
			'content': '',
			'container': '#alerts-container-indexing',
			'type': 'danger',
			'show': false,
			'duration': 0
		});
	}

	function hardFork() {

	}

	function upgrade() {
		return $alert({
			'title': 'An upgrade to v0.4.26 for delegates is required asap, see https://bitsharestalk.org/index.php?topic=7067.msg161432#msg161432',
			'content': '',
			'container': '#alerts-container-indexing',
			'type': 'danger',
			'show': false,
			'duration': 0
		});
	}

	function notFound() {
		return $alert({
			'title': 'Not found or not valid search term',
			'content': '',
			'container': '#alerts-container',
			'type': 'danger',
			'show': false,
			'duration': 5
		});
	}

	return {
		hardFork: hardFork,
		maintenance: maintenance,
		upgrade: upgrade,
		notFound: notFound
	};


}]);