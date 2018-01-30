const utils = require('./helpers/utils');

const StoxTestToken = artifacts.require("./token/StoxTestToken.sol");
const SmartWallet = artifacts.require("./SmartWallet/SmartWallet.sol");

let stoxTestToken;
let smartWallet;

//Accounts
let trueOwner;
let nonOwner;
let player1;
let player2;
let backupAccount;
let feesAccount;
let tokenAccount;

function isEventArgValid(arg_value,expected_value){
    return (arg_value == expected_value);
}

function getLog(result,name,logIndex = 0) {
    return result.logs[logIndex][name];
}

function getLogArg(result, arg, logIndex = 0) {
    return result.logs[logIndex].args[arg];
}

contract ('SmartWallet', function(accounts) {

    let trueOwner     = accounts[0];
    let nonOwner      = accounts[1];
    let player1       = accounts[2];
    let player2       = accounts[3];
    let backupAccount = accounts[4];
    let feesAccount   = accounts[5];

    async function initSmartWallet() {

        smartWallet = await SmartWallet.new(backupAccount, trueOwner, feesAccount);
        await stoxTestToken.issue(smartWallet.address,10000);
        
    }
    
    async function initPlayers() {
               
        // Clear existing players tokens
        let player1Tokens = await stoxTestToken.balanceOf.call(player1);
        let player2Tokens = await stoxTestToken.balanceOf.call(player2);
        let backupAccountTokens = await stoxTestToken.balanceOf.call(backupAccount);
        let feesAccountTokens = await stoxTestToken.balanceOf.call(feesAccount);
        
        await stoxTestToken.destroy(player1, player1Tokens);
        await stoxTestToken.destroy(player2, player2Tokens);
        await stoxTestToken.destroy(backupAccount, backupAccountTokens);
        await stoxTestToken.destroy(feesAccount, feesAccountTokens);
        
        // Issue new tokens
        await stoxTestToken.issue(player1, 1000);
        await stoxTestToken.issue(player2, 1000);
        
    }

before (async function() {
    
    stoxTestToken = await StoxTestToken.new("Stox Test", "STX", 18);
    stoxTestToken.totalSupply = 10000;
    
    });

it ("verify that a non-owner cannot send Tokens to a user account", async function() {
    
    await initSmartWallet();
    await initPlayers();

    await smartWallet.setUserWithdrawalAccount(player1, {from: trueOwner});

    try {
        await smartWallet.transferToUserWithdrawalAccount(stoxTestToken.address, 500, stoxTestToken.address, 500, {from: nonOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }

    assert.equal(false, "Didn't throw");

    }); 

it ("verify that funds can be sent to a player", async function() {
    
        await initSmartWallet();
        await initPlayers();
    
        await smartWallet.setUserWithdrawalAccount(player1, {from: trueOwner});
        let transactionResult = await smartWallet.transferToUserWithdrawalAccount(stoxTestToken.address,500, stoxTestToken.address, 500, {from: trueOwner});

        let event  = getLog(transactionResult,"event")
        console.log({event})
        assert.equal(event,"TransferToUserWithdrawalAccount")

        assert.equal(isEventArgValid(getLogArg(transactionResult,"_token"),stoxTestToken.address) &&
                        isEventArgValid(getLogArg(transactionResult,"_userWithdrawalAccount"),player1) &&
                        isEventArgValid(getLogArg(transactionResult,"_amount"),500) && 
                        isEventArgValid(getLogArg(transactionResult,"_feesToken"),stoxTestToken.address) && 
                        isEventArgValid(getLogArg(transactionResult,"_feesAccount"),feesAccount) &&
                        isEventArgValid(getLogArg(transactionResult,"_fee"),500),
                        true);

        let player1Tokens = await stoxTestToken.balanceOf(player1);
    
        assert.equal(player1Tokens,1500);
    
        });

it ("verify that fee is sent when transfering fund to the user", async function() {
    
        await initSmartWallet();
        await initPlayers();
    
        await smartWallet.setUserWithdrawalAccount(player1, {from: trueOwner});
        await smartWallet.transferToUserWithdrawalAccount(stoxTestToken.address, 500, stoxTestToken.address, 500, {from: trueOwner});
    
        let feesAccountTokens = await stoxTestToken.balanceOf(feesAccount);
    
        assert.equal(feesAccountTokens,500);
    
        });


it ("should throw if trying to transfer funds to an account that is not set yet", async function() {
    await initSmartWallet();
    
    try {
        await smartWallet.transferToUserWithdrawalAccount(stoxTestToken.address, 500, stoxTestToken.address, 500, {from: trueOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }

    assert.equal(false, "Didn't throw");

    }); 

it ("should throw if the backup account address is set to 0", async function() {
    
    try {
        smartWallet = await SmartWallet.new('0x0', trueOwner, feesAccount);
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");
    
    });

it ("should throw if the operator address is set to 0", async function() {
    
    try {
        smartWallet = await SmartWallet.new(backupAccount, '0x0', feesAccount);
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");
    
    }); 

it ("should throw if the fees account address is set to 0", async function() {
    
    try {
        smartWallet = await SmartWallet.new(backupAccount, trueOwner, '0x0');
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");
    
    });       
    
it ("should throw if user withdrawal account address is set to 0", async function() {
    
    await initSmartWallet();

    try {
        await smartWallet.setUserWithdrawalAccount(0, {from: trueOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");
    
    });
    

it ("should throw if user withdrawal account is not set", async function() {
    
    await initSmartWallet();

    let transactionResult =  await smartWallet.setUserWithdrawalAccount(player1, {from: trueOwner});
    
    let event = getLog(transactionResult,"event");
    console.log({event})
    assert.equal(event,"SetUserWithdrawalAccount");

    assert.equal(isEventArgValid(getLogArg(transactionResult,"_userWithdrawalAccount"),player1), true);

    let userAccount = (await smartWallet.wallet.call())[2];
    assert.equal(userAccount, player1);

    });

it ("should throw if the backup account is not set", async function() {
    
    await initSmartWallet();

    let setBackupAccount = (await smartWallet.wallet.call())[1];
    
    assert.equal(setBackupAccount, backupAccount);

    });

it ("should throw if the fees account is not set", async function() {
    
    await initSmartWallet();

    let setFeesAccount = (await smartWallet.wallet.call())[3];
    
    assert.equal(setFeesAccount, feesAccount);

    });

it ("should throw if the operator address is not set", async function() {
    
    await initSmartWallet();

    let operatorAddress = (await smartWallet.wallet.call())[0];
    
    assert.equal(operatorAddress, trueOwner);

    });

it ("should throw if the withdrawal account address is not set to 0 upon init", async function() {
    
    await initSmartWallet();

    let withdrawalAccountAddress = (await smartWallet.wallet.call())[2];
    
    assert.equal(withdrawalAccountAddress, 0x0);

    });

it ("should throw if user withdrawal account is set twice", async function() {
    
    await initSmartWallet();

    await smartWallet.setUserWithdrawalAccount(player1, {from: trueOwner});
    
    try {
        await smartWallet.setUserWithdrawalAccount(player2, {from: trueOwner});
    } catch (error) {
        return utils.ensureException(error); 
    }

    assert.equal(false, "Didn't throw");

    });

it ("should throw if a non-owner tries to set a user withdrawal account", async function() {

    await initSmartWallet();

    try {
        await smartWallet.setUserWithdrawalAccount(player2, {from: nonOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }
    
    assert.equal(false, "Didn't throw");

    });

it ("verify that funds can be sent to the backup account", async function() {
    
    await initSmartWallet();
    await initPlayers();

    let transactionResult = await smartWallet.transferToBackupAccount(stoxTestToken.address, 500, {from: trueOwner});
    
    let event  = getLog(transactionResult,"event")
    console.log({event})
    assert.equal(event,"TransferToBackupAccount")

    assert.equal(isEventArgValid(getLogArg(transactionResult,"_token"),stoxTestToken.address) &&
                    isEventArgValid(getLogArg(transactionResult,"_backupAccount"),backupAccount) &&
                    isEventArgValid(getLogArg(transactionResult,"_amount"),500),
                    true);

    let backupAccountTokens = await stoxTestToken.balanceOf(backupAccount);
    assert.equal(backupAccountTokens,500);

    });

it ("verify that a non-owner cannot send Tokens to the backup account", async function() {
    
    await initSmartWallet();
    await initPlayers();

    await smartWallet.setUserWithdrawalAccount(player1, {from: trueOwner});

    try {
        await smartWallet.transferToBackupAccount(stoxTestToken.address, 500, {from: nonOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }

    assert.equal(false, "Didn't throw");

    }); 
    
it ("verify that the amount to send is not negative", async function() {
    
    await initSmartWallet();
    await initPlayers();

    try {
        await smartWallet.transferToUserWithdrawalAccount(stoxTestToken.address, -500, stoxTestToken.address, 500);
    } catch (error) {
        return utils.ensureException(error);        
    }

    assert.equal(false, "Didn't throw");

    });  

});
