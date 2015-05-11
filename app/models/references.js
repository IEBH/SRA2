app.factory('References', function($resource) {
	return $resource('/api/references/:id', {}, {
	});
});
