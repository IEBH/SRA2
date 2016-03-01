app.directive('signalReady', ['$rootScope', function($rootScope) {
	return {
		scope: {
			signalReady: '=?',
		},
		restrict: 'A',
		link: function($scope) {
			var signal = $scope.signalReady || 'ready';
			var to;
			var listener = $scope.$watch(function() {
				clearTimeout(to);
				to = setTimeout(function () {
					listener();
					$rootScope.$broadcast('ready');
				}, 50);
			});
		}
	};
}]);
