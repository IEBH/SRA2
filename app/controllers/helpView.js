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
		$.get($scope.topic.url, html => {
			$("#google-doc-iframe").attr("srcdoc", html);
			setTimeout(function() {
				var frame = $("#google-doc-iframe");
				frame.contents().find('body').css('padding', '0 20px');
				frame.contents().find('a[href^="http://"]').attr("target", "_blank");
				frame.contents().find('a[href^="https://"]').attr("target", "_blank").each((i, el) => {
					var $el = $(el);
					$el.attr('href', $el.attr('href').replace(/^https:\/\/www\.google\.com\/url\?q=/, ''));
				});
			}, 100);
		});
	});
	// }}}

	$scope.print = ()=> $("#google-doc-iframe")[0].contentWindow.print();
});
