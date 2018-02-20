pragma solidity ^0.4.18;
import "../token/IERC20Token.sol";

contract IUpgradableSmartWallet {
    //function initWallet(address _backupAccount, address _operator, address _feesAccount);
    function setRelayDispatcher(address _relayDispatcher);
    function transferToBackupAccount(IERC20Token _token, uint _amount);
    function transferToUserWithdrawalAccount(IERC20Token _token, uint _amount, IERC20Token _feesToken, uint _fee);
    function setUserWithdrawalAccount(address _userWithdrawalAccount);

    event SetRelayDispatcher(address _relayDispatcher);
    event TransferToBackupAccount(address _token, address _backupAccount, uint _amount);
}