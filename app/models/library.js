app.factory('Library', function($resource) {
	return $resource('/api/libraries/:id', {}, {
	});
});
