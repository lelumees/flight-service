'use strict';

const configuration = require('../configuration');
const knex = require('knex');

const flightsDb = knex({
    client: 'mysql2',
    connection: {
        host: configuration.mysql.host,
        port: configuration.mysql.port,
        user: configuration.mysql.user,
        password: configuration.mysql.password,
        database: configuration.mysql.flightsDatabase
    }
});

module.exports = {
    flightsDb: flightsDb
};
