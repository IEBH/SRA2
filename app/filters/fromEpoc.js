/**
* fromEpoc - Convert Unix epocs into data objects
*
* Converts a Unix epoc into a Javascript data object
* This function is usually used in pipelines to format an incomming epoc value with a suitable date format
* In your controller:
*	$scope.foo = 1397274589;
*
* In your templating system:
*	{{foo | fromEpoc | date}}
*
* Will output: 'Apr 12, 2014' (see the 'date' filter docs for other formats)
*/
app.filter('fromEpoc', function() {
	return function(value) {
		if (!value)
			return;
		var date = new Date(value*1000);
		return date;
	};
});
