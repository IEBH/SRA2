/**
* Fulltext worker
* Attemps to locate the full text of given references
*/
module.exports = function(finish, task) {
	setTimeout(function() {
		console.log('Pretending to work on task', task._id);
		finish();
	}, 3000);
};
