app.factory('Tasks', function($resource) {
	return $resource('/api/tasks/:id', {}, {
		fromLibrary: {url: '/api/tasks/library/:id/:worker'}
	});
});
