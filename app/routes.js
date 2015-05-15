app.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider
		.otherwise('/');

	$stateProvider
		// General pages {{{
		.state('home', {
			url: '/',
			views: {main: {templateUrl: '/partials/dashboard.html'}},
			data: {
				title: 'Dashboard',
			}
		})
		.state('login', {
			url: '/login',
			views: {main: {templateUrl: '/partials/users/login.html'}},
			data: {
				title: 'Logout',
			}
		})
		.state('logout', {
			url: '/logout',
			views: {main: {templateUrl: '/partials/users/logout.html'}},
			data: {
				title: 'Logout',
			}
		})
		// }}}
		// Library (collective) {{{
		.state('libraries', {
			url: '/libraries',
			views: {main: {templateUrl: '/partials/libraries/list.html'}},
			data: {
				title: 'Libraries',
			}
		})
		.state('libraries-import', {
			url: '/libraries/{operation:import}',
			views: {main: {templateUrl: '/partials/libraries/import.html'}},
			data: {
				title: 'Import',
				breadcrumbs: [{url: '/libraries', title: 'Libraries'}]
			}
		})
		// }}}
		// Library (specific) {{{
		.state('library-simple', {
			url: '/libraries/:id/{operation:delete}',
			views: {main: {templateUrl: '/partials/libraries/wait.html'}},
			data: {
				title: 'Performing operation',
				breadcrumbs: [{url: '/libraries', title: 'Libraries'}]
			}
		})
		.state('libraries-operation', {
			url: '/libraries/{operation:export|dedupe|screen|tags|share|collabmatrix|clear|delete}',
			views: {main: {templateUrl: '/partials/libraries/operation.html'}},
			data: {
				title: 'Perform operation',
				breadcrumbs: [{url: '/libraries', title: 'Libraries'}]
			}
		})
		.state('library-export', {
			url: '/libraries/:id/{operation:export}',
			views: {main: {templateUrl: '/partials/libraries/export.html'}},
			data: {
				title: 'Export',
				breadcrumbs: [{url: '/libraries', title: 'Libraries'}]
			}
		})
		.state('library-view', {
			url: '/libraries/:id',
			views: {main: {templateUrl: '/partials/libraries/view.html'}},
			data: {
				title: 'Library',
				breadcrumbs: [{url: '/libraries', title: 'Libraries'}]
			}
		})
		// }}}
});
