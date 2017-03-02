app.factory('Searches', function($resource) {
	return $resource('/api/search/:method', {}, {
		opentrials: {method: 'GET', url: '/api/search/opentrials', isArray: true},
	});
});
