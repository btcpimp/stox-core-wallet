const wei = 1000000000
const Gwei = 1000000000*wei 

function isException(error) {
    let strError = error.toString();
    return strError.includes('invalid opcode') || strError.includes('invalid JUMP') || strError.includes('VM Exception');
}

function ensureException(error) {
    assert(isException(error), error.toString());
}

module.exports = {
    isException: isException,
    ensureException: ensureException,
    getRealGasPrice: 3*wei,
    getWeiToDollarConversion: 1000/Gwei  
};