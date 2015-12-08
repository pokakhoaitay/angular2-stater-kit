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
 npm install gulp gulp-util gulp-sass gulp-uglify gulp-rename gulp-minify-css gulp-notify gulp-concat gulp-plumber browser-sync gulp-if gulp-typescript del gulp-util gulp-changed gulp-inject gulp-replace --save-dev
 3. Move this file in your project folder
 4. Setup your vhosts or just use static server (see 'Prepare Browser-sync for localhost' below)
 5. Type 'Gulp' and ster developing
 */

/* Needed gulp config */
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync').create(),
//reload = browserSync.reload,
    neat = require('node-neat'),
    gulpif = require('gulp-if'),                         // pipe with condition
    del = require('del'),                                 // delete file and folder
    ts = require('gulp-typescript'),                     // typescript compiler
    gutil = require('gulp-util'),                        // log util and more
    changed = require("gulp-changed"),                 // only pipe on files are diffrent whith source files
    inject = require('gulp-inject'),                      // Inject resource to html
    replace = require('gulp-replace')
    ;

/* Settings */
var BUILD_DIR_DEV = "__build__/dev",
    BUILD_DIR_PROD = "__build__/prod",
    BASE_DIR = "./app";
var sassDepsPath_src = [
    './app/assets/css/site.sass',
    './app/assets/css/theme.blue.sass',
];
var cssDestPaths = [
    BUILD_DIR_DEV + '/assets/css/site.css',
    BUILD_DIR_DEV + '/assets/css/theme.blue.css',
];
var jsDepsPath_src = [
    /* NOTE: Add your JS files here, they will be combined in this order */
    'js/vendor/jquery-1.11.1.js',
    'js/app.js',
    './app/assets/js/init.js',
    //TODO: add lib js here
];

var htmlDepsPaths_Src = [
    './app/components/**/*.html',
]

var tsDepsPath_src = [
    './app/components/**/*.ts',
    //'./app/compo/bootstrap.ts'
];

