const AccessUser = require('../models/accessUser');

module.exports = () => {
    return async (ctx, next) => {
        const { headers } = ctx.req;
        const apiKey = headers['taringa-api-key'];

        if (!apiKey) {
            throw new Error('Invalid Taringa-API-Key');
        }

        const accessUser = await AccessUser.findOne({
            apiKey,
        });

        if (!accessUser) {
            throw new Error('Invalid Taringa-API-Key');
        }

        return next();
    };
};
