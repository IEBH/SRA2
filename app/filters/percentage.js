app.filter('percentage', function() {
	return function(value) {
		if (!value) return;

		return Math.ceil(value * 100) + '%';
	};
});
