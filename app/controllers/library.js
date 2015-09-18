app.controller('libraryController', function($scope, Library) {
	// Determine active library from URL {{{
	var pathBits = window.location.pathname.match(/^\/libraries\/view\/(\d+)$/);
	if (pathBits) {
		$scope.library = Library.get({id: pathBits[1]});
	} else { //
		window.location = '/libraries';
	}
	// }}}
});
