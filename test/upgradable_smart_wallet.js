const utils = require('./helpers/utils');
const UpgradableSmartWallet = artifacts.require("./SmartWallet/UpgradableSmartWallet.sol");
const SmartWalletImpl = artifacts.require("./SmartWallet/SmartWalletImpl.sol");
const IUpgradableSmartWallet = artifacts.require("./SmartWallet/IUpgradableSmartWallet.sol");
const RelayDispatcher = artifacts.require("./SmartWallet/RelayDispatcher.sol");
const ExtendedERC20Token = artifacts.require("./token/ExtendedERC20Token.sol");


let relayDispatcher;
let upgradableSmartWallet;
let smartWalletImpl;
let smartWalletImpl2;
let smartWalletImplAddress;

//Accounts
let trueOwner;
let nonOwner;
let player1Account;
let player2Account;
let backupAccount;
let feesAccount;
let stoxShadowToken;
let stoxBrainPointsToken;
let player1UpgradableWallet;
let player2UpgradableWallet;
let iex1;
let iex2;

function isEventArgValid(arg_value,expected_value){
    return (arg_value == expected_value);
}

function getLog(result,name,logIndex = 0) {
    return result.logs[logIndex][name];
}

function getLogArg(result, arg, logIndex = 0) {
    return result.logs[logIndex].args[arg];
}

//The relay event does not appear in the Logs as expected, so need to parse the data key in the logs and extract the values
function isRelayEventLogArgValid(result, logIndex, startIndex, endIndex, expected_value) {
    return ((parseInt(result.logs[logIndex].data.toString().substring(startIndex,endIndex)) || 0) == (parseInt(expected_value) || 0));
}

contract ('UpgradableSmartWallet', function(accounts) {
    let trueOwner                 = accounts[0];
    let nonOwner                  = accounts[1];
    let player1Account            = accounts[2];
    let player2Account            = accounts[3];
    let backupAccount             = accounts[4];
    let feesAccount               = accounts[5];
    
    let grantedTokens = 5

    async function initUpgradableWallets() {
        
        player1UpgradableWallet = await UpgradableSmartWallet.new(backupAccount,trueOwner,feesAccount, relayDispatcher.address);
        iex1 = IUpgradableSmartWallet.at(player1UpgradableWallet.address);
        
        player2UpgradableWallet = await UpgradableSmartWallet.new(backupAccount,trueOwner,feesAccount,relayDispatcher.address);
        iex2 = IUpgradableSmartWallet.at(player2UpgradableWallet.address);
        
        let player1UpgradableWalletTokens = await stoxShadowToken.balanceOf.call(player1UpgradableWallet.address);
        let player2UpgradableWalletTokens = await stoxShadowToken.balanceOf.call(player2UpgradableWallet.address);
        
        await stoxShadowToken.destroy(player1UpgradableWallet.address, player1UpgradableWalletTokens);
        await stoxShadowToken.destroy(player2UpgradableWallet.address, player2UpgradableWalletTokens);
        
        await stoxShadowToken.issue(player1UpgradableWallet.address,grantedTokens);
        await stoxShadowToken.issue(player2UpgradableWallet.address,grantedTokens);
                
    }

    async function initTokens() {
        
        // Clear existing players tokens
        let player1Tokens = await stoxShadowToken.balanceOf.call(player1Account);
        let player2Tokens = await stoxShadowToken.balanceOf.call(player2Account);
        let backupAccountTokens = await stoxShadowToken.balanceOf.call(backupAccount);
        let feesAccountTokens = await stoxShadowToken.balanceOf.call(feesAccount);
        
        await stoxShadowToken.destroy(player1Account, player1Tokens);
        await stoxShadowToken.destroy(player2Account, player2Tokens);
        await stoxShadowToken.destroy(backupAccount, backupAccountTokens);
        await stoxShadowToken.destroy(feesAccount, feesAccountTokens);
        
        // Issue new tokens
        await stoxShadowToken.issue(player1Account, 1000);
        await stoxShadowToken.issue(player2Account, 1000);
        
    }    

before (async function() {
    
    stoxShadowToken = await ExtendedERC20Token.new("Stox Shadow", "STXSH", 18);
    stoxShadowToken.totalSupply = 10000;

    smartWalletImpl = await SmartWalletImpl.new();
    relayDispatcher = await RelayDispatcher.new(trueOwner, smartWalletImpl.address);
    
});

it ("verify set user withdrawal account works with a relay account", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    await iex1.setUserWithdrawalAccount(player1Account,{from: trueOwner});
    
    let setAccount = (await player1UpgradableWallet.wallet.call())[2];
    assert.equal(setAccount,player1Account);

    }); 

it ("verify set user withdrawal account event works with a relay account", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    await iex1.setUserWithdrawalAccount(player1Account,{from: trueOwner});
    
    var _Receipt = SmartWalletImpl.at(player1UpgradableWallet.address);
    var _Event = _Receipt.SetUserWithdrawalAccount();
    
    utils.ensureEvent(_Event,"SetUserWithdrawalAccount");
    
    });

