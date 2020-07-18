const bip39 = require('bip39');

const ChainService = require('./chain');
const ExplorerApiService = require('./explorerApi');
const RskService = require('./rskApi');
const TransactionService = require('./transaction');
const Address = require('../models/address');
const Transaction = require('../models/transaction');
const { generateKeyPair } = require('../util/keyPairGeneration');

const TX_STATUS = {
    PENDING: 0,
    SUCCESS: 1,
    FAILED: 2,
};

const NET_WORK_ID = {
    ROOTSTOCK: {
        Testnet: 37310,
        Mainnet: 137,
    },
};

module.exports = class RootstockChainService extends ChainService {
    constructor(ctx, name, type) {
        super(ctx);
        this.name = name;
        this.type = type;

        this.rskService = new RskService(ctx, type);
        const { rsk3 } = this.rskService;
        this.rsk3 = rsk3;
        this.explorerApiService = new ExplorerApiService(ctx, type);
        this.transactionService = new TransactionService(ctx);
    }

    async sendSignedTransaction(rawHash) {
        const res = await this.rskService.sendSignedTransaction(rawHash);
        return res;
    }

    async addAddress({ chain, type, symbol, address }) {
        await Address.create({
            chain,
            type,
            symbol,
            address,
        });

        this.saveAddrTxs({ chain, type, symbol, address }).catch(_err => {});
    }

    async saveAddrTxs({ chain, type, symbol, address }) {
        const txs = await this.explorerApiService.getTransactionsByAddress(address);

        const tasks = txs.map(async tx => {
            if (tx.receipt && tx.receipt.status === '0x0') {
                tx.status = TX_STATUS.FAILED;
            } else {
                tx.status = TX_STATUS.SUCCESS;
            }

            const convertTx = this.transactionService.convert(tx, chain, type);
            if (convertTx.symbol === symbol) {
                await Transaction.create(convertTx).catch(_err => {});
            }
        });

        await Promise.all(tasks);
    }

    async getTransactions({ chain, type, symbol, address, page, pageSize }) {
        const count = await Transaction.count({
            chain,
            type,
            symbol,
            $or: [
                {
                    from: address,
                },
                {
                    to: address,
                },
            ],
        });

        const txs = await Transaction.find(
            {
                chain,
                type,
                symbol,
                $or: [
                    {
                        from: address,
                    },
                    {
                        to: address,
                    },
                ],
            },
            undefined,
            {
                limit: pageSize,
                skip: page * pageSize,
            },
        );

        return {
            count,
            list: txs,
        };
    }

    generateAddresses(amount, type) {
        const addresses = [];
        const networkId = NET_WORK_ID.ROOTSTOCK[type];

        for (let i = 0; i < amount; i += 1) {
            const mnemonic = bip39.generateMnemonic();
            const seed = bip39.mnemonicToSeedSync(mnemonic);
            const { address, privateKey } = generateKeyPair(seed, networkId);
            addresses.push({ address, privateKey, mnemonic });
        }

        return addresses;
    }

    async saveGenerateAddresses({ chain, type, symbol, amount }) {
        const addressObjs = this.generateAddresses(amount, type);
        const tasks = addressObjs.map(async ({ address, privateKey, mnemonic }) => {
            try {
                await Address.create({
                    chain,
                    type,
                    symbol,
                    address,
                    privateKey,
                    mnemonic,
                });

                return address;
            } catch (_error) {
                return null;
            }
        });

        const resAddrs = await Promise.all(tasks);
        const addrs = resAddrs.filter(addr => addr);

        return addrs;
    }
};
