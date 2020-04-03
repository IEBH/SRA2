app.controller('libraryWordFreqReviewController', function($scope, $clipboard, $location, $notification, $rootScope, $stateParams, Libraries, References, Tasks) {
	$scope.loading = true;
	$scope.task = null;

	// Deal with breadcrumbs {{{
	$scope.$watch('library.title', function() {
		if (!$scope.library) return;
		$rootScope.$broadcast('setBreadcrumb', [
			{url: '/libraries', title: 'Libraries'},
			{url: '/libraries/' + $scope.library._id, title: $scope.library.title},
			{url: '/libraries/' + $scope.library._id + '/word-freq', title: 'Word-frequency Analysis'},
		]);
		$rootScope.$broadcast('setTitle', 'Results');
	});
	// }}}

	// Load state {{{
	if (!$stateParams.id) return $location.path('/libraries');
	if (!$stateParams.taskid) return $location.path('/libraries/' + $stateParams.id);
	Tasks.get({id: $stateParams.taskid}).$promise.then(function(task) {
		$scope.loading = false;
		$scope.task = task;
		// Decorators {{{
		// task.result.words[].width {{{
		$scope.maxPoints = Math.max.apply(this, task.result.words.map(word => word.points));
		$scope.task.result.words = $scope.task.result.words.map(word => {
			word.width = Math.ceil((word.points / $scope.maxPoints) * 100);
			return word;
		});
		// }}}
		// }}}
	});
	// }}}

	// Table sorting {{{
	$scope.sortCol = 'points';
	$scope.sortAZ = false;
	$scope.setSort = function(col) {
		if ($scope.sortCol == col) { // Already sorted by this - switch dir
			$scope.sortAZ = !$scope.sortAZ;
		} else {
			$scope.sortCol = col;
		}
	};
	// }}}

	// Copying {{{
	$scope.copyTable = function() {
		var elTable = $('#word-freqs')[0];
		// Below line is essential !!!

		// Ensure that range and selection are supported by the browsers
		var range, sel;
		if (document.createRange && window.getSelection) {
			range = document.createRange();
			sel = window.getSelection();
			// unselect any element in the page
			sel.removeAllRanges();

			try {
				range.selectNodeContents(elTable);
				sel.addRange(range);
			} catch (e) {
				range.selectNode(elTable);
				sel.addRange(range);
			}

			document.execCommand('copy');
			sel.removeAllRanges();
			$notification.success('Table copied to clipboard');
		} else {
			$notification.error('Not supported in this browser');
		}
	};
	// }}}

	// Share URL {{{
	$scope.shareUrl = function() {
		$clipboard.copy(window.location.href);
		$notification.success('URL copied to clipboard');
	};
	// }}}
});
