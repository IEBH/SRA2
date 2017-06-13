app.controller('helpViewController', function($scope, $location, $rootScope, $sce, $stateParams) {
	// $scope.topics - inherited from parent

	$scope.topic;
	if (!$stateParams.topic) return $location.redirect('/help');
	$scope.topic = $scope.topics.find(i => i.id == $stateParams.topic);
	if (!$scope.topic) return $location.path('/help');

	$scope.topic.url = $sce.trustAsResourceUrl($scope.topic.url);

	// Deal with breadcrumbs {{{
	$rootScope.$broadcast('setBreadcrumb', [
		{url: '/help', title: 'Help'},
	]);
	$rootScope.$broadcast('setTitle', $scope.topic.title);
	// }}}
});
