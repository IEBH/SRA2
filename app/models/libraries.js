app.factory('Libraries', function($resource) {
	return $resource('/api/libraries/:id', {}, {
		formats: {url: '/api/libraries/formats', isArray: true},
		clear: {url: '/api/libraries/:id/clear'},
		request: {url: '/api/libraries/:id/request'}
	});
});
