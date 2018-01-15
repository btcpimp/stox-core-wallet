var StoxSmartWallet = artifacts.require("./SmartWallet/StoxSmartWallet.sol");

module.exports = function(deployer) {
    deployer.deploy(StoxSmartWallet);
};