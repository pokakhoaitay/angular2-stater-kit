/*
 ---------------------
 | This file is customed by me base on this: https://gist.github.com/DESIGNfromWITHIN/11383339
 ---------------------

 Gulpfile.js file for the tutorial:
 Using Gulp, SASS and Browser-Sync for your front end web development - DESIGNfromWITHIN
 http://designfromwithin.com/blog/gulp-sass-browser-sync-front-end-dev
 Steps:
 1. Install gulp globally:
 npm install --global gulp
 2. Type the following after navigating in your project folder:
 npm install gulp gulp-util gulp-sass gulp-uglify gulp-rename gulp-minify-css gulp-notify gulp-concat gulp-plumber browser-sync gulp-if gulp-typescript del gulp-util gulp-changed --save-dev
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
var gulpif = require('gulp-if');                      // pipe with condition
var del = require('del');                              // delete file and folder
var ts = require('gulp-typescript')                   // typescript compiler
var gutil = require('gulp-util')                      // log util and more
var changed = require("gulp-changed");              // only pipe on files are diffrent whith source files

/* Settings */
var BUILD_DIR_DEV = "__build__/dev";
var BUILD_DIR_PROD = "__build__/prod";
var BASE_DIR="./app";
var sassDepsPath_src = [
    './app/assets/css/**/*.sass',
    './app/assets/css/**/*.scss',
    './app/assets/css/**/*.css'
];
var jsDepsPath_src = [
    /* NOTE: Add your JS files here, they will be combined in this order */
    'js/vendor/jquery-1.11.1.js',
    'js/app.js',
    './app/assets/js/init.js'
];

var tsDepsPath_src = [
    './app/components/**/*.ts'
]


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


/*-----------------------------------------
 * SASS, CSS TASK
 *----------------------------------------*/

/*----------------------
 * Private
 */
var sassTask = function (options) {
    var run = function () {
        gulp.src(sassDepsPath_src, {base: BASE_DIR})
            //.pipe(plumber())
            .pipe(changed(options.buildDir))
            .pipe(sass())
            .pipe(gulp.dest(options.buildDir))
            .pipe(gulpif(options.minify, rename({suffix: '.min'})))
            .pipe(gulpif(options.minify, minifycss()))
            .pipe(gulpif(options.minify, gulp.dest(options.buildDir)))
            .on('end', function () {
                if (options.watch)
                    gutil.log('Watching file change...')
            })
            /* Reload the browser CSS after every change */
            .pipe(reload({stream: true}))
            ;

    };
    run();
    if (options.watch) {
        gulp.watch(sassDepsPath_src, run)
            .on('change', function (e) {
                logOnChange(e)
            });
    }
};

/*----------------------
 * Build Dev
 */
gulp.task('sass.dev', function () {
    var options = {devBuild: true, minify: false, watch: false, buildDir: BUILD_DIR_DEV};
    sassTask(options);
});

gulp.task('sass.dev.watch', function () {
    var options = {devBuild: true, minify: false, watch: true, buildDir: BUILD_DIR_DEV};
    sassTask(options);
});

/*----------------------
 /* Build Prod
 */
gulp.task('sass.prod', function () {
    var options = {devBuild: false, minify: true, watch: false, buildDir: BUILD_DIR_PROD};
    sassTask(options);
});


/*-----------------------------------------
 * JS TASK
 *----------------------------------------*/

var jsTask = function (options) {
    var run = function () {
        return gulp.src(jsDepsPath_src, {base: BASE_DIR})
            .pipe(changed(options.buildDir))
            .pipe(gulpif(!options.devBuild, concat('site.js')))
            .pipe(gulp.dest(options.buildDir))
            .pipe(gulpif(options.minify, rename({suffix: '.min'})))
            .pipe(gulpif(options.minify, uglify()))
            .pipe(gulpif(options.minify, gulp.dest(options.buildDir)))
            .on('end', function () {
                if (options.watch)
                    gutil.log('Watching file change...')
            });
    };

    run();
    if (options.watch) {
        gulp.watch(jsDepsPath_src, run)
            .on('change', function (e) {
                logOnChange(e)
            });
    }
};

gulp.task('js.dev', function () {
    var options = {devBuild: true, minify: false, watch: false, buildDir: BUILD_DIR_DEV};
    jsTask(options);
});

gulp.task('js.dev.watch', function () {
    var options = {devBuild: true, minify: false, watch: true, buildDir: BUILD_DIR_DEV};
    jsTask(options);
});

gulp.task('js.prod', function () {
    var options = {devBuild: false, minify: true, watch: false, buildDir: BUILD_DIR_PROD};
    jsTask(options);
});


/*-----------------------------------------
 * TYPESCRIPT
 *----------------------------------------*/
var tsProject = ts.createProject('tsconfig.json');
//var tsProject = ts.createProject('tsconfig.json', { sortOutput: true });
var tsTask = function (options) {
    var run = function () {
        var tsResult = tsProject.src() // instead of gulp.src(...)
            .pipe(changed(options.buildDir))
            .pipe(ts(tsProject));
        return tsResult.js
            .pipe(gulp.dest(options.buildDir))
            .on('end', function () {
                if (options.watch)
                    gutil.log('Watching file change...')
            });
    }
    run();
    if (options.watch) {
        gulp.watch(tsDepsPath_src, run)
            .on('change', logOnChange(e));
    }
}

gulp.task('ts.dev', function () {
    var options = {devBuild: true, minify: false, watch: false, buildDir: BUILD_DIR_DEV};
    tsTask(options);
});
gulp.task('ts.dev.watch', function () {
    var options = {devBuild: true, minify: false, watch: true, buildDir: BUILD_DIR_DEV};
    tsTask(options);
});
gulp.task('ts.prod', function () {
    var options = {devBuild: false, minify: true, watch: false, buildDir: BUILD_DIR_PROD};
    tsTask(options);
});


/*-----------------------------------------
 * CLEAN ALL
 *----------------------------------------*/
gulp.task('clean.all', function () {
    del('__build__')
});


/*-----------------------------------------
 * UTILS
 *----------------------------------------*/

function logOnChange(e) {
    console.log('File ' + e.path + ' was ' + e.type + ' and commited')
}


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
