/**
* Calls fn once after timeout even if more than one call wdo debounced fn was made
* Edited version of the original part of ng-tools - https://github.com/capaj/ng-tools
*
* Example of autosaving:
*
*	// Calls $scope.save() 3s after a change to the 'notification' object
*	$scope.$watch('notification', $debounce($scope.save, 3000), true);
*
* @param function callback Callback to wrap within a debounce handler
* @param number timeout Timeout in ms
* @param boolean apply will be passed to $timeout as last param, if the debounce is triggering infinite digests, set this to false
* @returns function Callback wrapped in a debounce handler
*/

app.factory('$debounce', ['$timeout', function($timeout) {
	function debounce(callback, timeout, apply) {
		timeout = angular.isUndefined(timeout) ? 0 : timeout;
		apply = angular.isUndefined(apply) ? true : apply;
		var callCount = 0;
		return function() {
			var self = this;
			var args = arguments;
			callCount++;
			var wrappedCallback = (function(version) {
				return function() {
					if (version === callCount) return callback.apply(self, args);
				};
			})(callCount);
			return $timeout(wrappedCallback, timeout, apply);
		};
	}
	return debounce;
}]);
