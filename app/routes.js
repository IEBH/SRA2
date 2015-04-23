app.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/login', {templateUrl: "/partials/user/login.html"})
		.otherwise({templateUrl: "/partials/dashboard.html"});
});
