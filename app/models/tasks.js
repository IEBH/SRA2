app.factory('Tasks', function($resource) {
	return $resource('/api/tasks/:id', {}, {
		fromLibrary: {url: '/api/tasks/library/:id/:worker', method: 'POST'},
		pendingByLibrary: {url: '/api/tasks/library/:id', method: 'GET', isArray: true},
	});
});
