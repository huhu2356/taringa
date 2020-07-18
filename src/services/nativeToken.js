const Rsk3 = require('@rsksmart/rsk3');

const TokenService = require('./token');
const tokensData = require('../config/tokens.json');

module.exports = class NativeTokenService extends TokenService {
    constructor(ctx, symbol, type) {
        super(ctx);
        this.symbol = symbol;
        this.type = type;

        const rsk3Url = ctx.config.rsk3[type.toLowerCase()];
        this.rsk3 = new Rsk3(rsk3Url);

        const tokenData = tokensData.find(token => token.symbol === symbol && token.type === type);
        this.tokenData = tokenData;
    }

    async getBalance(address) {
        const convertAddr = Rsk3.utils.toChecksumAddress(address);
        const resBalance = await this.rsk3.getBalance(convertAddr);
        const balance = Rsk3.utils.toHex(resBalance);

        return balance;
    }
};
