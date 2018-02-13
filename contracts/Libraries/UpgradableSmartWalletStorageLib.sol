pragma solidity ^0.4.18;

library UpgradableSmartWalletStorageLib {
    
    struct Wallet {
        address operatorAccount;
        address backupAccount;
        address userWithdrawalAccount;
        address feesAccount;
        address relayVersionContract;
    }

    /*
     *  Modifiers
     */
    modifier validAddress(address _address) {
        require(_address != 0x0);
        _;
    }

    modifier operatorOnly(address _operatorAccount) {
        require(msg.sender == _operatorAccount);
        _;
    }

    function initUpgradableSmartWallet(Wallet storage _self, address _relayVersionContract) 
        public
        validAddress(_relayVersionContract)
    {
        _self.relayVersionContract = _relayVersionContract;
    }
}