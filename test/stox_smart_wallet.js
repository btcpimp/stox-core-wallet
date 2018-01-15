const utils = require('./helpers/utils');

const StoxTestToken = artifacts.require("./token/StoxTestToken.sol");
const SmartWallet = artifacts.require("./SmartWallet/StoxSmartWallet.sol");

let stoxTestToken;
let smartWallet;

//Accounts
let trueOwner;
let nonOwner;
let player1;
let player2;
let backupAccount;

//Misc.
let realGasPrice; 

function getLogArg(result, arg, logIndex = 0) {
    return result.logs[logIndex].args[arg];
}

contract ('StoxSmartWallet', function(accounts) {

    let trueOwner     = accounts[0];
    let nonOwner      = accounts[1];
    let player1       = accounts[2];
    let player2       = accounts[3];
    let backupAccount = accounts[4];

    let realGasPrice = 40000000000; //update from https://ethgasstation.info/

    async function initSmartWallet() {

        smartWallet = await SmartWallet.new(backupAccount, trueOwner);
        stoxTestToken.issue(smartWallet.address,10000);
        
    }
    
    async function initPlayers() {
               
        // Clear existing players tokens
        let player1Tokens = await stoxTestToken.balanceOf.call(player1);
        let player2Tokens = await stoxTestToken.balanceOf.call(player2);
        let backupAccountTokens = await stoxTestToken.balanceOf.call(backupAccount);
        
        await stoxTestToken.destroy(player1, player1Tokens);
        await stoxTestToken.destroy(player2, player2Tokens);
        await stoxTestToken.destroy(backupAccount, backupAccountTokens);
        
        // Issue new tokens
        await stoxTestToken.issue(player1, 1000);
        await stoxTestToken.issue(player2, 1000);
        
    }



before (async function() {
    
    stoxTestToken = await StoxTestToken.new("Stox Test", "STX", 18);
    stoxTestToken.totalSupply = 10000;
    
    });


it ("should throw if trying to transfer funds to an account that is not set yet", async function() {
    
    await initSmartWallet();

    try {
        await smartWallet.transferToUserWithdrawalAccount(stoxTestToken.address, 500, {from: trueOwner});
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

    await smartWallet.setUserWithdrawalAccount(player1, {from: trueOwner});
    
    let userAccount = await smartWallet.userWithdrawalAccount.call();

    assert.equal(userAccount, player1);

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


it ("verify that funds can be sent to a player", async function() {

    await initSmartWallet();
    await initPlayers();

    await smartWallet.setUserWithdrawalAccount(player1, {from: trueOwner});
    await smartWallet.transferToUserWithdrawalAccount(stoxTestToken.address,500, {from: trueOwner});

    let player1Tokens = await stoxTestToken.balanceOf(player1);

    assert.equal(player1Tokens,1500);

    });


it ("verify that funds can be sent to the backup account", async function() {
    
    await initSmartWallet();
    await initPlayers();

    await smartWallet.transferToBackupAccount(stoxTestToken.address, 500, {from: trueOwner});

    let backupAccountTokens = await stoxTestToken.balanceOf(backupAccount);

    assert.equal(backupAccountTokens,500);

    });

it ("verify that a non-owner cannot send Tokens to a user account", async function() {
    
    await initSmartWallet();
    await initPlayers();

    await smartWallet.setUserWithdrawalAccount(player1, {from: trueOwner});

    try {
        await smartWallet.transferToUserWithdrawalAccount(stoxTestToken.address, 500, {from: nonOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }

    assert.equal(false, "Didn't throw");

    }); 

it ("verify that a non-owner cannot send Tokens to the backup account", async function() {
    
    await initSmartWallet();
    await initPlayers();

    await smartWallet.setUserWithdrawalAccount(player1, {from: trueOwner});

    try {
        await smartWallet.transferToBackupAccount(stoxTestToken.address,500, {from: nonOwner});
    } catch (error) {
        return utils.ensureException(error);        
    }

    assert.equal(false, "Didn't throw");

    }); 
    
it ("verify that the amount to send is not negative", async function() {
    
    await initSmartWallet();
    await initPlayers();

    try {
        await smartWallet.transferToUserWithdrawalAccount(stoxTestToken.address,-500);
    } catch (error) {
        return utils.ensureException(error);        
    }

    assert.equal(false, "Didn't throw");

    });  

});
