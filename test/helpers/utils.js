const wei = 1000000000
const Gwei = 1000000000*wei 

function isException(error) {
    let strError = error.toString();
    return strError.includes('invalid opcode') || strError.includes('invalid JUMP') || strError.includes('VM Exception');
}

function ensureException(error) {
    assert(isException(error), error.toString());
}

function ensureEvent(_event,_value) {
    _event.watch(function(error,result){
        if (!error)
             console.log("Event value: " + result.event); 
            //console.log(result.args["_value"].toString());
            //console.log(getLogArg(result,"_value").toString());
            else
            console.log('error in set user withdrawal account')
        _event.stopWatching();
        assert.equal(_value,result.event);    
    });
}

module.exports = {
    isException: isException,
    ensureException: ensureException,
    ensureEvent: ensureEvent,
    getRealGasPrice: 20*wei,
    getWeiToDollarConversion: 1000/Gwei  
};