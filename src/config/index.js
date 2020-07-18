const dotenv = require('dotenv');

const envFound = dotenv.config();
if (envFound.error) {
    // This error should crash whole process
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const config = {
    env: process.env.NODE_ENV,

    port: parseInt(process.env.PORT, 10),

    logs: {
        level: process.env.LOG_LEVEL || 'silly',
    },

    databaseURL: process.env.MONGODB_URI,

    rsk3: {
        testnet: 'https://public-node.testnet.rsk.co',
        mainnet: 'https://public-node.rsk.co',
    },

    rskExplorerApi: {
        testnet: 'https://backend.explorer.testnet.rsk.co/api',
        mainnet: 'https://backend.explorer.rsk.co/api',
    },
};

module.exports = config;
