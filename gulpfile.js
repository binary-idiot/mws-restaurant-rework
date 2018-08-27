const gulp = require('gulp');
const connect = require('gulp-connect');
const sass = require('gulp-sass');
const images = require('gulp-responsive-images');
const wait = require('gulp-wait');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const del = require('del');


gulp.task('styles', gulp.series(cleanStyles, compileStyles));

gulp.task('images', gulp.series(cleanImages, resizeImages));

gulp.task('js', gulp.series(cleanJS, minifyJS))

gulp.task('clean', gulp.parallel(cleanImages, cleanStyles, cleanJS));

gulp.task('watch', gulp.parallel(watchStyles, watchImages, watchJS));

gulp.task('startServer', gulp.series(serve));

gulp.task('default', gulp.parallel(serve, gulp.series(gulp.parallel('styles', 'images', 'js'), 'watch')));


function cleanStyles() {return del(['css/*']);}

function cleanImages() {return del(['images/*']);}

function cleanJS() {return del(['js/*']);}

function watchStyles() {
	return gulp.watch('src/sass/*')
		.on('all', gulp.series('styles'));
}

function watchImages() {
	return gulp.watch('src/images/*')
		.on('all', gulp.series('images'));
}

function watchJS() {
	return gulp.watch('src/js/*')
		.on('all', gulp.series('js'));
}

function serve() {
	return connect.server()
}

function compileStyles() {
	return gulp.src('src/sass/*')
		.pipe(wait(50))		//Wait for file to finish saving
		.pipe(sourcemaps.init())
		.pipe(sass({style: 'compressed'}).on('error', sass.logError))
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest('css'));
}

function minifyJS() {
	return gulp.src('src/js/*')
		.pipe(wait(50))		//Wait for file to finish saving
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest('js'));
}

function resizeImages() {
	return gulp.src('src/img/*')
		.pipe(images({
			'*.jpg':[{
				width: 300,
				suffix: '-small',
				quality: 30
			},
			{
				width: 600,
				suffix: '-medium',
				quality: 30
			},
			{
				width: 800,
				suffix: '-large',
				quality: 30
			}],
			'app_logo.png':[{
				width: 192,
				suffix: '-small'
			},
			{
				width: 512,
				suffix: '-large'
			}]
		}))
		.pipe(gulp.dest('img'));
}