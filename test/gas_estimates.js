const utils = require('./helpers/utils');

const StoxTestToken = artifacts.require("./token/StoxTestToken.sol");
const SmartWallet = artifacts.require("./SmartWallet/StoxSmartWallet.sol");

let stoxTestToken;
let smartWallet;

//Accounts
let trueOwner =       web3.eth.accounts[0];
let player1 =         web3.eth.accounts[1];
let backupAccount =   web3.eth.accounts[2];

//Misc.
let realGasPrice = 40*1000000000; //update from https://ethgasstation.info/

module.exports = async function(callback){

    async function createAndEstimateContractGas() {
        
      smartWallet = await SmartWallet.new(backupAccount,trueOwner);
      let g = smartWallet.constructor.class_defaults.gas;
      let gp = smartWallet.constructor.class_defaults.gasPrice;
      
      return g/gp;
    } 

    let gasEstimate = await createAndEstimateContractGas();
    console.log("Smart Wallet creation, gas estimate: " 
                + gasEstimate + "(gas estimate)" + " * " + realGasPrice + "(current real gas price)" + " = " + Math.floor(gasEstimate*realGasPrice) + "Wei");

    stoxTestToken = await StoxTestToken.new("Stox Test", "STX", 18);
    stoxTestToken.totalSupply = 10000;
    await stoxTestToken.issue(smartWallet.address,10000);

    let setUserWithdrawalAccount_GasEstimate = await smartWallet.setUserWithdrawalAccount.estimateGas(player1, {from: trueOwner});
    console.log("Setting user's withdrawal account, gas estimate: " + setUserWithdrawalAccount_GasEstimate*realGasPrice/(web3.eth.gasPrice) + "Wei");

    await smartWallet.setUserWithdrawalAccount(player1,{from: trueOwner});
    let sendFundsToUser_GasEstimate = await smartWallet.transferToUserWithdrawalAccount.estimateGas(stoxTestToken.address, 500, {from: trueOwner});
    console.log("Sending funds to he user's withdrawal account, gas estimate: " + sendFundsToUser_GasEstimate*realGasPrice/(web3.eth.gasPrice) + "Wei")

    callback();
}