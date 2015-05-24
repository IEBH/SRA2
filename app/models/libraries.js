app.factory('Libraries', function($resource) {
	return $resource('/api/libraries/:id', {}, {
		formats: {url: '/api/libraries/formats', isArray: true},
		clear: {url: '/api/libraries/:id/clear'},
		operationQueue: {url: '/api/libraries/:id/process/:operation'},
		operation: {url: '/api/operation/:id'},
	});
});
