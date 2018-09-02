'use strict';

const configuration = require('./configuration');
const router = require('./routes');
const urls = require('./urls')(router);
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-jwt')({
    secret: configuration.authorization.secret
}).unless({
    path: [new RegExp(`^${configuration.router.prefix}/health`)]
}));

app.use(logger());
app.use(bodyParser());
app.use(urls);
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
