angular.module("app").factory('Alerts', ['$alert', function($alert) {


	function maintenance() {
		return $alert({
			'title': 'Currently undergoing upgrade maintenance, normal service will resume shortly',
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
			'title': 'Currently undergoing upgrade maintenance, normal service will resume shortly',
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