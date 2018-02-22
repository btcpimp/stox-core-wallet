pragma solidity ^0.4.18;
import "../token/IERC20Token.sol";

contract IUpgradableSmartWallet {
    function setRelayDispatcher(address _relayDispatcher) public;
    function transferToBackupAccount(IERC20Token _token, uint _amount) public;
    function transferToUserWithdrawalAccount(IERC20Token _token, uint _amount, IERC20Token _feesToken, uint _fee) public;
    function setUserWithdrawalAccount(address _userWithdrawalAccount) public;

    event SetRelayDispatcher(address _relayDispatcher);
    event TransferToBackupAccount(address _token, address _backupAccount, uint _amount);
}
