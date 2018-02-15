pragma solidity ^0.4.18;
import "../Libraries/UpgradableSmartWalletStorageLib.sol";
import "./RelayDispatcher.sol";
import "../token/IERC20Token.sol";

contract UpgradableSmartWallet {

    /*
     *  Members
     */
    using UpgradableSmartWalletStorageLib for UpgradableSmartWalletStorageLib.Wallet;
    UpgradableSmartWalletStorageLib.Wallet public wallet;

    /*
     *  Events
     */
    event TransferToBackupAccount(address _token, address _backupAccount, uint _amount);

    /*
        @dev Initialize the contract


        @param _relayVersionContract    The address of the contract that holds the relay version contract address
          
    */  
    function UpgradableSmartWallet(address _relayDispatcher) public {
        wallet.initUpgradableSmartWallet(_relayDispatcher);
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
        @dev Fallback function to delegate calls to the relay contract

    */
    function() {
        RelayDispatcher currentRelayDispatcher = RelayDispatcher(wallet.relayDispatcher); 
        var currentRelayContractAddress = currentRelayDispatcher.getRelayContractAddress();
        
        if (!currentRelayContractAddress.delegatecall(msg.data)) 
           revert();
    }

}