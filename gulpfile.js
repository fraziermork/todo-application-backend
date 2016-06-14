'use strict';

const gulp    = require('gulp');
const eslint  = require('gulp-eslint');
const mocha   = require('gulp-mocha');


const PATHS   = {
  backend:      [`${__dirname}/backend/**/*.js`], 
  backendTests: [`${__dirname}/backend/test/*-test.js`]
};

gulp.task('eslint', () => {
  return gulp.src(PATHS.backend)
    .pipe(eslint())
    .pipe(eslint.format());
});


// ///////////////////////////////////////////////
// BACKEND
gulp.task('test', () => {
  return gulp.src(PATHS.backendTests)
    .pipe(mocha());
});

gulp.task('default', ['eslint', 'test']);
