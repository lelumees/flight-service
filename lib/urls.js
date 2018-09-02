'use strict';

const Url = require('url');

const resolve = (context) => {
    return (name, parameters) => {
        const path = context.urls.routes.url(name, parameters);
        return Url.resolve(context.href, path);
    };
};

module.exports = (routes) => {
    return async(context, next) => {
        context.urls = {
            routes: routes,
            resolve: resolve(context)
        };
        return await next();
    };
};
