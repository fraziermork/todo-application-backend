'use strict';

const gulp    = require('gulp');
const eslint  = require('gulp-eslint');
const mocha   = require('gulp-mocha');
const del     = require('del');
const webpack = require('webpack-stream');


const PATHS   = {
  frontend:     [`${__dirname}/frontend/**/*.js`],
  backend:      [`${__dirname}/backend/**/*.js`], 
  backendTests: [`${__dirname}/backend/test/*-test.js`], 
  html:         [`${__dirname}/frontend/app/main/index.html`, `${__dirname}/frontend/app/components/**/*.html`], 
  bootstrap:    [`${__dirname}/node_modules/bootstrap/dist/css/bootstrap.min.css`], 
  build:        `${__dirname}/frontend/build`, 
  webpack:      [`${__dirname}/frontend/app/entry.js`, `${__dirname}/webpack.config.js`]
};

gulp.task('eslint', () => {
  return gulp.src(PATHS.backend.concat(PATHS.frontend))
    .pipe(eslint())
    .pipe(eslint.format());
});

// ///////////////////////////////////////////////
// FRONTEND
gulp.task('app:build-clear', () => {
  return del(PATHS.build + '/*');
});
gulp.task('app:build-bootstrap', () => {
  return gulp.src(PATHS.bootstrap)
    .pipe(gulp.dest(PATHS.build));
});
gulp.task('app:build-html', () => {
  return gulp.src(PATHS.html)
    .pipe(gulp.dest(PATHS.build));
});
gulp.task('app:build-js', () => {
  return gulp.src(PATHS.webpack[0])
    .pipe(webpack(require(PATHS.webpack[1])))
    .pipe(gulp.dest(PATHS.build));
});
gulp.task('app:build-all', ['app:build-clear', 'app:build-bootstrap', 'app:build-html', 'app:build-js']);
gulp.task('app:watch', () => {
  gulp.watch(`${__dirname}/frontend/**`, ['app:build-all']);
});

// ///////////////////////////////////////////////
// BACKEND
gulp.task('test:api', () => {
  return gulp.src(PATHS.backendTests)
    .pipe(mocha());
});

gulp.task('default', ['eslint', 'test:api']);
