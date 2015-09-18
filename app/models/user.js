app.factory('User', function($resource) {
	return $resource('/users/:userid', {}, {
		profile: {url: '/users/profile'}
	});
});
