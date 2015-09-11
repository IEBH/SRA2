/**
* Provides a simple filter to transform text so that all first letters in words is in upper case
*
* For example:
*
* In your controller:
*	$scope.foo = 'hello world'
*
* In your templating system:
*	{{foo | ucwords}}
*
* Will output: 'Hello World'
*/
app.filter('ucwords', function() {
	return function(value) {
		if (!value)
			return;
		return value.replace(/\b([a-z])/g, function(all,first) {
			return first.toUpperCase();
		});
	};
});
