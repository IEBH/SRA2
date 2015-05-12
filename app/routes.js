app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/login', {templateUrl: "/partials/users/login.html"})
		.when('/logout', {templateUrl: "/partials/users/logout.html"})
		.when('/libraries', {templateUrl: "/partials/libraries/list.html"})
		.when('/libraries/:id', {templateUrl: "/partials/libraries/view.html"})
		.when('/libraries/import', {templateUrl: "/partials/libraries/operation.html"})
		.otherwise({templateUrl: "/partials/dashboard.html"});
});
