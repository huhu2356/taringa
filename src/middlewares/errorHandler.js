const { v4: uuidv4 } = require('uuid');

const Logger = require('../loaders/logger');
const { ERROR_CODES } = require('../errors/index');

module.exports = () => {
    return async (ctx, next) => {
        ctx.requestId = uuidv4();
        try {
            const data = await next();
            // ctx.body = {
            //     code: ERROR_CODES.SUCCESS,
            //     success: true,
            //     requestId: ctx.requestId,
            //     data,
            // };

            ctx.body = {
                result: data,
            };

            Logger.info(
                'url: %s, method: %s, body: %O, response: %O',
                ctx.request.url,
                ctx.request.method,
                ctx.request.body,
                ctx.body,
            );
        } catch (error) {
            ctx.body = {
                code: error.code || ERROR_CODES.ERR_SERVER,
                success: false,
                requestId: ctx.requestId,
                errorMsg: error.msg || 'server internal error',
            };

            Logger.error(
                'url: %s, method: %s, body: %O, response: %O, stack: %s',
                ctx.request.url,
                ctx.request.method,
                ctx.request.body,
                ctx.body,
                error.stack,
            );
        }
    };
};
