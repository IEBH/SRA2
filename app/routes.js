app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/login', {templateUrl: "/partials/users/login.html"})
		.when('/logout', {templateUrl: "/partials/users/logout.html"})
		.when('/libraries', {templateUrl: "/partials/libraries/list.html"})
		.when('/libraries/view/:id', {templateUrl: "/partials/libraries/view.html"})
		.otherwise({templateUrl: "/partials/dashboard.html"});
});