var nodeModulesSrc = [
    './node_modules/systemjs/dist/system.src.js',
    './node_modules/angular2/bundles/angular2.dev.js',
    './node_modules/angular2/bundles/router.dev.js'
];


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
var sassTask = function (options, callback) {
    var run = function () {
        var task = gulp.src(sassDepsPath_src, {base: BASE_DIR})
            .pipe(changed(options.buildDir))
            .pipe(plumber({errorHandler: onError}))
            .pipe(sass())
            .pipe(gulp.dest(options.buildDir));
        if (options.minify) {
            task.pipe(gulpif(options.minify, rename({suffix: '.min'})))
                .pipe(gulpif(options.minify, minifycss()))
                .pipe(gulpif(options.minify, gulp.dest(options.buildDir)))
        }
        task.on('end', function () {
            if (options.watch)
                gutil.log('Watching css files change...')
            if (typeof callback !== 'undefined')
                callback();
        })
            /* Reload the browser CSS after every change */
            //.pipe(reload({stream: true}))
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
gulp.task('1_sass.dev', function () {
    var options = {devBuild: true, minify: false, watch: false, buildDir: BUILD_DIR_DEV};
    sassTask(options);
});

gulp.task('1_sass.dev.watch', function () {
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

var jsTask = function (options, callback) {
    var run = function () {
        var gulpResult = gulp.src(jsDepsPath_src, {base: BASE_DIR})
            .pipe(changed(options.buildDir))
            .pipe(plumber({errorHandler: onError}))
            .pipe(gulpif(!options.devBuild, concat('site.js')))
            .pipe(gulp.dest(options.buildDir));
        //WTF? gulpif here cause .on('end') not working, this is workarround by if statement
        if (options.minify) {
            gulpResult
                .pipe(gulpif(options.minify, rename({suffix: '.min'})))
                .pipe(gulpif(options.minify, uglify()))
                .pipe(gulpif(options.minify, gulp.dest(options.buildDir)))
        }
        gulpResult
            .on('end', function () {
                gutil.log('DONE JS')
                if (options.watch)
                    gutil.log('Watching js files change...')
                if (typeof callback !== 'undefined')
                    callback();
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

gulp.task('2_js.dev', function () {
    var options = {devBuild: true, minify: false, watch: false, buildDir: BUILD_DIR_DEV};
    jsTask(options);
});

gulp.task('2_js.dev.watch', function () {
    var options = {devBuild: true, minify: false, watch: true, buildDir: BUILD_DIR_DEV};
    jsTask(options);
});


gulp.task('js.prod', function () {
    var options = {devBuild: false, minify: true, watch: false, buildDir: BUILD_DIR_PROD};
    jsTask(options);
});

//TODO: Write copy lib js here


/*-----------------------------------------
 * TYPESCRIPT
 *----------------------------------------*/
//var tsProject = ts.createProject('tsconfig.json');
//var tsProject = ts.createProject('tsconfig.json', { sortOutput: true });
var tsTask = function (options, callback) {
    var run = function () {
        var tsResult = gulp.src(tsDepsPath_src, {base: BASE_DIR}) // instead of gulp.src(...)
            .pipe(changed(options.buildDir))
            .pipe(plumber({errorHandler: onError}))
            .pipe(ts({
                "target": "es5",
                "module": "commonjs",
                "declaration": true,
                "noImplicitAny": false,
                "removeComments": true,
                "noLib": false,
                "emitDecoratorMetadata": true,
                "experimentalDecorators": true,
                "sourceMap": true
            }));
        return tsResult.js
            .pipe(gulp.dest(options.buildDir))
            .on('end', function () {
                if (options.watch)
                    gutil.log('Watching ts files change...')
                if (typeof callback !== 'undefined')
                    callback();
            })
            ;
    }
    run();
    if (options.watch) {
        gulp.watch(tsDepsPath_src, run)
            .on('change', function (e) {
                logOnChange(e)
            });
    }
}

gulp.task('3_ts.dev', function () {
    var options = {devBuild: true, minify: false, watch: false, buildDir: BUILD_DIR_DEV};
    tsTask(options);
});
gulp.task('ts.dev+clean', ['clean.ts.dev'], function () {
    var options = {devBuild: true, minify: false, watch: false, buildDir: BUILD_DIR_DEV};
    tsTask(options);
});
gulp.task('3_ts.dev.watch', function () {
    var options = {devBuild: true, minify: false, watch: true, buildDir: BUILD_DIR_DEV};
    tsTask(options);
});
gulp.task('ts.dev.watch+clean', ['clean.ts.dev'], function () {
    var options = {devBuild: true, minify: false, watch: true, buildDir: BUILD_DIR_DEV};
    tsTask(options);
});
gulp.task('ts.prod', function () {
    var options = {devBuild: false, minify: true, watch: false, buildDir: BUILD_DIR_PROD};
    tsTask(options);
});


/*-----------------------------------------
 * HTML
 *----------------------------------------*/
var htmlTask = function (options) {
    var cssDest = convertBuildPaths(sassDepsPath_src, options.buildDir, '.sass', '.css');
    var jsDest = convertBuildPaths(jsDepsPath_src, options.buildDir, '', '');
    var nodeDest = mapNodeModulesSrcToBuil(options.buildDir);
    //TODO: Implement Bower resource management
    //process.stdout.write(cssDest)
    var run1 = function () {
        gulp.src(htmlDepsPaths_Src, {base: BASE_DIR})
            .pipe(gulp.dest(options.buildDir));
    }
    var run = function () {
        gulp.src(['./app/index.html'], {base: BASE_DIR})
            //.pipe(changed(options.buildDir))
            .pipe(plumber({errorHandler: onError}))
            .pipe(gulp.dest(options.buildDir))
            .pipe(inject(gulp.src(cssDest, {read: false}), {relative: true}))
            .pipe(inject(gulp.src(nodeDest, {read: false}), {
                relative: true,
                name: 'node'
            }))//TODO: Need inject from other source in PROD for node libs
            .pipe(inject(gulp.src(jsDest, {read: false}), {relative: true}))
            //.pipe(replace('<%IMPORT_APP%>', './dev'))
            .pipe(gulp.dest(options.buildDir));
    }
    run();
    run1();
    if (options.watch) {
        gulp.watch(htmlDepsPaths_Src, run1)
            .on('change', function (e) {
                logOnChange(e)
            });
        gulp.watch(['./app/index.html'], run)
            .on('change', function (e) {
                logOnChange(e)
            });
    }
}

//NOTE: Run gulp css, js, ts first
gulp.task('5_html.dev', function () {
    var options = {devBuild: true, minify: false, watch: false, buildDir: BUILD_DIR_DEV};
    htmlTask(options);
});
gulp.task('5_html.dev.watch', function () {
    var options = {devBuild: true, minify: false, watch: true, buildDir: BUILD_DIR_DEV};
    htmlTask(options);
});


/*-----------------------------------------
 * LIBS
 *----------------------------------------*/
var libTask = function (options, callback) {
    var run = function () {
        gulp.src(nodeModulesSrc, {base: BASE_DIR})
            .pipe(plumber({errorHandler: onError}))
            .pipe(gulp.dest(options.buildDir + '/assets/lib/node-modules'))
            .on('end', function () {
                if (typeof callback !== 'undefined') {
                    callback();
                }
            });
    }
    run();
}
gulp.task('6_lib.dev', function () {
    var options = {devBuild: true, minify: false, watch: false, buildDir: BUILD_DIR_DEV};
    libTask(options);
})


/*-----------------------------------------
 * ALL DEV
 *----------------------------------------*/
gulp.task('4_all.dev.!html', ['1_sass.dev', '2_js.dev', '3_ts.dev'])
gulp.task('4_all.dev.watch.!html', ['1_sass.dev.watch', '2_js.dev.watch', '3_ts.dev.watch'])

gulp.task('4_all.dev', function () {
    var options = {devBuild: true, minify: false, watch: false, buildDir: BUILD_DIR_DEV};
    sassTask(options, function () {
        jsTask(options, function () {
            tsTask(options, function () {
                libTask(options, function () {
                    htmlTask(options);
                });
            });
        });
    });
});
gulp.task('4_all.dev.watch', function () {
    var options = {devBuild: true, minify: false, watch: true, buildDir: BUILD_DIR_DEV};
    sassTask(options, function () {
        jsTask(options, function () {
            tsTask(options, function () {
                libTask(options, function () {
                    htmlTask(options);
                });
            });
        });
    });
});


/*-----------------------------------------
 * CLEAN
 *----------------------------------------*/
gulp.task('clean.js', function () {
    del(BUILD_DIR_DEV + '/assets/**/*.js')
});
gulp.task('clean.css', function () {
    del(BUILD_DIR_DEV + '/assets/**/*.css')
});

gulp.task('clean.ts.dev', function () {
    del(convertBuildPaths(tsDepsPath_src, BUILD_DIR_DEV, '.ts', '.js'))
});
gulp.task('clean.ts.prod', function () {
    del(convertBuildPaths(tsDepsPath_src, BUILD_DIR_PROD, '.ts', '.js'))
});
gulp.task('clean.all.dev', function () {
    del('__build__/dev')
});

gulp.task('clean.all.prod', function () {
    del('__build__/prod')
});

gulp.task('clean.all', function () {
    del('__build__')
});


/*-----------------------------------------
 * BROWSER
 *----------------------------------------*/
gulp.task('0_browse.dev', function () {
    //http://www.browsersync.io/docs/options/
    browserSync.init([BUILD_DIR_DEV + "/**/*.html",
        BUILD_DIR_DEV + "/**/*.css",
        BUILD_DIR_DEV + "/**/*.js",
    ], {
        server: {
            baseDir: BUILD_DIR_DEV
        }
    });
    //gulp.watch([BUILD_DIR_DEV + "/**/*.html",
    //    BUILD_DIR_DEV + "/**/*.css",
    //    BUILD_DIR_DEV + "/**/*.js",
    //]).on('change', browserSync.reload);
});

gulp.task('0_Exit-sever.dev', browserSync.exit);


/*-----------------------------------------
 * UTILS
 *----------------------------------------*/

function logOnChange(e) {
    console.log('File ' + e.path + ' was ' + e.type + ' and commited');
    //browserSync.reload;
}
var onError = function (err) {
    notify.onError({
        title: "Gulp",
        subtitle: "Failure!",
        message: "Error: <%= error.message %>",
        sound: "Beep"
    })(err);

    this.emit('end');
};


function convertBuildPaths(srcPaths, buildDir, replaceExt, byExt) {
    var paths = new Array();
    srcPaths.forEach(function (item) {
        var replace = item.replace('./app', buildDir).replace(replaceExt, byExt);
        paths.push(replace)
    });
    return paths;
}

function mapNodeModulesSrcToBuil(buildDir) {
    var paths = new Array();
    nodeModulesSrc.forEach(function (item) {
        var replace = item.replace('./node_modules', buildDir + '/assets/lib/node_modules');
        paths.push(replace)
    });
    return paths;
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
