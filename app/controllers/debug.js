app.controller('debugController', function($scope, $loader, $notification) {
	$scope.loaderStart = (id,asBackground) => $loader.start(id, asBackground);
	$scope.loaderStartBackground = id => $loader.startBackground(id);
	$scope.loaderStop = id => $loader.stop(id);
	$scope.$notification = $notification;
});
