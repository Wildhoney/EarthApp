(function() {

    var dependencies  = ['example/js/*.js', 'example/js/*/**.js'],
        distributions = { dev: 'earth.min.js', prod: 'earth.js' };

    var gulp   = require('gulp'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        jshint = require('gulp-jshint');

//    gulp.task('build', function gulpBuild(){
//        gulp.src(mainModule)
//            .pipe(rename(devDist))
//            .pipe(gulp.dest('dist'))
//            .pipe(gulp.dest(vendorDest))
//            .pipe(rename(minDist))
//            .pipe(uglify())
//            .pipe(gulp.dest('dist'))
//    });

    gulp.task('hint', function gulpHint() {

        return gulp.src(dependencies)
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('default'));
    });

    gulp.task('test', ['hint', 'karma']);
    gulp.task('default', ['hint', 'test']);

})();