app.factory('Assets', function($resource) {
	return $resource('/api/assets/:id', {}, {
		mesh: {url: '/api/assets/mesh', isArray: true},
		refTypes: {url: '/api/assets/refTypes', isArray: true},
	});
});
