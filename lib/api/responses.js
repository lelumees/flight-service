'use strict';

module.exports = {
    success(context, data) {
        context.body = data;
        context.status = data ? 200 : 204;
    },
    redirect(context, uri) {
        context.redirect(uri);
    },
    badRequest(context, errors) {
        context.body = {
            message: 'Check your request parameters',
            errors: errors
        };
        context.status = 400;
    },
    unauthorized(context) {
        context.status = 401;
    },
    notFound(context) {
        context.body = { messsage: 'Resource was not found' };
        context.status = 404;
    },
    validationFailed(context, errors) {
        context.body = {
            message: 'Resource validation failed',
            errors: errors
        };
        context.status = 422;
    }
};
