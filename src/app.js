const Koa = require('koa');

const config = require('./config');
const Logger = require('./loaders/logger');

async function startServer() {
    const app = new Koa();

    app.config = config;
    app.context.config = config;

    await require('./loaders')({ koaApp: app });

    app.listen(config.port, () => {
        Logger.info(`
        ################################################
        🛡️  Server listening on port: ${config.port} 🛡️ 
        ################################################
        `);
    });
}

startServer();
