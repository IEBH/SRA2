/**
* pretty - Basic pretty printer
*
* This function can be used to pretty print objects or JSON streams
*
* In your templating system:
*	{{foo | pretty}}
*
*/
app.filter('pretty', function() {
	return function(value) {
		if (!value) {
			return 'null';
		} else if (typeof value == 'object') {
			return JSON.stringify(value, null, '\t');
		} else {
			return value.toString(); // FIXME: Stub, this should be improved on
		}
	};
});
