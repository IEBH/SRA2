var gulp = require('gulp');
var exec = require('@momsfriendlydevco/exec');

gulp.task('nginx', ()=> gulp.run('nginx:check', 'nginx:chmod', 'nginx:deploy', 'nginx:reload'));

gulp.task('nginx:check', ['load:app'], ()=>
	exec(['sudo', 'nginx', '-t', '-c', `${app.config.paths.root}/server.nginx/nginx.conf`], {log: gulp.log.bind(this, '[NGINX/check]')})
);

gulp.task('nginx:chmod', ()=>
	exec(['sudo', 'chmod', '0777', '/etc/nginx'], {log: gulp.log.bind(this, '[NGINX/chmod]')})
);

gulp.task('nginx:deploy', ()=>
	gulp.src('./server.nginx/nginx.conf')
		.pipe(gulp.dest('/etc/nginx'))
);

gulp.task('nginx:reload', ()=>
	exec(['sudo', 'service', 'nginx', 'reload'], {log: gulp.log.bind(this, '[NGINX/reload]')})
);
