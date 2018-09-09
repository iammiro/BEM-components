var gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin'),
  cache = require('gulp-cache');
var minifycss = require('gulp-minify-css');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var pug = require('gulp-pug');
var clean = require('gulp-clean');
var modernizr = require('gulp-modernizr');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('modernizr', function () {
  return gulp.src('./dev/scripts/*.js')
    .pipe(modernizr({
      options: ['setClasses'],
      tests: ['touchevents']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('public/scripts/'))
});

gulp.task('pug-components', function () {
  return gulp.src(['./dev/components/**/index.pug', '!./dev/templates/default/index.pug', '!./dev/pages/index.pug', '!./dev/components/index.pug'])
    .pipe(pug({basedir: "./public"}))
    .pipe(gulp.dest("./public/components/"))
});

gulp.task('pug-main-page', function () {
  return gulp.src('./dev/pages/index*.pug')
    .pipe(pug())
    .pipe(gulp.dest("./public/"))
});

gulp.task('pug', ['pug-components', 'pug-main-page']);

gulp.task('browser-sync', function () {
  browserSync({
    server: {baseDir: "./public"}
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('images', function () {
  gulp.src('dev/images/**/*')
    .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
    .pipe(gulp.dest('public/images/'));
});

gulp.task('styles-components', function () {
  gulp.src(['dev/components/**/*.scss', '!dev/components/index.scss'])
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(minifycss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/components/'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('styles-main', function () {
  gulp.src(['dev/components/index.scss'])
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(minifycss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/css/'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('styles', ['styles-components', 'styles-main']);

gulp.task('scripts', function () {
  return gulp.src(['dev/scripts/**/*.js', 'node_modules/focus-visible/dist/focus-visible.js'])
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/scripts/'))
    .pipe(browserSync.reload({stream: true}))
});

gulp.task('clean', function () {
  return gulp.src('public/', {read: false})
    .pipe(clean());
});

gulp.task('default', ['browser-sync', 'pug', 'images', 'styles', 'scripts', 'modernizr'], function () {
  gulp.watch("dev/components/**/*.scss", ['styles', 'bs-reload']);
  gulp.watch("dev/scripts/**/*.js", ['scripts']);
  gulp.watch("dev/**/*.pug", ['pug', 'bs-reload']);
  gulp.watch("public/*.html", ['bs-reload']);
});
