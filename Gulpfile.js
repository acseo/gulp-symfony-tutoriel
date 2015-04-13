var gulp = require('gulp');

var sass = sass = require('gulp-sass');

gulp.task('sass', function () {
    gulp.src('./web/bundles/front/sass/master.scss')
        .pipe(sass({sourceComments: 'map', errLogToConsole: true}))
        .pipe(gulp.dest('./web/css/'));
});

var copy = copy = require('gulp-copy');

gulp.task('fonts', function () {
    return gulp.src('./web/components/bootstrap-sass-official/assets/fonts/bootstrap/*')
        .pipe(copy('./web/fonts', {prefix: 7}));
});

gulp.task('js', function() {
    gulp.src([
            './web/bundles/*/js/**/*.js',
            './web/components/bootstrap-sass-official/assets/javascripts/bootstrap/*.js',
            './web/components/jquery/dist/jquery.js',
            './web/components/requirejs/require.js'
        ])
        .pipe(gulp.dest('./web/js'));
});

var livereload = require('gulp-livereload');

gulp.task('watch', function () {
    var onChange = function (event) {
        console.log('File '+event.path+' has been '+event.type);
        // Tell LiveReload to reload the window
        livereload.changed(event.path);
    };
    // Starts the server
    livereload.listen();
    gulp.watch('./src/*/Resources/public/sass/**/*.scss', ['sass'])
        .on('change', onChange);
    gulp.watch('./src/*/Resources/public/js/**/*.js', ['js'])
        .on('change', onChange);
});

var phpunit = phpunit = require('gulp-phpunit');

gulp.task('test', function () {
    return gulp.src('./src/*/Tests/**/*.php')
        .pipe(phpunit('phpunit', {debug: false, configurationFile: './app/phpunit.xml'}));
});

gulp.task('coverage', function () {
    return gulp.src('./src/*/Tests/**/*.php')
        .pipe(phpunit(
            'phpunit',
            {debug: false, configurationFile: './app/phpunit.xml', coverageHtml: './build/coverage'}
        ));
});

var phpcs = require('gulp-phpcs');

gulp.task('checkstyle', function () {
    return gulp.src(['src/**/*.php'])
        .pipe(phpcs({bin: 'phpcs', standard: 'PSR2', warningSeverity: 0}))
        .pipe(phpcs.reporter('log'));
});


var exec = require('child_process').exec;

gulp.task('installAssets', function () {
    exec('php app/console assets:install --symlink', logStdOutAndErr);
});

// Without this function exec() will not show any output
var logStdOutAndErr = function (err, stdout, stderr) {
    console.log(stdout + stderr);
};

gulp.task('verify', ['coverage', 'checkstyle']);
