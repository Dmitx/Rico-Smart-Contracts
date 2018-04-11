const BigNumber = web3.BigNumber;


const Token = artifacts.require('./RicoToken.sol');
const Presale = artifacts.require("./PreSale.sol");


contract('PreSale', function (accounts) {

    it("token's admin should be PreSale Contract", async () => {
        let TokenInstance = await Token.deployed();

        // unnecessary because add PreSale to admin in migrations
        // await TokenInstance.addAdmin(Presale.address);

        let isAdmin = await TokenInstance.isAdmin(Presale.address);
        console.log(isAdmin);
        assert.equal(true, isAdmin);
    })

    // it("whiteList should work correct", async () => {
    //     let TokenInstance = await Token.deployed();
    //     let PresaleInstance = await Presale.deployed();
    //     let WhiteListInstance = await WhiteList.deployed();
    //     let PresaleOwner = await PresaleInstance.owner.call();
    //     let WLOwner = await WhiteListInstance.owner.call();
    //
    //     assert.equal(accounts[0], PresaleOwner, "Presale's Owner");
    //     assert.equal(accounts[0], WLOwner, "WhiteList's Owner");
    //
    //     try {
    //         await PresaleInstance.sendTransaction({ value: 1e+18, from: accounts[1] })
    //         assert.fail()
    //     } catch (error) {
    //         err = error
    //     }
    //     assert.ok(err instanceof Error)
    //     console.log(err)
    //
    //     let tokenBalance = await TokenInstance.balanceOf(accounts[1]).then(result => result.toNumber());
    //     let tokenBalance1 = tokenBalance;
    //     assert.equal(tokenBalance1, 0, "should be zero");
    //
    //     console.log(tokenBalance1)
    //
    //     await WhiteListInstance.addToWhiteList(accounts[1])
    //
    //     let inWL = await WhiteListInstance.isInWhiteList(accounts[1]);
    //
    //     assert.equal(inWL, true, "should be true");
    //
    //     await PresaleInstance.sendTransaction({ value: 1e+18, from: accounts[1] })
    //
    //     tokenBalance = await TokenInstance.balanceOf(accounts[1]);
    //     let tokenBalance2 = tokenBalance.toNumber();
    //     console.log(tokenBalance2)
    // })
    //
    // it("token price can be changed only oracle", async () => {
    //     let TokenInstance = await Token.deployed();
    //     let PresaleInstance = await Presale.deployed();
    //     let WhiteListInstance = await WhiteList.deployed();
    //
    //     try {
    //         await PresaleInstance.changePriceUSD(14692121690100,{from: accounts[1]})
    //         assert.fail()
    //     } catch (error) {
    //         err = error
    //     }
    //     assert.ok(err instanceof Error)
    //     console.log(err)
    //
    //     try {
    //         await PresaleInstance.setOracle(accounts[1], {from: accounts[1]})
    //         assert.fail()
    //     } catch (error) {
    //         err = error
    //     }
    //     assert.ok(err instanceof Error)
    //     console.log(err)
    //
    //
    //     await PresaleInstance.setOracle(accounts[1], {from: accounts[0]})
    //
    //     await PresaleInstance.changePriceUSD(14692121690100,{from: accounts[1]})
    //
    //     let priceUSD = await PresaleInstance.priceUSD.call().then(result => result.toNumber());
    //
    //     assert.equal(priceUSD,14692121690100 , "priceUSD");
    // })
    //
    //
    // it("manual transfer should work correct", async () => {
    //     let TokenInstance = await Token.deployed();
    //     let PresaleInstance = await Presale.deployed();
    //     let WhiteListInstance = await WhiteList.deployed();
    //
    //     try {
    //         await PresaleInstance.manualTransfer(accounts[1], 1000, { from: accounts[1] })
    //         assert.fail()
    //     } catch (error) {
    //         err = error
    //     }
    //     assert.ok(err instanceof Error)
    //     console.log(err)
    //
    //     // manual transfer can be called only from owner or manager
    //     // owner
    //     await PresaleInstance.manualTransfer(accounts[1], 1000, { from: accounts[0] })
    //
    //     let tokenBalance = await TokenInstance.balanceOf(accounts[1]);
    //     tokenBalance = tokenBalance.toNumber();
    //     console.log(tokenBalance)
    //
    //     try {
    //         // can be called only from owner of Presale
    //         await PresaleInstance.setManager(accounts[1], { from: accounts[1] })
    //         assert.fail()
    //     } catch (error) {
    //         err = error
    //     }
    //     assert.ok(err instanceof Error)
    //     console.log(err)
    //
    //     await PresaleInstance.setManager(accounts[1],{ from: accounts[0] })
    //
    //     // manual transfer can be called only from owner or manager
    //     // manager
    //
    //     // send to yourself should work correct
    //     await PresaleInstance.manualTransfer(accounts[1], 1000, { from: accounts[1] })
    //
    //     tokenBalance = await TokenInstance.balanceOf(accounts[1]);
    //     tokenBalance = tokenBalance.toNumber();
    //     console.log(tokenBalance)
    //
    //     // send to another contract should work correct
    //     // from manager
    //     await PresaleInstance.manualTransfer(accounts[2], 1000, { from: accounts[1] })
    //
    //     tokenBalance = await TokenInstance.balanceOf(accounts[2]);
    //     tokenBalance = tokenBalance.toNumber();
    //     console.log(tokenBalance)
    //
    //
    //     try {
    //         // from another contract
    //         await PresaleInstance.sendTransaction({ value: 1e+18, from: accounts[2] })
    //         assert.fail()
    //     } catch (error) {
    //         err = error
    //     }
    //     assert.ok(err instanceof Error)
    //     console.log(err)
    //
    // })

})