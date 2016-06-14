'use strict';

const express = require('express');
const app     = express();
const port    = process.env.CLIENT_PORT || 8080;

app.use(express.static(`${__dirname}/frontend/build`));
app.listen(port, () => {
  console.log(`Angular todo client up on ${port}`);
});
