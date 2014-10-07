(function() {

    var dependencies  = 'example/js/application/**/*.js',
        distributions = { dev: 'earth.js', prod: 'earth.min.js' };

    var gulp   = require('gulp'),
        uglify = require('gulp-uglify'),
        copy   = require('gulp-copy'),
        concat = require('gulp-concat'),
        notify = require('gulp-notify'),
        jshint = require('gulp-jshint');

    gulp.task('build', function() {

        gulp.src(dependencies)
            .pipe(concat(distributions.dev))
            .pipe(gulp.dest('./dist/'))
            .pipe(concat(distributions.prod))
            .pipe(gulp.dest('./dist/'))
            .pipe(uglify())
            .pipe(gulp.dest('dist'))
            .pipe(notify('Build Complete.'));

    });

    gulp.task('hint', function gulpHint() {

        return gulp.src(dependencies)
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('default'))
            .pipe(notify('Tests Complete.'));
        
    });

    gulp.task('test', ['hint']);
    gulp.task('default', ['test', 'build']);

})();