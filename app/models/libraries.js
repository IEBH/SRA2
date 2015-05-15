app.factory('Libraries', function($resource) {
	return $resource('/api/libraries/:id', {}, {
		formats: {url: '/api/libraries/formats', isArray: true}
	});
});
