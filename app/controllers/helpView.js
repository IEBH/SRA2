app.controller('helpViewController', function($scope, $http, $location, $rootScope, $stateParams) {
	// $scope.topics - inherited from parent

	$scope.topic;
	if (!$stateParams.topic) return $location.redirect('/help');
	$scope.topic = $scope.topics.find(i => i.id == $stateParams.topic);
	if (!$scope.topic) return $location.path('/help');

	// Deal with breadcrumbs {{{
	$rootScope.$broadcast('setBreadcrumb', [
		{url: '/help', title: 'Help'},
	]);
	$rootScope.$broadcast('setTitle', $scope.topic.title);
	// }}}

	// Load topic from URL and rewrite <a> targets {{{
	// We have to manually rewrite <a> links as Google Docs seemingly provides no way to do this
	// Any link being clicked in an IFrame will try to redirect within the IFrame and refuse due to content policy
	// @see https://stackoverflow.com/q/28343653/1295040
	$scope.$watch('topic.url', ()=> {
		embedGDoc({
			selector: '#gdoc',
			url: $scope.topic.url,
		});
	});
	// }}}
});
