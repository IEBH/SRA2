app.factory('ReferenceTags', function($resource) {
	return $resource('/api/referenceTags/:id', {}, {
		create: {url: '/api/referenceTags', 'method': 'POST'}
	});
});
