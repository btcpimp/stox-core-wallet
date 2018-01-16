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
        console.log("Smart Wallet creation, gas estimate: " + gasEstimate + "(gas estimate)" + " * " + utils.getRealGasPrice + "(current real gas price)" + " = " + Math.floor(gasEstimate*utils.getRealGasPrice) + "Wei");
        console.log("   To Dollars: $" + Math.floor(gasEstimate*utils.getRealGasPrice*utils.getWeiToDollarConversion) + "\n");
        
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
        'StoxSmartWallet.sol': fs.readFileSync('../contracts/SmartWallet/StoxSmartWallet.sol', 'utf8')
    };

    // Compile the source code
    let output = await solc.compile({sources: input}, 1);
    let abi = await output.contracts['StoxSmartWallet.sol:StoxSmartWallet'].interface;
    let bytecode = await '0x' + output.contracts['StoxSmartWallet.sol:StoxSmartWallet'].bytecode;
    let gasEstimate = await web3.eth.estimateGas({data: bytecode});
    
    //Add extra 100000 gas to estimateGas. From few tests, per the below, it seems that the theoretical estimatedGas is not enough
    gasEstimate += 100000;

    //Test and create a deployment of the contract
    let SSW = await web3.eth.contract(JSON.parse(abi));
    let ssw = await SSW.new(backupAccount, trueOwner, {
        from: trueOwner,
        data: bytecode,
        gas: gasEstimate
      }, async function(err, myContract){
         if(!err) {
            await printGasEstimations(gasEstimate,myContract)
         }
         else {
             console.log('error: ' + err)
         }
       });
  
    callback();
}