pragma solidity ^0.4.18;

library StoxWithdrawalAccountLib {
    struct Data {
        address userWithdrawalAccount;
        uint256 amount;
    }

    /*
        @dev verifies that an amount is greater than zero
    */
    
    modifier userWithdrawalAccountNotSet(Data storage _self) {
        require(_self.userWithdrawalAccount == 0);
        _;
    }

    event SetUserWithdrawalAccount(address _userWithdrawalAccount);

    function set(Data storage _self, address _userWithdrawalAccount)
        userWithdrawalAccountNotSet(_self)
        {
            _self.userWithdrawalAccount = _userWithdrawalAccount;
            SetUserWithdrawalAccount(_self.userWithdrawalAccount);
    }

    function get(Data storage _self) returns (address) {
            return _self.userWithdrawalAccount;
    }
}