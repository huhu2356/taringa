const ERROR_CODES = {
    SUCCESS: 10000,
    ERR_SERVER: 10500,
};

class BaseError {
    constructor(code, msg) {
        this.code = code;
        this.msg = msg;
    }
}

class GeneralError extends BaseError {
    constructor(msg = 'server internal error') {
        super(ERROR_CODES.ERR_SERVER, msg);
    }
}

module.exports = {
    ERROR_CODES,
    BaseError,
    GeneralError,
};
