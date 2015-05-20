/**
* Returns a boolean if the specified value exists within the data pipe
*
* In your templating system:
*
*	<input type="checkbox" ng-checked="product.tags | contains:tag._id"/>
*
*/
app.filter('contains', function() {
	return function(feed, value) {
		if (!feed || !value) return false;
		return feed.some(function(i) {
			return i == value;
		});
	};
});
