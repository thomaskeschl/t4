var gulp = require('gulp');
var del = require('del');

var connect = require('gulp-connect');

var runSequence = require('run-sequence');
var mergeStreams = require('event-stream').merge;

var karma = require('karma').server;

var path = {
    src: ['./src/app/**/*.js'],
    serverSrc: ['./src/server/**/*.js'],
    srcCopy: ['./src/app/**/*.html', './src/app/**/*.css'],
    test: ['./test/**/*.js'],
    deps: {},
    depsCopy: [
        './node_modules/angular/angular.js'
    ],
    output: 'dist/app',
    serverOutput: 'dist',
    outputLib: 'dist/app/lib',
    outputTest: 'dist_test'
};

gulp.task('clean', function (cb) {
    // remove the contents of the output directories
    del([
        path.output + '/**',
        path.serverOutput + '/**',
        path.outputTest + '/**'
    ], cb);
});

gulp.task('build_source', function () {
    var assetStream = gulp.src(path.srcCopy)
        .pipe(gulp.dest(path.output));
    var sourceStream = gulp.src(path.src)
        .pipe(gulp.dest(path.output));
    var serverStream = gulp.src(path.serverSrc)
        .pipe(gulp.dest(path.serverOutput));
    return mergeStreams(sourceStream, serverStream, assetStream);
});

gulp.task('build_test', function () {
    return gulp.src(path.test)
        .pipe(gulp.dest(path.outputTest));
});

var createDepStream = function (prop) {
    return gulp.src(path.deps[prop])
        .pipe(gulp.dest(path.outputLib + '/' + prop));
};

gulp.task('build_deps', function () {
    var assetStream = gulp.src(path.depsCopy)
        .pipe(gulp.dest(path.outputLib));
    var depStreams = Object.keys(path.deps).map(createDepStream);
    var streams = depStreams.concat(assetStream);
    return mergeStreams.apply(null, streams);
});

gulp.task('build', function (done) {
    // By using runSequence here we are decoupling the cleaning from the rest of the build tasks
    // Otherwise, we have to add clean as a dependency on every task to ensure that it completes
    // before they begin.
    runSequence(
        'clean',
        ['build_source', 'build_deps', 'build_test'],
        done
    );
});

// WATCH FILES FOR CHANGES
gulp.task('watch', function () {
    gulp.watch([path.src, path.srcCopy], ['build_source']);
    gulp.watch([path.test], ['build_test']);
    var deps = Object.keys(path.deps).map(function (key) {
        return path.deps[key];
    });
    gulp.watch([deps], ['build_deps']);
});

// WEB SERVER
gulp.task('serve', function () {
    connect.server({
        root: [__dirname + '/' + path.output],
        port: 8000,
        livereload: false,
        open: false
    })
});

// RUN TESTS
gulp.task('test', ['build'], function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});