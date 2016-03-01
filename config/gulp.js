var colors = require('chalk');
var gutil = require('gulp-util');

module.exports = {
	execDefaults: { // Default structure passed to any async-chainable-exec.execDefaults() function
		log: function(cmd) { gutil.log(colors.blue('[RUN]'), cmd.cmd + ' ' + cmd.params.join(' ')) },
		stderr: function(out) {
			out.split("\n").forEach(function(line) {
				gutil.log(colors.red('>', line));
			});
		},
		stdout: function(out) {
			out.split("\n").forEach(function(line) {
				gutil.log('>', line);
			});
		},
	},
};
