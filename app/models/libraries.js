app.factory('Libraries', function($resource) {
	return $resource('/api/libraries/:id', {}, {
	});
});
