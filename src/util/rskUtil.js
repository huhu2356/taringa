const Rsk3 = require('@rsksmart/rsk3');

function integerFromWei(wei) {
    return Number(Rsk3.utils.fromWei(Rsk3.utils.hexToNumberString(wei), 'ether')).toFixed();
}

function integerToWei(eth) {
    return Rsk3.utils.numberToHex(Rsk3.utils.toWei(eth, 'ether'));
}

module.exports = {
    integerFromWei,
    integerToWei,
};
