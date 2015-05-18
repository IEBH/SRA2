app.factory('References', function($resource) {
	return $resource('/api/references/:id', {}, {
		count: {url: '/api/references/count', method: 'GET'}
	});
});
