app.controller('spiderciteController', ['$scope', '$sce', function($scope, $sce) {
	$scope.$watchGroup(['user._id'], function() {
		var user = $scope.user._id;
		var url = "https://spidercite.sr-accelerator.com/";
		if(user) {
			url = url.concat("?user=" + user);
		}
		$scope.url = $sce.trustAsResourceUrl(url);
	});
}]);