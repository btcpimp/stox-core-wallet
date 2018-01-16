const utils = require('./helpers/utils');
const path = require('path');
const fs = require('fs');
const solc = require('solc');

const StoxTestToken = artifacts.require("./token/StoxTestToken.sol");
const SmartWallet = artifacts.require("./SmartWallet/StoxSmartWallet.sol");

//Accounts
let trueOwner =       web3.eth.accounts[0];
let player1 =         web3.eth.accounts[1];
let backupAccount =   web3.eth.accounts[2];

module.exports = async function(callback){

    async function printGasEstimations(_gasEstimate, _contract) {
        
        //Gas costs for contract deployment
        console.log("Smart Wallet creation, gas estimate: " + _gasEstimate + "(gas estimate)" + " * " + utils.getRealGasPrice + "(current real gas price)" + " = " + Math.floor(_gasEstimate*utils.getRealGasPrice) + "Wei");
        console.log("   To Dollars: $" + Math.floor(_gasEstimate*utils.getRealGasPrice*utils.getWeiToDollarConversion) + "\n");
        
        //Gas costs for wrting user withdrawal address and sending funds to the user
        let stoxTestToken = await StoxTestToken.new("Stox Test", "STX", 18);
        stoxTestToken.totalSupply = 10000;
        await stoxTestToken.issue(_contract.address,10000);
    
        
        let setUserWithdrawalAccount_GasEstimate = await _contract.setUserWithdrawalAccount.estimateGas(player1, {from: trueOwner});
        console.log("Setting user's withdrawal account, gas estimate: " + setUserWithdrawalAccount_GasEstimate*utils.getRealGasPrice/(web3.eth.gasPrice) + "GWei");
        console.log("   To Dollars: $" + Math.floor(setUserWithdrawalAccount_GasEstimate*utils.getRealGasPrice*utils.getWeiToDollarConversion) + "\n");
        
        await _contract.setUserWithdrawalAccount(player1,{from: trueOwner});
        let sendFundsToUser_GasEstimate = await _contract.transferToUserWithdrawalAccount.estimateGas(stoxTestToken.address, 500, {from: trueOwner});
        console.log("Sending funds to he user's withdrawal account, gas estimate: " + sendFundsToUser_GasEstimate*utils.getRealGasPrice/(web3.eth.gasPrice) + "GWei")
        console.log("   To Dollars: $" + Math.floor(sendFundsToUser_GasEstimate*utils.getRealGasPrice*utils.getWeiToDollarConversion) + "\n");
        
    }

    var input = {
        'token/IERC20Token.sol': fs.readFileSync('../contracts/token/IERC20Token.sol', 'utf8'),
        'Utils.sol': fs.readFileSync('../contracts/Utils.sol', 'utf8'),
        'Ownable.sol': fs.readFileSync('../contracts/Ownable.sol', 'utf8'),
        'Libraries/StoxWithdrawalAccountLib.sol': fs.readFileSync('../contracts/Libraries/StoxWithdrawalAccountLib.sol', 'utf8'),
        'StoxSmartWallet.sol': fs.readFileSync('../contracts/SmartWallet/StoxSmartWallet.sol', 'utf8')
    };

    // Compile the source code
    let output = await solc.compile({sources: input}, 1);
    let abi = await output.contracts['StoxSmartWallet.sol:StoxSmartWallet'].interface;
    let bytecode = await '0x' + output.contracts['StoxSmartWallet.sol:StoxSmartWallet'].bytecode;
    
    let abi_lib = await output.contracts['Libraries/StoxWithdrawalAccountLib.sol:StoxWithdrawalAccountLib'].interface;
    let bytecode_lib = await '0x' + output.contracts['Libraries/StoxWithdrawalAccountLib.sol:StoxWithdrawalAccountLib'].bytecode;
    
    //Depoly SWA library
    let gasEstimate_lib = await web3.eth.estimateGas({data: bytecode_lib});
    //Add extra 100000 gas to estimateGas. From few tests, per the below, it seems that the theoretical estimatedGas is not enough
    gasEstimate_lib += 100000;
    
    let SWAlib = await web3.eth.contract(JSON.parse(abi_lib));
    let swalib_contract = await SWAlib.new({
        from: trueOwner,
        data: bytecode_lib,
        gas: gasEstimate_lib
      }, async function(err, myLibrary){
         if(!err) {
             if (!myLibrary.address) {
                 console.log("Library Tx hash: " + myLibrary.transactionHash);
             }
             else {
                 console.log("Library address: " + myLibrary.address);
                 bytecode = await solc.linkBytecode(bytecode, {'Libraries/StoxWithdrawalAccountLib.sol': swalib_contract.address});

                //Depoly Contract
                let gasEstimate = await web3.eth.estimateGas({data: bytecode});
                //Add extra 100000 gas to estimateGas. From few tests, per the below, it seems that the theoretical estimatedGas is not enough
                gasEstimate += 100000;
                let SSW = await web3.eth.contract(JSON.parse(abi));
                let ssw = await SSW.new(backupAccount, trueOwner,{
                    from: trueOwner,
                    data: bytecode,
                    gas: gasEstimate
                }, async function(err, myContract){
                    if(!err) {
                        if (!myContract.address) {
                            console.log("Contract Tx hash: " + myContract.transactionHash);
                        }
                        else {
                            console.log("Contract address: " + myContract.address);
                            await printGasEstimations(gasEstimate, myContract);
                        }
                    }
                    else {
                        console.log('Contract error: ' + err)
                    }
                });
    
             }
         }
         else {
             console.log('Library error: ' + err)
         }
       });
      

    callback();
}