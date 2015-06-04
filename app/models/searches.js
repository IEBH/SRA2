app.factory('Searches', function($resource) {
	return $resource('/api/search/:method', {}, {
	});
});
