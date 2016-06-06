'use strict';

const appError    = require(`${__dirname}/../lib/app-error`);
const User        = require(`${__dirname}/../resources/user/user-model`);

const loginRouter = require('express').Router();
module.exports    = loginRouter;
