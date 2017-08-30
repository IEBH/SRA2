app.factory('Libraries', function($resource) {
	return $resource('/api/libraries/:id', {}, {
		create: {url: '/api/libraries', method: 'POST'},
		formats: {url: '/api/libraries/formats', isArray: true},
		clear: {url: '/api/libraries/:id/clear'},
		share: {url: '/api/libraries/:id/share', method: 'POST'},
		compare: {url: '/api/libraries/:id/compare', method: 'POST'},
	});
});
