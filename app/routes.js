app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/login', {templateUrl: "/partials/users/login.html"})
		.otherwise({templateUrl: "/partials/dashboard.html"});
});
