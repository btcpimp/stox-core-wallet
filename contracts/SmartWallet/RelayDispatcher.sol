pragma solidity ^0.4.18;

contract RelayDispatcher {
    
    /*
     *  Members
     */
    address public relayContractAddress;
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
    event SetRelayContractAddress(address _relayContractAddress);

    /*
        @dev Initialize the RelayContract contract
        
        @param _operator                    The contract operator address
        @param _relayContractAddress        Address of the contract to delegate function calls to
        
    */
    function RelayDispatcher(address _operator, address _relayContractAddress) 
        public
        validAddress(_relayContractAddress)
        validAddress(_operator) 
        {
            operator = _operator;
            relayContractAddress = _relayContractAddress;
    }

    /*
        @dev set the Relay contract address
        
        @param _relayContractAddress                Address of the contract to delegate function calls to
        
    */
    function setRelayContractAddress(address _relayContractAddress) 
        public
        operatorOnly()
        {
            relayContractAddress = _relayContractAddress;
            SetRelayContractAddress(_relayContractAddress);
    }
    
    /*
        @dev get the Relay contract address
        
               
    */
    function getRelayContractAddress()
        public
        returns (address val)
        {
            val = relayContractAddress;
    }
    
}