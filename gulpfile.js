'use strict';

const gulp    = require('gulp');
const eslint  = require('gulp-eslint');
const mocha   = require('gulp-mocha');
// const del     = require('del');
// const webpack = require('webpack-stream');


const PATHS   = {
  backend: [`${__dirname}/backend/**/*.js`], 
  backendTests: [`${__dirname}/backend/test/*-test.js`]
};

gulp.task('eslint', () => {
  return gulp.src(PATHS.backend)
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('test:api', () => {
  return gulp.src(PATHS.backendTests)
    .pipe(mocha());
});

gulp.task('default', ['eslint', 'test:api']);
