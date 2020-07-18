const Logger = require('./logger');
const mongooseLoader = require('./mongoose');
const koaLoader = require('./koa');

module.exports = async ({ koaApp }) => {
    const mongoConnection = await mongooseLoader();
    Logger.info('✌️ DB loaded and connected!');

    await koaLoader({ app: koaApp });
    Logger.info('✌️ Koa loaded');
};
