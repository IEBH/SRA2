app.factory('ReferenceTags', function($resource) {
	return $resource('/api/referenceTags/:id', {}, {
		get: {url: '/api/referenceTags/:id', 'method': 'GET'},
		getCached: {url: '/api/referenceTags/:id', 'method': 'GET', cache: true},
		queryCached: {url: '/api/referenceTags', 'method': 'GET', isArray: true, cache: true},
		create: {url: '/api/referenceTags', 'method': 'POST'},
	});
});
