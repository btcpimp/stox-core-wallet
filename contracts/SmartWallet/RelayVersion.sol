pragma solidity ^0.4.18;

contract RelayVersion {
    
    address relayVersionAddress;

    function RelayVersion(address _relayVersion) 
        public 
        {
            relayVersionAddress = _relayVersion;
    }

    function setRelayVersion(address _relayVersion) 
        public
        {
            relayVersionAddress = _relayVersion;
    }
    
    function getRelayVersionAddress()
        public
        returns (address val)
        {
            val = relayVersionAddress;
    }
    
}