app.factory('Settings', function($resource) {
	return {
		debounce: {
			user: 2 * 1000 // Only save user details after this delay
		}
	};
});
