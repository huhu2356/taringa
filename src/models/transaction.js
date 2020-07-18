const mongoose = require('mongoose');

const Transaction = new mongoose.Schema(
    {
        chain: String,
        type: String,
        symbol: String,
        hash: String,
        from: String,
        to: String,
        input: String,
        nonce: String,
        gas: String,
        gasPrice: String,
        value: String,
        status: Number,
        blockHeight: Number,
    },
    { timestamps: true },
);

Transaction.index({ chain: 1, type: 1, hash: 1 }, { unique: true });

module.exports = mongoose.model('Transaction', Transaction, 'transaction');
