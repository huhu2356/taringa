const BaseController = require('./base');
const RootstockChainService = require('../services/rootstockChain');

module.exports = class ChainController extends BaseController {
    findChainService(name, type) {
        if (name === 'Rootstock') {
            return new RootstockChainService(this.ctx, name, type);
        }
    }

    async sendSignedTransaction({ name, type, hash }) {
        const service = this.findChainService(name, type);
        const res = await service.sendSignedTransaction(hash);
        return res;
    }

    async addAddress({ chain, type, symbol, address }) {
        const service = this.findChainService(chain, type);
        const res = await service.addAddress({ chain, type, symbol, address });
        return res;
    }

    async getTransactions({ chain, type, symbol, address, page, pageSize }) {
        const service = this.findChainService(chain, type);
        const { count, list } = await service.getTransactions({ chain, type, symbol, address, page, pageSize });

        return {
            count,
            list,
            page,
            pageSize,
        };
    }

    async generateAddresses({ chain, type, symbol, amount }) {
        const service = this.findChainService(chain, type);
        const addrs = await service.saveGenerateAddresses({ chain, type, symbol, amount });
        return addrs;
    }
};
