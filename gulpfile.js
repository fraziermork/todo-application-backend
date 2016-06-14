'use strict';

const gulp    = require('gulp');
const eslint  = require('gulp-eslint');
const mocha   = require('gulp-mocha');


const PATHS   = {
  js:    [`${__dirname}/backend/**/*.js`], 
  tests: [`${__dirname}/backend/test/*-test.js`]
};

gulp.task('eslint', () => {
  return gulp.src(PATHS.js)
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('test', () => {
  return gulp.src(PATHS.tests)
    .pipe(mocha());
});

gulp.task('default', ['eslint', 'test']);
