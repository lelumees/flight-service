'use strict';

require('dotenv').config();

const configuration = require('./lib/configuration');
const app = require('./lib/app');

const server = app.listen(configuration.port);
console.log('Listening on %s:%s', 'localhost', configuration.port);

module.exports = server;
