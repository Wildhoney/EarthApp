(function() {

    var yaml   = require('js-yaml'),
        fs     = require('fs'),
        config = yaml.safeLoad(fs.readFileSync('.gulp.yml', 'utf8'));

    var dependencies  = 'example/js/application/**/*.js',
        distributions = { dev: 'earth.js', prod: 'earth.min.js' };

    var gulp   = require('gulp'),
        uglify = require('gulp-uglify'),
        copy   = require('gulp-copy'),
        concat = require('gulp-concat'),
        notify = require('gulp-notify'),
        jshint = require('gulp-jshint');

    gulp.task('build', function() {

        gulp.src(config.input)
            .pipe(concat(config.output.development))
            .pipe(gulp.dest(config.output.directory))
            .pipe(concat(config.output.production))
            .pipe(gulp.dest(config.output.directory))
            .pipe(uglify())
            .pipe(gulp.dest(config.output.directory))
            .pipe(notify('Build Complete.'));

    });

    gulp.task('hint', function gulpHint() {

        return gulp.src(config.input)
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('default'))
            .pipe(notify('Tests Complete.'));

    });

    gulp.task('test', ['hint']);
    gulp.task('default', ['test', 'build']);

})();