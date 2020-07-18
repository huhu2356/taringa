const mongoose = require('mongoose');

const AccessUser = new mongoose.Schema(
    {
        roleId: String,
        apiKey: String,
        status: String,
    },
    { timestamps: true },
);

AccessUser.index({ apiKey: 1 }, { unique: true });

module.exports = mongoose.model('AccessUser', AccessUser, 'access_user');
