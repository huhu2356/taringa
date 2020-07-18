const Rsk3 = require('@rsksmart/rsk3');
const HDNode = require('hdkey');
const crypto = require('crypto');
const ethereumjsUtil = require('ethereumjs-util');

const PathKeyPair = require('./pathKeyPair');

const MASTER_SECRET = Buffer.from('Bitcoin seed', 'utf8');

const deserializePrivate = privateKey => {
    const master = JSON.parse(privateKey);
    const ret = new HDNode();
    ret.chainCode = Buffer.from(master.cc, 'hex');
    ret.privateKey = Buffer.from(master.prk, 'hex');
    return ret;
};

const serializePrivate = node => {
    const ret = {
        prk: node.privateKey.toString('hex'),
        cc: node.chainCode.toString('hex'),
    };
    return JSON.stringify(ret);
};

const deserializePublic = s => {
    const master = JSON.parse(s);
    if (master.prk) return null;
    const ret = new HDNode();
    ret.chainCode = Buffer.from(master.cc, 'hex');
    ret.publicKey = Buffer.from(master.puk, 'hex');
    return ret;
};

const serializePublic = node => {
    const ret = {
        puk: node.publicKey.toString('hex'),
        cc: node.chainCode.toString('hex'),
    };
    return JSON.stringify(ret);
};

const derivePathFromNode = (node, path) => {
    let deserialized = deserializePublic(node);
    let pub = true;
    if (!deserialized) {
        pub = false;
        deserialized = deserializePrivate(node);
    }
    const derived = deserialized.derive(path);
    let serialized = '';
    if (pub) {
        serialized = serializePublic(derived);
    } else {
        serialized = serializePrivate(derived);
    }
    return serialized;
};

const getPrivateKey = (master, addressNode) => {
    const privateKey = derivePathFromNode(master, addressNode.path);
    return Buffer.from(deserializePrivate(privateKey).privateKey).toString('hex');
};

const fromMasterSeed = seedBuffer => {
    const I = crypto
        .createHmac('sha512', MASTER_SECRET)
        .update(seedBuffer)
        .digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);

    const ret = new HDNode();
    ret.chainCode = IR;
    ret.privateKey = IL;

    return ret;
};

const generateMasterFromSeed = seed => {
    const master = fromMasterSeed(seed);
    return JSON.stringify({
        prk: master.privateKey.toString('hex'),
        cc: master.chainCode.toString('hex'),
    });
};

const generateRootNodeFromMaster = (master, networkId) => {
    let node = deserializePrivate(master);
    const path = `m/44'/${networkId}'/0'`;
    node = node.derive(path);
    return new PathKeyPair(path, serializePublic(node));
};

const deriveChildFromNode = (publicKey, index) => {
    const deserialized = deserializePublic(publicKey) || deserializePrivate(publicKey);
    return serializePublic(deserialized.deriveChild(index));
};

const generateAccountNode = (networkNode, index) => {
    const path = `${networkNode.path}/${index}`;
    const publicKey = deriveChildFromNode(networkNode.public_key, index);
    return new PathKeyPair(path, publicKey);
};

const generateAddressNode = (accountNode, index) => {
    const path = `${accountNode.path}/${index}`;
    const publicKey = deriveChildFromNode(accountNode.public_key, index);
    return new PathKeyPair(path, publicKey);
};

const getAddress = (addressNode, networkId) => {
    const publicKey = JSON.parse(addressNode.public_key).puk;
    const addressBin = ethereumjsUtil.pubToAddress(Buffer.from(publicKey, 'hex'), true);
    const address = Buffer.from(addressBin).toString('hex');
    const checksumAddress = Rsk3.utils.toChecksumAddress(address, networkId);
    return checksumAddress;
};

const generateKeyPair = (seed, networkId) => {
    const keyPair = {};
    const master = generateMasterFromSeed(seed);
    const networkNode = generateRootNodeFromMaster(master, networkId);
    const accountNode = generateAccountNode(networkNode, 0);
    const addressNode = generateAddressNode(accountNode, 0);
    keyPair.address = getAddress(addressNode, networkId);
    keyPair.privateKey = getPrivateKey(master, addressNode);

    return keyPair;
};

module.exports = {
    generateKeyPair,
};
