'use strict';

// HANDLE PORTS AND ENVIRONMENT VARIABLES
const DB_PORT           = process.env.MONGOLAB_URI || 'mongodb://localhost/db';
const API_PORT          = process.env.API_PORT || 3000;

// LOAD NPM MODULES
const express           = require('express');
const bodyParser        = require('body-parser').json();
const mongoose          = require('mongoose');
const Promise           = require('bluebird');
const morgan            = require('morgan');
const debug             = require('debug')('SERVER');

// LOAD CUSTOM MIDDLEWARES
const errMidware        = require(`${__dirname}/lib/error-response-middleware`);
// const basicAuthMidware  = require(`${__dirname}/lib/basic-authentication-middleware`);
// const tokenAuthMidware  = require(`${__dirname}/lib/token-authentication-middleware`);

// LOAD ROUTERS
const newAccountRouter  = require(`${__dirname}/routes/new-account`);
// const loginRouter       = require(`${__dirname}/routes/login`);
// const listsRouter       = require(`${__dirname}/routes/new-account`);
// const itemsRouter       = require(`${__dirname}/routes/new-account`);

// HANDLE SETUP 
const app               = express();
// Promise.promisifyAll(mongoose);

// HANDLE DATABASE SETUP 
mongoose.connect(DB_PORT);

// ////////////////////////////////////////
// CONFIGURE EXPRESS
// ATTACH SHARED MIDDLEWARE 
app.use(morgan('dev'));
app.use(bodyParser); 
app.use((req, res, next) => {
  debug('a request was made');
  res.header('Access-Control-Allow-Origin', `http://localhost:${API_PORT}`);
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// UNAUTHENTICATED ROUTES
app.use('/new-account', newAccountRouter);
// app.use('/login', basicAuthMidware, loginRouter);

// AUTHENTICATED ROUTES 
// app.use(tokenAuthMidware);
// app.use('/lists', listsRouter);
// app.use('/items', itemsRouter);


// FINISH SETUP
app.all('*', function return404NotFound(_, res) {
  debug('*:404');
  return res.status(404).send('Not Found');
});
app.use(errMidware);
let server = app.listen(API_PORT, () => {
  debug(`listening on ${API_PORT}`);
});

// ATTACH PROPERTIES FOR TESTING
server.isRunning  = true;
module.exports    = server;
