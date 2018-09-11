// --------------------------------
// 			Modules
// --------------------------------
const gulp = require('gulp');
const jshint = require ('gulp-jshint');
const concat = require('gulp-concat');
const stripDebug = require('gulp-strip-debug');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const postCss = require('gulp-postcss');
const mqPacker = require('css-mqpacker');
const pxToRem = require('postcss-pxtorem');
const sourceMaps = require('gulp-sourcemaps');
const cssNano = require('gulp-cssnano');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const fs = require("fs");
const cacheBuster = require("postcss-cachebuster");
const shell = require('gulp-shell');


// --------------------------------
// 			Setup
// --------------------------------
const storeName = 'SnapSuits';
const projectName = storeName.toLowerCase().replace(/\s/g, '-');
const url = 'suitssuits.myshopify.com'; // Note: Url must be the actual shop url for BrowserSync to work properly
const jsfiles = [
	'src/js/libs/jquery-2.2.4.min.js',
	'src/js/libs/*.js',
	'src/js/modules/*.js'
];
const devProcessors = [
	autoprefixer(),
	pxToRem({ rootValue: 16, replace: true, mediaQuery: true }),
	cacheBuster({cssPath: '/assets', type:'mtime'})
];
const prodProcessors = [
	pxToRem({rootValue: 16, replace: true, mediaQuery: true}),
	mqPacker({sort: true}),
	cacheBuster({cssPath: '/assets', type:'mtime'})
];

// --------------------------------
// 			Tasks
// --------------------------------

// JS -------------
gulp.task('js:hint', function(){
	gutil.log(gutil.colors.blue('--> Validating JS '));
	gulp.src(['src/js/modules/*.js'])
 		.pipe(jshint())
		.pipe(notify(function(file){
			return (file.jshint.success) ? false : file.relative + ' has errors!';
		}))
		.pipe(jshint.reporter('jshint-stylish', { verbose: true }));
});
gulp.task('js:concat', function(){
	gutil.log(gutil.colors.blue('--> Concatenating JS '));
	gulp.src(jsfiles)
		.pipe(concat(projectName + '.min.js'))
		.pipe(gulp.dest('assets/'))
	    .pipe(browserSync.stream())
	    .pipe(notify({ title: storeName + ' JS', message: 'Browser Refreshed' }));
});
gulp.task('js:uglify', function(){
	gutil.log(gutil.colors.blue('--> Uglifying JS '));
	gulp.src(jsfiles)
		.pipe(concat(projectName + '.js'))
		.pipe(stripDebug())
		.pipe(uglify())
		.pipe(gulp.dest('assets/'))
	    .pipe(notify({ title: storeName + ' JS', message: 'Uglified' }));
});


// CSS ------------
gulp.task('css:postsass', function(){
	gutil.log(gutil.colors.blue('--> Compiling CSS Stuffs '));
	gulp.src('src/css/scss/*.scss')
		.pipe(sourceMaps.init())
		.pipe(sass().on('error', handleSassError))
		.pipe(postCss(devProcessors))
		.pipe(sourceMaps.write())
		.pipe(rename(projectName + '.css'))
		.pipe(gulp.dest('assets/'))
		.pipe(browserSync.stream())
		.pipe(notify({ title: storeName + ' CSS', message: 'CSS Refreshed' }));
});
gulp.task('css:post_build', function(){
	gutil.log(gutil.colors.blue('--> Making CSS Stuffs Smaller '));
	gulp.src('src/css/scss/*.scss')
		.pipe(sass().on('error', handleSassError))
		.pipe(postCss(prodProcessors))
		.pipe(cssNano({autoprefixer: { add: true }}))
		.pipe(rename(projectName + '.css'))
		.pipe(gulp.dest('assets/'))
		.pipe(notify({ title: storeName + ' CSS', message: 'CSS Refreshed' }));
});

// --------------------------------
// 			Helpers
// --------------------------------

function handleSassError(err){
	gutil.log(gutil.colors.bold.white.bgRed('\n \n [SASS] ERROR \n'));
	console.error('', err.message);
	return notify({
		title: 'Sass Error',
		message: 'Error on line ' + err.line + ' of ' + err.file
	}).write(err);
}

// --------------------------------
// 			Executables
// --------------------------------

// Command: `gulp`
gulp.task('default', ['js:hint','js:concat','css:postsass',], function() {
	fs.readFile('config.yml', 'utf-8', function(err, _data) {
		var themeId =  /develop:(\n+)[^#](\s+)theme_id:(\s+)([0-9]+)/.exec(_data)[4]; // it's magic, just go with it.

		browserSync.init({
		    proxy: url + '?preview_theme_id=' + themeId,
		    open: false,
		    xip: false, // turn this on if using typekit, point your typekit to xip.io
		    ghostMode: { // turn this off if you don't want people on the same IP scrolling on you
		        clicks: true,
		        forms: true,
		        scroll: true
		    }
		});
	});

	// watch for changes in src
	gulp.watch('src/js/**/*.js', ['js:hint', 'js:concat']);

	// watch for sass changes
	gulp.watch('src/css/scss/**/*.scss', ['css:postsass']);

});

// Command: `gulp build`
gulp.task('build', ['js:uglify', 'css:post_build'], function(){
	gulp.src([
		'assets',
		'config',
		'layout',
		'sections',
		'snippets',
		'templates',
	])
	.pipe(gulp.dest('./dist'));
	gulp.src('gulpfile.js').pipe(notify({
		title: 'Build Scripts',
		message: 'Finished!'
	}));
});