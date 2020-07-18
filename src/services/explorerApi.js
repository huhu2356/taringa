const got = require('got');
const querystring = require('querystring');
const _ = require('lodash');

const BaseService = require('./base');

module.exports = class ExplorerService extends BaseService {
    constructor(ctx, type) {
        super(ctx);
        this.type = type;
        this.host = ctx.config.rskExplorerApi[type.toLowerCase()];
    }

    async getTransactionsByAddress(address) {
        const totalTxs = [];
        let hasNext;
        do {
            const resTxPaginate = await this.getTxsByAddrPaginate({
                address,
                next: hasNext,
            });
            if (_.isNull(resTxPaginate)) {
                break;
            }

            const { txs } = resTxPaginate;
            totalTxs.push(...txs);

            hasNext = resTxPaginate.next;
        } while (hasNext);

        return totalTxs;
    }

    async getTxsByAddrPaginate({ address, next, limit = 50 }) {
        const params = {
            module: 'transactions',
            action: 'getTransactionsByAddress',
            address: address.toLowerCase(),
            limit,
        };
        if (next) {
            params.next = next;
        }

        const resTxs = await this.get({ params });
        if (resTxs) {
            const { data: txs, pages } = resTxs;
            return {
                txs,
                next: pages.next,
            };
        }

        return null;
    }

    async get({ params }) {
        const qs = querystring.stringify(params);
        const url = `${this.host}?${qs}`;

        const { body } = await got.get(url, {
            responseType: 'json',
        });

        return body;
    }
};
