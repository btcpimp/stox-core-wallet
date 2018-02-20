var SmartWallet = artifacts.require("./SmartWallet/SmartWallet.sol");
var SmartWalletLib = artifacts.require("./Libraries/SmartWalletLib.sol");
var UpgradableSmartWallet = artifacts.require("./SmartWallet/UpgradableSmartWallet.sol");
var UpgradableSmartWalletLib = artifacts.require("./Libraries/UpgradableSmartWalletLib.sol");

module.exports = function(deployer) {
   deployer.deploy(SmartWalletLib);
   deployer.link(SmartWalletLib,SmartWallet);

   deployer.deploy(UpgradableSmartWalletLib);
   deployer.link(UpgradableSmartWalletLib,UpgradableSmartWallet);
    
};