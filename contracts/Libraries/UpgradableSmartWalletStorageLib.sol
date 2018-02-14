pragma solidity ^0.4.18;
import "../token/IERC20Token.sol";

library UpgradableSmartWalletStorageLib {
    
    /*
     *  Structs
     */
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

    /*
     *  Events
     */
    event TransferToBackupAccount(address _token, address _backupAccount, uint _amount);
    
    /*
        @dev Initialize the upgradable wallet with the the address of the contract that holds the up-to-date relay address
        
        @param _self                        Wallet storage
        @param _relayVersionContract        The address of the contract that holds the relay version contract address
        
    */
    function initUpgradableSmartWallet(Wallet storage _self, address _relayVersionContract) 
        public
        validAddress(_relayVersionContract)
        {
            _self.relayVersionContract = _relayVersionContract;
    }

    /*
        @dev Withdraw funds to a backup account. 

        @param _self                Wallet storage
        @param _token               The ERC20 token the owner withdraws from 
        @param _amount              Amount to transfer    
    */
    function transferToBackupAccount(Wallet storage _self, IERC20Token _token, uint _amount) 
        public 
        operatorOnly(_self.operatorAccount)
        {
            _token.transfer(_self.backupAccount, _amount);
            TransferToBackupAccount(_token, _self.backupAccount, _amount); 
    }

    

    
}