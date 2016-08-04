'use strict';

// HANDLE PORTS AND ENVIRONMENT VARIABLES
// using MONGODB_URI
const DB_PORT           = process.env.MONGODB_URI || 'mongodb://localhost/db';
const API_PORT          = process.env.PORT || 3000;
const CLIENT_URL        = process.env.CLIENT_URL || 'http://localhost:8080';
console.log(`DB_PORT: ${DB_PORT}`);
console.log(`API_PORT: ${API_PORT}`);
console.log(`CLIENT_URL: ${CLIENT_URL}`);
// LOAD NPM MODULES
const express           = require('express');
const bodyParser        = require('body-parser').json();
const cookieParser      = require('cookie-parser');
const mongoose          = require('mongoose');
const Promise           = require('bluebird');
const morgan            = require('morgan');
const debug             = require('debug')('todo:server');
const cors              = require('cors');

// LOAD CUSTOM MIDDLEWARES
const errMidware        = require(`${__dirname}/lib/error-response-middleware`);
const basicAuthMidware  = require(`${__dirname}/lib/basic-authentication-middleware`);
const tokenAuthMidware  = require(`${__dirname}/lib/token-authentication-middleware`); // attaches authenticated user as req.user 
const getListMidware    = require(`${__dirname}/lib/get-list-middleware`); // attaches list w/ listId as req.list

// LOAD ROUTERS
const newAccountRouter  = require(`${__dirname}/routes/new-account`);
const loginRouter       = require(`${__dirname}/routes/login`);
const listsRouter       = require(`${__dirname}/routes/lists`);
const itemsRouter       = require(`${__dirname}/routes/items`);

// HANDLE SETUP 
const app               = express();
Promise.promisifyAll(mongoose);

// HANDLE DATABASE SETUP 
mongoose.connect(DB_PORT);

// ////////////////////////////////////////
// CONFIGURE EXPRESS
// ATTACH SHARED MIDDLEWARE 
app.use(morgan('dev'));
app.use(bodyParser); 
// TODO: put in deployment url
app.use(cors({ 
  origin:      CLIENT_URL,
  credentials: true,
  allowedHeaders: [
    'X-XSRF-TOKEN', 
    'authorization',
    'content-type',
    'accept'
  ]
}));

// UNAUTHENTICATED ROUTES
app.use('/new-account', newAccountRouter);
app.use('/login', basicAuthMidware, loginRouter);

// AUTHENTICATED ROUTES 
app.use(cookieParser());
app.use(tokenAuthMidware);
app.use('/lists', listsRouter);
app.use('/lists/:listId/*', getListMidware);
app.use('/lists/:listId/items', itemsRouter);


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
