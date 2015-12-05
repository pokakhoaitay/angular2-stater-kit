/*
 Reference from this: https://gist.github.com/DESIGNfromWITHIN/11383339

 Gulpfile.js file for the tutorial:
 Using Gulp, SASS and Browser-Sync for your front end web development - DESIGNfromWITHIN
 http://designfromwithin.com/blog/gulp-sass-browser-sync-front-end-dev
 Steps:
 1. Install gulp globally:
 npm install --global gulp
 2. Type the following after navigating in your project folder:
 npm install gulp gulp-util gulp-sass gulp-uglify gulp-rename gulp-minify-css gulp-notify gulp-concat gulp-plumber browser-sync gulp-if gulp-tsc del --save-dev
 3. Move this file in your project folder
 4. Setup your vhosts or just use static server (see 'Prepare Browser-sync for localhost' below)
 5. Type 'Gulp' and ster developing
 */

/* Needed gulp config */
var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var minifycss = require('gulp-minify-css');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var neat = require('node-neat');
var gulpif = require('gulp-if');
var del = require('del');

/* Settings */
var BUILD_DIR_DEV = "__build__/dev";
var BUILD_DIR_PROD = "__build__/prod";
var sassDepsPath_src = ['app/assets/css/**/*.sass', 'app/assets/css/**/*.scss', 'app/assets/css/**/*.css'];
var jsDepsPath_src = ['app/assets/js/**/*.js'];



/* Reload task */
gulp.task('bs-reload', function () {
    browserSync.reload();
});

/* Prepare Browser-sync for localhost */
gulp.task('browser-sync', function () {
    browserSync.init(['css/*.css', 'js/*.js'], {
        /*
         I like to use a vhost, WAMP guide: https://www.kristengrote.com/blog/articles/how-to-set-up-virtual-hosts-using-wamp, XAMP guide: http://sawmac.com/xampp/virtualhosts/
         */
        proxy: 'your_dev_site.url'
        /* For a static server you would use this: */
        /*
         server: {
         baseDir: './'
         }
         */
    });
});



/*---------------------------------------
 * SASS, CSS TASK
 *----------------------------------------*/

/*----------------------
 * Private
 */
var sassTask = function (options) {
    var run = function () {
        gulp.src(sassDepsPath_src)
            //.pipe(plumber())
            .pipe(sass())
            .pipe(gulp.dest(options.rootDir + '/assets/css'))
            .pipe(gulpif(options.minify, rename({suffix: '.min'})))
            .pipe(gulpif(options.minify, minifycss()))
            .pipe(gulpif(options.minify, gulp.dest(options.rootDir + '/assets/css')))
            /* Reload the browser CSS after every change */
            .pipe(reload({stream: true}))
        ;

    };
    run();
    if (options.watch) {
        gulp.watch(sassDepsPath_src, run);
    }
};

/*----------------------
 * Build Dev
 */
gulp.task('sass.dev', function () {
    var options = {devBuild: true, minify: false, watch: true, rootDir: BUILD_DIR_DEV};
    sassTask(options);
});

/*----------------------
 /* Build Prod
 */
gulp.task('sass.prod', function () {
    var options = {devBuild: false, minify: true, watch: false, rootDir: BUILD_DIR_PROD};
    sassTask(options);
});


/*---------------------------------------
 * JS TASK
 *----------------------------------------*/

var jsTask = function (options) {
    var run = function () {
        return gulp.src([
                /* Add your JS files here, they will be combined in this order */
                'js/vendor/jquery-1.11.1.js',
                'js/app.js',
                'app/assets/js/init.js'
            ])
            .pipe(concat('site.js'))
            .pipe(gulp.dest(options.rootDir + '/assets/js/'))
            .pipe(gulpif(options.minify, rename({suffix: '.min'})))
            .pipe(gulpif(options.minify, uglify()))
            .pipe(gulpif(options.minify, gulp.dest(options.rootDir + '/assets/js/')));
    };

    run();
    if (options.watch) {
        gulp.watch(jsDepsPath_src, run);
    }
};

gulp.task('js.dev', function () {
    var options = {devBuild: true, minify: false, watch: true, rootDir: BUILD_DIR_DEV};
    jsTask(options);
});

gulp.task('js.prod', function () {
    var options = {devBuild: false, minify: true, watch: false, rootDir: BUILD_DIR_PROD};
    jsTask(options);
});

/*---------------------------------------
 * CLEAN ALL
 *----------------------------------------*/
gulp.task('clean.all', function () {
    del('__build__')
});


//DOCS
//
/*
 var cssTask = function (options) {
 var minifyCSS = require('gulp-minify-css'),
 less = require('gulp-less'),
 src = cssDependencies;

 src.push(codePath + '**!/!*.less');

 var run = function () {
 var start = Date.now();

 console.log('Start building CSS/LESS bundle');

 gulp.src(src)
 .pipe(gulpif(options.devBuild, plumber({
 errorHandler: onError
 })))
 .pipe(concat('main.css'))
 .pipe(less())
 .pipe(gulpif(options.minify, minifyCSS()))
 .pipe(gulp.dest(buildPath + 'css'))
 .pipe(gulpif(options.devBuild, browserSync.reload({stream:true})))
 .pipe(notify(function () {
 console.log('END CSS/LESS built in ' + (Date.now() - start) + 'ms');
 }));
 };

 run();

 if (options.watch) {
 gulp.watch(src, run);
 }
 };

 gulp.task('dev', function () {
 var options = {
 devBuild: true,
 minify: false,
 watch: false
 };

 cssTask (options);
 });*/
