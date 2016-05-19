/**
* Extremely simple Angular wrapper around the JS filesize library
* @author Matt Carter <m@ttcarter.com>
* @date 2016-05-17
*/
app.filter('filesize', function() {
	return filesize;
});
