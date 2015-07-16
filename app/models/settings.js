app.factory('Settings', function($resource) {
	return {
		getLimits: {
			references: 500,
		},
		debounce: { // Only save entity details after this delay
			tags: 2 * 1000,
			user: 2 * 1000
		},
		poll: { // How often certain interfaces should refresh
			task: 1 * 1000,
		}
	};
});
