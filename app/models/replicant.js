app.factory('Replicant', function($resource) {
	return $resource('/api/replicant/:id', {}, {
		comparisons: {url: '/api/replicant/:id/comparisons', isArray: true},
		grammars: {url: '/api/replicant/grammars', isArray: true},
	});
});
