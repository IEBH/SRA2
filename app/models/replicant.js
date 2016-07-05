app.factory('Replicant', function($resource) {
	return $resource('/api/replicant/:id', {}, {
		comparisons: {url: '/api/replicant/:id/comparisons', isArray: true},
		generate: {url: '/api/replicant/:id/generate'},
		grammars: {url: '/api/replicant/grammars', isArray: true},
	});
});
