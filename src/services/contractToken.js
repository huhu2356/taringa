const Rsk3 = require('@rsksmart/rsk3');
const _ = require('lodash');

const TokenService = require('./token');
const RskService = require('./rskApi');
const abi = require('../config/abi/erc20.json');
const tokensData = require('../config/tokens.json');
const Address = require('../models/address');

const CHAIN_ID = {
    Testnet: 31,
    Mainnet: 30,
};

const NET_WORK_ID = {
    ROOTSTOCK: {
        Testnet: 37310,
        Mainnet: 137,
    },
};

module.exports = class ContractTokenService extends TokenService {
    constructor(ctx, symbol, type) {
        super(ctx);
        this.symbol = symbol;
        this.type = type;

        this.rskService = new RskService(ctx, type);
        const { rsk3 } = this.rskService;
        this.rsk3 = rsk3;

        const tokenData = tokensData.find(token => token.symbol === symbol && token.type === type);
        this.tokenData = tokenData;
        this.contractInstance = this.rsk3.Contract(abi, tokenData.address);
    }

    async getBalance(address) {
        const convertAddr = Rsk3.utils.toChecksumAddress(address);
        const resBalance = await this.contractInstance.methods.balanceOf(convertAddr).call();
        const balance = Rsk3.utils.toHex(resBalance._hex);

        return balance;
    }

    async createRawTransaction({ sender, receiver, value }) {
        const formatedSender = Rsk3.utils.toChecksumAddress(sender);
        const formatedReceiver = Rsk3.utils.toChecksumAddress(receiver);

        const chainId = CHAIN_ID[this.type];
        const data = this.rsk3.abiCoder.encodeFunctionCall(
            {
                name: 'transfer',
                type: 'function',
                inputs: [
                    {
                        name: '_to',
                        type: 'address',
                    },
                    {
                        name: '_value',
                        type: 'uint256',
                    },
                ],
            },
            [formatedReceiver, value],
        );

        const rawTransaction = {
            from: formatedSender,
            to: this.tokenData.address,
            value: 0,
            data,
            chainId,
        };

        const [nonce, gas, gasPrice] = await Promise.all([
            this.rsk3.getTransactionCount(formatedSender, 'pending'),
            38218,
            105973656,
            // this.rsk3.estimateGas(rawTransaction),
            // this.rsk3.getGasPrice(),
        ]);

        Object.assign(rawTransaction, {
            nonce,
            gas,
            gasPrice,
        });

        return rawTransaction;
    }

    async sendTokens({ sender, receiver, value }) {
        const { type, symbol } = this;

        const senderObj = await Address.findOne({
            type,
            symbol,
            address: Rsk3.utils.toChecksumAddress(sender, NET_WORK_ID.ROOTSTOCK[type]),
        });
        if (!senderObj) {
            throw new Error('Sender does not exist');
        }
        const { privateKey } = senderObj;
        if (!privateKey) {
            throw new Error('Sender does not exist');
        }

        let transferValue = value;
        if (_.isUndefined(transferValue)) {
            const balanceOfSender = await this.getBalance(sender);
            if (!balanceOfSender || balanceOfSender === '0x0') {
                throw new Error(`Insufficient token balance ${balanceOfSender} to transfer`);
            }

            transferValue = balanceOfSender;
        }

        const rawTransaction = await this.createRawTransaction({
            sender,
            receiver,
            value: transferValue,
        });

        const accountObj = this.rsk3.accounts.privateKeyToAccount(privateKey);
        const { rawTransaction: signedTx } = await accountObj.signTransaction(rawTransaction, privateKey);

        const hash = await this.rskService.sendSignedTransaction(signedTx);

        return hash;
    }
};
