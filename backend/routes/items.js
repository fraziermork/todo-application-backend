'use strict';

const appError    = require(`${__dirname}/../lib/app-error`);
const User        = require(`${__dirname}/../resources/user/user-model`);

const itemsRouter = require('express').Router();
module.exports    = itemsRouter;
