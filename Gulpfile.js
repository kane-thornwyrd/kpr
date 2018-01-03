const plumber = require('gulp-plumber');
const through = require('through2');
const chalk = require('chalk');
const newer = require('gulp-newer');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const log = require('fancy-log');
const filter = require('gulp-filter');
const gulp = require('gulp');
const path = require('path');
const merge = require('merge-stream');

const sources = ['packages'];

/**
 * Change the src in the path for lib
 *
 * @param      {string}    srcPath  The source path
 * @return     {string}  the new path
 */
function swapSrcWithLib(srcPath) {
  const parts = srcPath.split(path.sep);
  parts[1] = 'lib';
  return parts.join(path.sep);
}

/**
 * Generate a proper glob string given a source
 *
 * @param      {string}  source  The source
 * @return     {string}  The glob from source.
 */
function getGlobFromSource(source) {
  return `./${source}/*/src/**/*.js`;
}

gulp.task('default', ['build']);

gulp.task('build', () => {
  return merge(sources.map(source => {
    const base = path.join(__dirname, source);
    const f = filter(['**']);

    return gulp
      .src(getGlobFromSource(source), { base })
      .pipe(f)
      .pipe(plumber({
        errorHandler(err) {
          log(err.stack);
        },
      }))
      .pipe(newer({
        dest: base,
        map: swapSrcWithLib,
      }))
      .pipe(through.obj((file, enc, callback) => {
        log('Compiling', `'${chalk.cyan(file.relative)}'...`);
        callback(null, file);
      }))
      .pipe(babel())
      .pipe(through.obj((file, enc, callback) => {
        // Passing 'file.relative' because newer() above uses a relative
        // path and this keeps it consistent.
        file.path = path.resolve(file.base, swapSrcWithLib(file.relative));
        callback(null, file);
      }))
      .pipe(gulp.dest(base));
  }));
});

gulp.task('watch', ['build'], () => {
  watch(sources.map(getGlobFromSource), { debounceDelay: 200 }, () => {
    gulp.start('build');
  });
});
