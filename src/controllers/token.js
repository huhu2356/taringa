const BaseController = require('./base');
const ContractTokenService = require('../services/contractToken');
const NativeTokenService = require('../services/nativeToken');
const { integerToWei, integerFromWei } = require('../util/rskUtil');

module.exports = class TokenController extends BaseController {
    findTokenService(symbol, type) {
        if (symbol === 'RBTC') {
            return new NativeTokenService(this.ctx, symbol, type);
        }

        return new ContractTokenService(this.ctx, symbol, type);
    }

    async getBalance({ address, type, symbol }) {
        const service = this.findTokenService(symbol, type);
        const balance = await service.getBalance(address);
        const balanceOfETH = integerFromWei(balance);

        return balanceOfETH;
    }

    async createRawTransaction({ type, symbol, sender, receiver, value }) {
        const service = this.findTokenService(symbol, type);
        const valueOfWei = integerToWei(value);
        const res = await service.createRawTransaction({ sender, receiver, value: valueOfWei });
        return res;
    }

    async sendTokens({ type, symbol, sender, receiver, value }) {
        const service = this.findTokenService(symbol, type);
        const valueOfWei = integerToWei(value);
        const res = await service.sendTokens({ sender, receiver, value: valueOfWei });
        return res;
    }

    async sendAllTokens({ type, symbol, sender, receiver }) {
        const service = this.findTokenService(symbol, type);
        const res = await service.sendTokens({ sender, receiver });
        return res;
    }
};
