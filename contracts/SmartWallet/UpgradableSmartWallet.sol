pragma solidity ^0.4.18;
import "../Libraries/UpgradableSmartWalletStorageLib.sol";
import "./RelayVersion.sol";

contract UpgradableSmartWallet {

    /*
     *  Members
     */
    using UpgradableSmartWalletStorageLib for UpgradableSmartWalletStorageLib.Wallet;
    UpgradableSmartWalletStorageLib.Wallet public wallet;
   
    function UpgradableSmartWallet(address _relayVersionContract) {
        wallet.relayVersionContract = _relayVersionContract;
    }

    function() {
        RelayVersion currentRelayVersionContract = RelayVersion(wallet.relayVersionContract); 
        var currentRelayVersionAddress = currentRelayVersionContract.getRelayVersionAddress();
        
        if (!currentRelayVersionAddress.delegatecall(msg.data)) 
           revert();
    }

}