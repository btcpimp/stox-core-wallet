pragma solidity ^0.4.18;

library UpgradableSmartWalletStorageLib {
    
    struct Wallet {
        address operatorAccount;
        address backupAccount;
        address userWithdrawalAccount;
        address feesAccount;
        address relayVersionContract;
    }
}