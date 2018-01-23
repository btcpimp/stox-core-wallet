pragma solidity ^0.4.18;
import "../token/IERC20Token.sol";

///@title - a contract that represents a smart wallet, created by Stox, for every new Stox user
library SmartWalletLib {

    /*
     *  Structs
     */
     struct Wallet {
        address operatorAccount;
        address backupAccount;
        address userWithdrawalAccount;
    }

    /*
     *  Members
     */
    string constant VERSION = "0.1";
   

    /*
     *  Modifiers
     */
    modifier validAddress(address _address) {
        require(_address != 0x0);
        _;
    }

    modifier addressNotSet(address _address) {
        require(_address == 0);
        _;
    }

    modifier operatorOnly(address _operatorAccount) {
        require(msg.sender == _operatorAccount);
        _;
    }

    /*
     *  Events
     */
    event TransferToBackupAccount(IERC20Token _token, address _backupAccount, uint _amount);
    event TransferToUserWithdrawalAccount(IERC20Token _token, address _userWithdrawalAccount, uint _amount, uint _fee);
    event SetUserWithdrawalAccount(address _userWithdrawalAccount);

    /*
        @dev Initialize the wallet with the operator and backupAccount address
        
        @param _self                        Wallet storage
        @param _backupAccount               Operator account to release funds in case the user lost his withdrawal account
        @param _operator                    The operator account
    */
    function initWallet(Wallet storage _self, address _backupAccount, address _operator) 
            public
            validAddress(_backupAccount)
            validAddress(_operator)
            {
        
        _self.operatorAccount = _operator;
        _self.backupAccount = _backupAccount;
    }

    /*
        @dev Setting the account of the user to send funds to. 
        
        @param _self                        Wallet storage
        @param _userWithdrawalAccount       The user account to withdraw funds to
    */
    function setUserWithdrawalAccount(Wallet storage _self, address _userWithdrawalAccount) 
            public
            operatorOnly(_self.operatorAccount)
            validAddress(_userWithdrawalAccount)
            addressNotSet(_self.userWithdrawalAccount)
            {
        
        _self.userWithdrawalAccount = _userWithdrawalAccount;
        SetUserWithdrawalAccount(_userWithdrawalAccount);
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

    /*
        @dev Withdraw funds to the user account. 

        @param _self                Wallet storage
        @param _token               The ERC20 token the owner withdraws from 
        @param _amount              Amount to transfer  
        @param _fee                 Fee to transfer   
    */
    function transferToUserWithdrawalAccount(Wallet storage _self, IERC20Token _token, uint _amount, uint _fee) 
            public 
            operatorOnly(_self.operatorAccount)
            validAddress(_self.userWithdrawalAccount)
            {

        _token.transfer(_self.backupAccount, _fee);        
        _token.transfer(_self.userWithdrawalAccount, _amount);
        TransferToUserWithdrawalAccount(_token, _self.userWithdrawalAccount, _amount, _fee);   
    }
}
