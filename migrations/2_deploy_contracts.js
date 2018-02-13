var SmartWallet = artifacts.require("./SmartWallet/SmartWallet.sol");
var SmartWalletLib = artifacts.require("./Libraries/SmartWalletLib.sol");
var UpgradableSmartWallet = artifacts.require("./SmartWallet/UpgradableSmartWallet.sol");
var UpgrasableSmartWalletStorageLib = artifacts.require("./Libraries/UpgradableSmartWalletStorageLib.sol");

module.exports = function(deployer) {
   deployer.deploy(SmartWalletLib);
   deployer.link(SmartWalletLib,SmartWallet);

   deployer.deploy(UpgrasableSmartWalletStorageLib);
   deployer.link(UpgrasableSmartWalletStorageLib,UpgradableSmartWallet);
    
};