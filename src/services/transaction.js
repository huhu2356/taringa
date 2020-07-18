const Rsk3 = require('@rsksmart/rsk3');
const _ = require('lodash');

const BaseService = require('./base');
const RskService = require('./rskApi');
const tokensData = require('../config/tokens.json');

const NET_WORK_ID = {
    ROOTSTOCK: {
        Testnet: 37310,
        Mainnet: 137,
    },
};

module.exports = class TransactionService extends BaseService {
    constructor(ctx) {
        super(ctx);
        this.contractTokens = tokensData.filter(token => token.symbol !== 'RBTC');
    }

    distinguishCoinTx(tx, type) {
        const cloneTx = _.cloneDeep(tx);
        cloneTx.symbol = 'RBTC';
        cloneTx.confirmedAt = cloneTx.timestamp ? new Date(cloneTx.timestamp * 1000) : new Date();
        cloneTx.receivedAt = cloneTx.timestamp ? new Date(cloneTx.timestamp * 1000) : new Date();

        const to = cloneTx.to && Rsk3.utils.toChecksumAddress(cloneTx.to, NET_WORK_ID.ROOTSTOCK[type]);
        _.forEach(this.contractTokens, ({ address: contractAddr, type: tokenType, symbol }) => {
            if (type !== tokenType) {
                return;
            }

            const contractCheckSumAddr = Rsk3.utils.toChecksumAddress(contractAddr, NET_WORK_ID.ROOTSTOCK[type]);
            if (to === contractCheckSumAddr) {
                const resDecode = this.decodeTransaction(tx, type);
                if (_.isNull(resDecode)) {
                    return;
                }

                const { to: actualTo, value } = resDecode;
                Object.assign(cloneTx, { symbol, value, to: actualTo });
                return false;
            }
        });

        if (cloneTx.symbol === 'RBTC' && cloneTx.input !== '0x') {
            try {
                cloneTx.memo = Rsk3.utils.hexToUtf8(cloneTx.input);
            } catch (_err) {}
        }

        return cloneTx;
    }

    decodeTransaction(tx, type) {
        try {
            const { rsk3 } = new RskService(this.ctx, type);

            const typesArray = ['address', 'uint256'];
            // remove first 4 bytes function signature to get params encode string
            const paramsInput = `0x${tx.input.slice(10)}`;
            const resDecodeData = rsk3.abiCoder.decodeParameters(typesArray, paramsInput);
            const receiverAddr = resDecodeData['0'];
            const transderVal = resDecodeData['1'];

            if (!_.isUndefined(receiverAddr) && !_.isUndefined(transderVal)) {
                const to = Rsk3.utils.toChecksumAddress(receiverAddr, NET_WORK_ID.ROOTSTOCK[type]);
                const value = transderVal.toString(10);

                return { to, value };
            }

            return null;
        } catch (_err) {
            return null;
        }
    }

    convert(originalTx, chain, type) {
        const { hash, from, to, input, nonce, gas, gasPrice, value, status, blockNumber } = originalTx;

        const tx = {
            chain,
            type,
            hash,
            from: Rsk3.utils.toChecksumAddress(from, NET_WORK_ID.ROOTSTOCK[type]),
            to: Rsk3.utils.toChecksumAddress(to, NET_WORK_ID.ROOTSTOCK[type]),
            input,
            nonce: Rsk3.utils.toHex(nonce),
            gas: Rsk3.utils.toHex(gas),
            gasPrice: Rsk3.utils.toHex(gasPrice),
            value: Rsk3.utils.toHex(value),
            status,
            blockHeight: blockNumber,
        };

        const decodeTx = this.distinguishCoinTx(tx, type);

        return decodeTx;
    }
};
