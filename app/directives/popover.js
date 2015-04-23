/**
* Adds a Bootstrap popover to an element
*
*	<tag popover="hello world"/>
*
*	<tag popover="hello world" popover-title="Hello World!" popover-position="bottom" popover-container="body" popover-trigger="click"/>
*
* @author Matt Carter <m@ttcarter.com>
* @date 2014-04-16
*/
app.directive('popover', function() {
	return {
		scope: {
			popover: '@',
			popoverTitle: '@?',
			popoverPosition: '@?',
			popoverContainer: '@?',
			popoverTrigger: '@?',
			popoverHtml: '@?'
		},
		restrict: 'A',
		link: function($scope, elem) {
			$scope.$watch('popover + popoverTitle + popoverPosition + popoverContainer + popoverTrigger', function() {
				var isVisible = $(elem).siblings('.popover').length > 0; // Is the popover already shown?
				$(elem)
					.popover('destroy')
					.popover({
						content: $scope.popover,
						title: $scope.popoverTitle,
						placement: $scope.popoverPosition || 'top',
						container: $scope.popoverContainer || null,
						trigger: $scope.popoverTrigger || 'hover',
						html: $scope.popoverHtml || false,
						animation: false
					});

				if (isVisible) // Reshow the popover if we WERE using it before
					$(elem).popover('show');
			});
		}
	}
});
