var SmartWallet = artifacts.require("./SmartWallet/SmartWallet.sol");
var SmartWalletLib = artifacts.require("./Libraries/SmartWalletLib.sol");

module.exports = function(deployer) {
   deployer.deploy(SmartWalletLib);
   deployer.link(SmartWalletLib,SmartWallet);
    
};