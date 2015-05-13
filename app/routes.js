app.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider
		.otherwise('/');

	$stateProvider
		.state('home', {url: '/', views: {main: {templateUrl: '/partials/dashboard.html'}}})
		.state('login', {url: '/login', views: {main: {templateUrl: '/partials/users/login.html'}}})
		.state('logout', {url: '/logout', views: {main: {templateUrl: '/partials/users/logout.html'}}})
		.state('libraries', {url: '/libraries', views: {main: {templateUrl: '/partials/libraries/list.html'}}})
		.state('library-simple', {url: '/libraries/:id/{operation:delete}', views: {main: {templateUrl: '/partials/libraries/wait.html'}}})
		.state('libraries-operation', {url: '/libraries/{operation:import|export|dedupe|screen|tags|share|collabmatrix|clear|delete}', views: {main: {templateUrl: '/partials/libraries/operation.html'}}})
		.state('library-view', {url: '/libraries/:id', views: {main: {templateUrl: '/partials/libraries/view.html'}}})
});
