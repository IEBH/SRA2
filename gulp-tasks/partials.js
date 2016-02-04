var ngTemplateCache = require('gulp-angular-templatecache');
var gulp = require('gulp');
var minifyHtml = require('gulp-minify-html');
var notify = require('gulp-notify');

var templateBootCount = 0;
gulp.task('partials', ['load:config'], function() {
	return gulp.src(paths.partials)
		.pipe(minifyHtml())
		.pipe(ngTemplateCache({
			filename: 'partials.min.js',
			module: 'app',
			root: '/partials/',
		}))
		.pipe(gulp.dest(paths.build))
		.on('end', function() {
			notify({
				title: config.title,
				message: 'Rebuilt angular template cache ' + (++templateBootCount > 1 ? ' #' + templateBootCount : ''),
				icon: __dirname + '/icons/html5.png',
			}).write(0);
		});
});
