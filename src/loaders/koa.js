const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

const router = require('../routes');
const errorHandler = require('../middlewares/errorHandler');
const throttling = require('../middlewares/throttling');

module.exports = ({ app }) => {
    app.use(cors());

    app.use(bodyParser());

    app.use(errorHandler());

    app.use(throttling());

    app.use(router.routes());

    app.use(router.allowedMethods());
};
