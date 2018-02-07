pragma solidity ^0.4.18;
import "../token/IERC20Token.sol";

contract IUpgradableSmartContract {
    function initWallet(address _backupAccount, address _operator, address _feesAccount);
    function transferToBackupAccount(IERC20Token _token, uint _amount);
    function transferToUserWithdrawalAccount(IERC20Token _token, uint _amount, IERC20Token _feesToken, uint _fee);
    function setUserWithdrawalAccount(address _userWithdrawalAccount);
}