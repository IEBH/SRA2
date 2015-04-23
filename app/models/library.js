app.factory('Library', function($resource) {
	return $resource('/libraries/:id', {}, {
	});
});
