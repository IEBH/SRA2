app.factory('Users', function($resource) {
	return $resource('/api/users/:userid', {}, {
		login: {url: '/api/users/login', method: 'POST'},
		logout: {url: '/api/users/logout', method: 'POST'},
		profile: {url: '/api/users/profile', cache: false},
		profileSave: {url: '/api/users/profile', method: 'POST'},
		recover: {url: '/api/users/recover', method: 'POST'},
		reset: {url: '/api/users/reset', method: 'POST'},
		signup: {url: '/api/users', method: 'POST'}
	});
});
