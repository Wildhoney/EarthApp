(function() {

    var dependencies  = 'example/js/application/**/*.js',
        distributions = { dev: 'earth.js', prod: 'earth.min.js' };

    var gulp   = require('gulp'),
        uglify = require('gulp-uglify'),
        copy   = require('gulp-copy'),
        concat = require('gulp-concat'),
        jshint = require('gulp-jshint');

    gulp.task('build', function() {

        gulp.src(dependencies)
            .pipe(concat(distributions.dev))
            .pipe(gulp.dest('./dist/'))
            .pipe(concat(distributions.prod))
            .pipe(gulp.dest('./dist/'))
            .pipe(uglify())
            .pipe(gulp.dest('dist'))

    });

    gulp.task('hint', function gulpHint() {

        return gulp.src(dependencies)
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('default'));
    });

    gulp.task('test', ['hint']);
    gulp.task('default', ['test', 'build']);

})();