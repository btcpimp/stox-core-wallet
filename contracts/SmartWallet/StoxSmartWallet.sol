pragma solidity ^0.4.18;
import "../token/IERC20Token.sol";
import "../Libraries/StoxWithdrawalAccountLib.sol";
import "../Ownable.sol";
import "../Utils.sol";


///@title - a contract that represents a smart wallet, created by Stox, for every new Stox user
contract StoxSmartWallet is Ownable, Utils {

    /*
     *  Members
     */
    address public backupAccount;
    //address public userWithdrawalAccount;
    StoxWithdrawalAccountLib.Data data;
    string public version = "0.1";
   

    /*
     *  Modifiers
     */
    modifier userWidthrawlAccountAvailable {
        require(StoxWithdrawalAccountLib.get(data) != 0x0);
        _;
    }

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
        @param _owner               The contract creator address 

    */
    function StoxSmartWallet(address _backupAccount, address _owner) 
            public
            //validAddress(_backupAccount)
            Ownable(_owner)
            {

        backupAccount = _backupAccount; 
    }

    /*
        @dev Setting the account of the user to send funds to. 
        
        @param _userWithdrawalAccount       The user account to withdraw funds to
        
    */
    function setUserWithdrawalAccount(address _userWithdrawalAccount) 
            public
            ownerOnly
            validAddress(_userWithdrawalAccount)
            {
        
        StoxWithdrawalAccountLib.set(data,_userWithdrawalAccount);
    }

    /*
        @dev Withdraw funds to a backup account. 


        @param _token               The ERC20 token the owner withdraws from 
        @param _amount              Amount to transfer    
    */
    function transferToBackupAccount(IERC20Token _token, uint _amount) 
            public 
            ownerOnly
            greaterThanZero(_amount)
            {

        _token.transfer(backupAccount,_amount);
        TransferToBackupAccount(_token, backupAccount, _amount); 
    }

    /*
        @dev Withdraw funds to the user account. 


        @param _token               The ERC20 token the owner withdraws from 
        @param _amount              Amount to transfer    
    */
    function transferToUserWithdrawalAccount(IERC20Token _token, uint _amount) 
            public 
            ownerOnly
            userWidthrawlAccountAvailable
            greaterThanZero(_amount)
            {

        _token.transfer(StoxWithdrawalAccountLib.get(data),_amount);
        TransferToUserWithdrawalAccount(_token, StoxWithdrawalAccountLib.get(data), _amount);   
    }

}