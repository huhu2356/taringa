const Rsk3 = require('@rsksmart/rsk3');

const BaseService = require('./base');

module.exports = class RskService extends BaseService {
    constructor(ctx, type) {
        super(ctx);
        this.type = type;

        const rsk3Url = ctx.config.rsk3[type.toLowerCase()];
        this.rsk3 = new Rsk3(rsk3Url);
    }

    async sendSignedTransaction(rawHash) {
        const res = await new Promise((resolve, reject) => {
            this.rsk3
                .sendSignedTransaction(rawHash)
                .on('transactionHash', hash => {
                    resolve({ hash });
                })
                .on('error', error => {
                    reject(error);
                });
        });

        return res;
    }
};
