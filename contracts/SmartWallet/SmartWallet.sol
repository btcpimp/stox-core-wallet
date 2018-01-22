pragma solidity ^0.4.18;
import "../token/IERC20Token.sol";
import "../Libraries/SmartWalletLib.sol";


///@title - a contract that represents a smart wallet, created by Stox, for every new Stox user
contract SmartWallet {

    /*
     *  Members
     */
    using SmartWalletLib for SmartWalletLib.Wallet;
    SmartWalletLib.Wallet public wallet;

    /*
     *  Events
     */
    event TransferToBackupAccount(IERC20Token _token, address _backupAccount, uint _amount);
    event TransferToUserWithdrawalAccount(IERC20Token _token, address _userWithdrawalAccount, uint _amount);
    event SetUserWithdrawalAccount(address _userWithdrawalAccount);
     
    /*
        @dev constructor

        @param _backupAccount       A default operator's account to send funds to, in cases where the user account is
                                    unavailable or lost
        @param _operator            The contract operator address 

    */
    function SmartWallet(address _backupAccount, address _operator) public {
        wallet.initWallet(_backupAccount, _operator);
    }

    /*
        @dev Setting the account of the user to send funds to. 
        
        @param _userWithdrawalAccount       The user account to withdraw funds to
        
    */
    function setUserWithdrawalAccount(address _userWithdrawalAccount) public {
        wallet.setUserWithdrawalAccount(_userWithdrawalAccount);
    }

    /*
        @dev Withdraw funds to a backup account. 


        @param _token               The ERC20 token the owner withdraws from 
        @param _amount              Amount to transfer    
    */
    function transferToBackupAccount(IERC20Token _token, uint _amount) public {
        wallet.transferToBackupAccount(_token, _amount);
    }

    /*
        @dev Withdraw funds to the user account. 


        @param _token               The ERC20 token the owner withdraws from 
        @param _amount              Amount to transfer    
    */
    function transferToUserWithdrawalAccount(IERC20Token _token, uint _amount) public {
        wallet.transferToUserWithdrawalAccount(_token, _amount);
    }
}
