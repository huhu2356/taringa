const Router = require('@koa/router');

const ChainController = require('../controllers/chain');
const TokenController = require('../controllers/token');

const router = new Router();

router.post('/getBalance', async ctx => {
    const { address, type, symbol } = ctx.request.body;
    const controller = new TokenController(ctx);
    return await controller.getBalance({ address, type, symbol });
});

router.post('/sendSignedTransaction', async ctx => {
    const { name, type, hash } = ctx.request.body;
    const controller = new ChainController(ctx);
    return await controller.sendSignedTransaction({ name, type, hash });
});

router.post('/getTransactions', async ctx => {
    const { chain, type, symbol, address, page = 1, pageSize = 50 } = ctx.request.body;
    const controller = new ChainController(ctx);
    return await controller.getTransactions({ chain, type, symbol, address, page, pageSize });
});

router.post('/generateAddresses', async ctx => {
    const { chain, type, symbol, amount } = ctx.request.body;
    const controller = new ChainController(ctx);
    return await controller.generateAddresses({ chain, type, symbol, amount });
});

router.post('/addAddress', async ctx => {
    const { chain, type, symbol, address } = ctx.request.body;
    const controller = new ChainController(ctx);
    await controller.addAddress({ chain, type, symbol, address });
    return true;
});

router.post('/formatRawTransaction', async ctx => {
    const { type, symbol, sender, receiver, value } = ctx.request.body;
    const controller = new TokenController(ctx);
    return await controller.createRawTransaction({ type, symbol, sender, receiver, value });
});

router.post('/sendTokens', async ctx => {
    const { type, symbol, sender, receiver, value } = ctx.request.body;
    const controller = new TokenController(ctx);
    return await controller.sendTokens({ type, symbol, sender, receiver, value });
});

router.post('/sendAllTokens', async ctx => {
    const { type, symbol, sender, receiver } = ctx.request.body;
    const controller = new TokenController(ctx);
    return await controller.sendAllTokens({ type, symbol, sender, receiver });
});

router.all('/', async () => {
    return `taringa server is run in ${process.env.NODE_ENV}`;
});

module.exports = router;
