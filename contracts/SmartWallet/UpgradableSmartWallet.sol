pragma solidity ^0.4.18;
import "../Libraries/UpgradableSmartWalletLib.sol";
import "../SmartWallet/RelayDispatcher.sol";
import "../token/IERC20Token.sol";

contract UpgradableSmartWallet {

    /*
     *  Members
     */
    using UpgradableSmartWalletLib for UpgradableSmartWalletLib.Wallet;
    UpgradableSmartWalletLib.Wallet public wallet;

    /*
     *  Modifiers
     */
    modifier validAddress(address _address) {
        require(_address != 0x0);
        _;
    }

    /*
        @dev Initialize the contract

        @param _backupAccount               Operator account to release funds in case the user lost his withdrawal account
        @param _operator                    The operator account
        @param _feesAccount                 The account to transfer fees to
        @param _relayVersionContract    The address of the contract that holds the relay version contract address
          
    */  
    function UpgradableSmartWallet(address _backupAccount, address _operator, address _feesAccount, address _relayDispatcher) 
        public 
        validAddress(_backupAccount)
        validAddress(_operator)
        validAddress(_feesAccount)
        {
            wallet.initUpgradableSmartWallet(_backupAccount,_operator,_feesAccount, _relayDispatcher);
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
        @dev Set a new RelayDispatcher address

        @param _relayDispatcher               RelayDispatcher new address
    */
    function setRelayDispatcher(address _relayDispatcher) public {
        wallet.setRelayDispatcher(_relayDispatcher);
    }

    /*
        @dev Fallback function to delegate calls to the relay contract

    */
    function() {
        RelayDispatcher currentRelayDispatcher = RelayDispatcher(wallet.relayDispatcher); 
        var currentRelayContractAddress = currentRelayDispatcher.getSmartWalletImplAddress();
        
        if (!currentRelayContractAddress.delegatecall(msg.data)) 
           revert();
    }

}