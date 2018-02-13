pragma solidity ^0.4.18;

contract RelayVersion {
    
    /*
     *  Members
     */
    address public relayVersionAddress;
    address public operator;

    /*
     *  Modifiers
     */
    modifier validAddress(address _address) {
        require(_address != 0x0);
        _;
    }

    modifier operatorOnly() {
        require(msg.sender == operator);
        _;
    }

    /*
     *  Events
     */
    event SetRelayVersion(address _relayVersionAddress);

    /*
     *  Dev
     */
    function RelayVersion(address _operator, address _relayVersion) 
        public
        validAddress(_relayVersion)
        validAddress(_operator) 
        {
            operator = _operator;
            relayVersionAddress = _relayVersion;
    }

    function setRelayVersion(address _relayVersion) 
        public
        operatorOnly()
        {
            relayVersionAddress = _relayVersion;
            SetRelayVersion(_relayVersion);
    }
    
    function getRelayVersionAddress()
        public
        returns (address val)
        {
            val = relayVersionAddress;
    }
    
}