/**
 *	gulpfile.js: auto restart server on file changes
 *	https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md
 */

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('default', function () {
	nodemon({
		script: 'index.js'
		, ext: 'js' /*html*/
		, env: { 'NODE_ENV': 'development' }
	})
})