it ("should throw if relay contract address on wallet creation is set to 0", async function() {
    
    try {
        player1UpgradableWallet = await UpgradableSmartWallet.new(backupAccount,trueOwner,feesAccount, "0x0");
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");
        
    });

it ("should throw if relay version address on relay version contract creation is set to 0", async function() {
    
    try {
        relayDispatcher = await RelayDispatcher.new(trueOwner, "0x0"); 
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");
        
    });

it ("should throw if relay version contract operator on relay version contract creation is set to 0", async function() {
    
    try {
        relayDispatcher = await RelayDispatcher.new("0x0", smartWalletImpl.address); 
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");
        
    });

it ("should throw if non-operator tries to set the relay version address", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    smartWalletImpl2 = await SmartWalletImpl.new();

    try {
        await relayDispatcher.setSmartWalletImplAddress(smartWalletImpl.address, {from: nonOwner}); 
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");

    }); 

it ("verify that a relay version address is set", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    smartWalletImpl2 = await SmartWalletImpl.new();

    await relayDispatcher.setSmartWalletImplAddress(smartWalletImpl2.address, {from: trueOwner}); 
    
    let smartWalletImplAddress = await relayDispatcher.smartWalletImplAddress();

    assert.equal(smartWalletImplAddress,smartWalletImpl2.address);

    }); 
    
it ("verify that setting a relay version address fires the corresponding event", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    smartWalletImpl2 = await SmartWalletImpl.new();
    await relayDispatcher.setSmartWalletImplAddress(smartWalletImpl2.address, {from: trueOwner}); 
    
    var _Receipt = RelayDispatcher.at(relayDispatcher.address);    
    var _Event = _Receipt.SetSmartWalletImplAddress();
    
    utils.ensureEvent(_Event,"SetSmartWalletImplAddress");
    
    });

it ("verify that a non-owner cannot send Tokens to a user account", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    await iex1.setUserWithdrawalAccount(player1Account,{from: trueOwner});
    
    try {
        await iex1.transferToUserWithdrawalAccount(stoxShadowToken.address, 500, stoxShadowToken.address, 500, {from: nonOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }

    assert.equal(false, "Didn't throw");

    }); 

it ("verify that funds can be sent to a player", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    //need a larger balance for this test
    await stoxShadowToken.issue(player1UpgradableWallet.address,500);
   
    await iex1.setUserWithdrawalAccount(player1Account,{from: trueOwner});
    tx_result = await iex1.transferToUserWithdrawalAccount(stoxShadowToken.address,100, stoxShadowToken.address, 100, {from: trueOwner});
       
    var _Receipt = SmartWalletImpl.at(player1UpgradableWallet.address);
    var _Event = _Receipt.TransferToUserWithdrawalAccount();
        
    utils.ensureEvent(_Event,"TransferToUserWithdrawalAccount");
    
    assert.equal(isRelayEventLogArgValid(tx_result.receipt,2,2,66,stoxShadowToken.address.toString().substring(2)) &&
                    isRelayEventLogArgValid(tx_result.receipt,2,66,130,player1Account.toString().substring(2)) &&
                    isRelayEventLogArgValid(tx_result.receipt,2,130,194,(100).toString(16)) && 
                    isRelayEventLogArgValid(tx_result.receipt,2,194,258,stoxShadowToken.address.toString().substring(2)) && 
                    isRelayEventLogArgValid(tx_result.receipt,2,258,322,feesAccount.toString().substring(2)) &&
                    isRelayEventLogArgValid(tx_result.receipt,2,322,386,(100).toString(16)),
                    true);
    
    let player1Tokens = await stoxShadowToken.balanceOf(player1Account);

    assert.equal(player1Tokens,1100);

    });
   

it ("verify that fee is sent when transfering fund to the user", async function() {

    await initTokens();
    await initUpgradableWallets();

     //need a larger balance for this test
     await stoxShadowToken.issue(player1UpgradableWallet.address,500);
    
     await iex1.setUserWithdrawalAccount(player1Account,{from: trueOwner});
     tx_result = await iex1.transferToUserWithdrawalAccount(stoxShadowToken.address,100, stoxShadowToken.address, 100, {from: trueOwner});
     
    let feesAccountTokens = await stoxShadowToken.balanceOf(feesAccount);

    assert.equal(feesAccountTokens,100);

    });
    

it ("should throw if trying to transfer funds to an account that is not set yet", async function() {
    await initTokens();
    await initUpgradableWallets();
    
    //need a larger balance for this test
    await stoxShadowToken.issue(player1UpgradableWallet.address,500);
    
    try {
        tx_result = await iex1.transferToUserWithdrawalAccount(stoxShadowToken.address,100, stoxShadowToken.address, 100, {from: trueOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }

    assert.equal(false, "Didn't throw");

    });
    
it ("should throw if the backup account address is set to 0", async function() {
    
    await initTokens();
    await initUpgradableWallets();
    
    try {
        player1UpgradableWallet = await UpgradableSmartWallet.new('0x0',trueOwner,feesAccount, relayDispatcher.address);
        
        
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");
    
    });

it ("should throw if the operator address is set to 0", async function() {
    
    await initTokens();
    await initUpgradableWallets();
    
    try {
        player1UpgradableWallet = await UpgradableSmartWallet.new(backupAccount,'0x0',feesAccount, relayDispatcher.address);
        
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");
    
    }); 

it ("should throw if the fees account address is set to 0", async function() {
    
    await initTokens();
    await initUpgradableWallets();
    
    try {
        player1UpgradableWallet = await UpgradableSmartWallet.new(backupAccount,trueOwner,'0x0', relayDispatcher.address);
        
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");
    
    });       
    
it ("should throw if user withdrawal account address is set to 0", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    try {
        await iex1.setUserWithdrawalAccount('0x0',{from: trueOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");
    
    });


it ("should throw if user withdrawal account is not set", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    let tx_result =  await iex1.setUserWithdrawalAccount(player1Account,{from: trueOwner});
    
    var _Receipt = SmartWalletImpl.at(player1UpgradableWallet.address);
    var _Event = _Receipt.SetUserWithdrawalAccount();
        
    utils.ensureEvent(_Event,"SetUserWithdrawalAccount");
       
    assert.equal(isRelayEventLogArgValid(tx_result.receipt,0,2,66,player1Account.toString().substring(2)), true);

    let userAccount = (await player1UpgradableWallet.wallet.call())[2];
    assert.equal(userAccount,player1Account);

    });

    

it ("should throw if the backup account is not set", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    let setBackupAccount = (await player1UpgradableWallet.wallet.call())[1];
    
    assert.equal(setBackupAccount, backupAccount);

    });

it ("should throw if the fees account is not set", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    let setFeesAccount = (await player1UpgradableWallet.wallet.call())[3];
    
    assert.equal(setFeesAccount, feesAccount);

    });

it ("should throw if the operator address is not set", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    let operatorAddress = (await player1UpgradableWallet.wallet.call())[0];
    
    assert.equal(operatorAddress, trueOwner);

    });    
 

it ("should throw if the withdrawal account address is not set to 0 upon init", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    let withdrawalAccountAddress = (await player1UpgradableWallet.wallet.call())[2];
    
    assert.equal(withdrawalAccountAddress, 0x0);

    });

it ("should throw if user withdrawal account is set twice", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    await iex1.setUserWithdrawalAccount(player1Account,{from: trueOwner});
    
    try {
        await iex1.setUserWithdrawalAccount(player2Account,{from: trueOwner});
    } catch (error) {
        return utils.ensureException(error); 
    }

    assert.equal(false, "Didn't throw");

    });

 

it ("should throw if a non-owner tries to set a user withdrawal account", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    try {
        await iex1.setUserWithdrawalAccount(player2Account, {from: nonOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");

    });

it ("verify that funds can be sent to the backup account", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    //need a larger balance for this test
    await stoxShadowToken.issue(player1UpgradableWallet.address,500);
    
    tx_result = await iex1.transferToBackupAccount(stoxShadowToken.address,100, {from: trueOwner});
      
    var _Receipt = IUpgradableSmartWallet.at(player1UpgradableWallet.address);
    var _Event = _Receipt.TransferToBackupAccount();
        
    utils.ensureEvent(_Event,"TransferToBackupAccount");
    
    assert.equal(isRelayEventLogArgValid(tx_result.receipt,1,2,66,stoxShadowToken.address.toString().substring(2)) &&
                    isRelayEventLogArgValid(tx_result.receipt,1,66,130,backupAccount.toString().substring(2)) &&
                    isRelayEventLogArgValid(tx_result.receipt,1,130,194,(100).toString(16)), 
                    true);
    
    let backupAccountTokens = await stoxShadowToken.balanceOf(backupAccount);

    assert.equal(backupAccountTokens,100);

    });

  

it ("verify that a non-owner cannot send Tokens to the backup account", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    try {
        await iex1.transferToBackupAccount(stoxShadowToken.address, 500, {from: nonOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }

    assert.equal(false, "Didn't throw");

    }); 
    
it ("verify that the amount to send is not negative", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    await iex1.setUserWithdrawalAccount(player1Account,{from: trueOwner});
    
    try {
        await iex1.transferToUserWithdrawalAccount(stoxShadowToken.address, -500, stoxShadowToken.address, 500);
    } catch (error) {
        return utils.ensureException(error);        
    }

    assert.equal(false, "Didn't throw");

    }); 
    
it ("Verify set of new Relay Dispatcher", async function() {

    await initTokens();
    await initUpgradableWallets();

    let smartWalletImplNew = await SmartWalletImpl.new();
    let relayDispatcherNew = await RelayDispatcher.new(trueOwner, smartWalletImplNew.address);

    await iex1.setRelayDispatcher(relayDispatcherNew.address);

    let relayDispatcherAddress = (await player1UpgradableWallet.wallet.call())[4];

    assert.equal(relayDispatcherAddress,relayDispatcherNew.address);


    });


it ("Verify no set of new Relay Dispatcher address 0", async function() {

    await initTokens();
    await initUpgradableWallets();

    try {
        await iex1.setRelayDispatcher("0x0");  
    } catch (error) {
        return utils.ensureException(error);  
    }

    assert.equal(false, "Didn't throw");
          
    });

it ("Verify event with correct parameters fired for setting a new Relay Dispatcher", async function() {
    
    await initTokens();
    await initUpgradableWallets();

    let smartWalletImplNew = await SmartWalletImpl.new();
    let relayDispatcherNew = await RelayDispatcher.new(trueOwner, smartWalletImplNew.address);
    
    tx_result = await iex1.setRelayDispatcher(relayDispatcherNew.address);
      
    var _Receipt = IUpgradableSmartWallet.at(player1UpgradableWallet.address);
    var _Event = _Receipt.SetRelayDispatcher();
        
    utils.ensureEvent(_Event,"SetRelayDispatcher");
    
    assert.equal(isRelayEventLogArgValid(tx_result.receipt,0,2,66,relayDispatcherNew.address.toString().substring(2)),
                true);

    });



it ("Verify no set of new Relay Dispatcher address by non-owner", async function() {
    
        await initTokens();
        await initUpgradableWallets();

        let smartWalletImplNew = await SmartWalletImpl.new();
        let relayDispatcherNew = await RelayDispatcher.new(trueOwner, smartWalletImplNew.address);
        
        try {
            await iex1.setRelayDispatcher(relayDispatcherNew.address, {from: nonOwner});  
        } catch (error) {
            return utils.ensureException(error);  
        }
    
        assert.equal(false, "Didn't throw");
              
        });

});
