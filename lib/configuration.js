'use strict';

const _ = require('lodash');

module.exports = {
    port: _.get(process.env, 'PORT', 3000),
    router: {
        prefix: '/api'
    },
    authorization: {
        secret: _.get(process.env, 'AUTH_SECRET')
    },
    mysql: {
        host: _.get(process.env, 'MYSQL_HOST'),
        port: _.get(process.env, 'MYSQL_PORT'),
        user: _.get(process.env, 'MYSQL_USER'),
        password: _.get(process.env, 'MYSQL_PASSWORD'),
        flightsDatabase: _.get(process.env, 'MYSQL_FLIGHTS_DATABASE'),
    }
};
