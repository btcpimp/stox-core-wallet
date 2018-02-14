pragma solidity ^0.4.18;
import "../token/IERC20Token.sol";
import "../Libraries/UpgradableSmartWalletStorageLib.sol";

contract SmartWalletFunctions {
    
    
    /*
     *  Members
     */
    using UpgradableSmartWalletStorageLib for UpgradableSmartWalletStorageLib.Wallet;
    UpgradableSmartWalletStorageLib.Wallet public wallet;
   
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
    event TransferToUserWithdrawalAccount(address _token, address _userWithdrawalAccount, uint _amount, address _feesToken, address _feesAccount, uint _fee);
    event SetUserWithdrawalAccount(address _userWithdrawalAccount);

     /*
     
        @dev Initialize the contract
     
     */
    function SmartWalletFunctions() {}

    /*
        @dev Initialize the wallet with the operator and backupAccount address
        
        @param _backupAccount               Operator account to release funds in case the user lost his withdrawal account
        @param _operator                    The operator account
        @param _feesAccount                 The account to transfer fees to
    */
    function initWallet(address _backupAccount, address _operator, address _feesAccount) 
        public
        validAddress(_backupAccount)
        validAddress(_operator)
        validAddress(_feesAccount)
        {
        
            wallet.backupAccount = _backupAccount;
            wallet.operatorAccount = _operator;
            wallet.feesAccount = _feesAccount;
    }

    /*
        @dev Setting the account of the user to send funds to. 
        
        @param _userWithdrawalAccount       The user account to withdraw funds to
    */
    function setUserWithdrawalAccount(address _userWithdrawalAccount) 
        public
        operatorOnly(wallet.operatorAccount)
        validAddress(_userWithdrawalAccount)
        addressNotSet(wallet.userWithdrawalAccount) 
        {
            wallet.userWithdrawalAccount = _userWithdrawalAccount;
            SetUserWithdrawalAccount(_userWithdrawalAccount);
    }

    /*
        @dev Withdraw funds to the user account. 

        @param _token               The ERC20 token the owner withdraws from 
        @param _amount              Amount to transfer
        @param _feesToken           The ERC20 token for fee payment   
        @param _fee                 Fee to transfer   
    */
    function transferToUserWithdrawalAccount(IERC20Token _token, uint _amount, IERC20Token _feesToken, uint _fee) 
        public 
        operatorOnly(wallet.operatorAccount)
        validAddress(wallet.userWithdrawalAccount)
        {

            if (_fee > 0) {        
               _feesToken.transfer(wallet.feesAccount, _fee); 
            }       
                
            _token.transfer(wallet.userWithdrawalAccount, _amount);
            TransferToUserWithdrawalAccount(_token, wallet.userWithdrawalAccount, _amount,  _feesToken, wallet.feesAccount, _fee);   
        
    }
}
