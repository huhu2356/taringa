const mongoose = require('mongoose');

const Address = new mongoose.Schema(
    {
        chain: String,
        type: String,
        symbol: String,
        address: String,
        balance: String,
        privateKey: String,
        mnemonic: String,
    },
    { timestamps: true },
);

Address.index({ chain: 1, type: 1, symbol: 1, address: 1 }, { unique: true });

module.exports = mongoose.model('Address', Address, 'address');
