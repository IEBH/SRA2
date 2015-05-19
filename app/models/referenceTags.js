app.factory('ReferenceTags', function($resource) {
	return $resource('/api/referenceTags/:id', {}, {
	});
});
