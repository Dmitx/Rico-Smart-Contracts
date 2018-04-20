import ether from './helpers/ether';
import {advanceBlock} from './helpers/advanceToBlock';
import latestTime from './helpers/latestTime';
import {duration} from "./helpers/increaseTime";

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

var chai = require('chai');
var assert = chai.assert;


const RicoToken = artifacts.require("RicoToken");
const DividendDistributor = artifacts.require("DividendDistributor");
const PreSale = artifacts.require("PreSale");


contract('DividendDistributor', function ([_, owner, investor, wallet, accounts]) {

    const minimumInvest = 10000;

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    });

    beforeEach(async function () {
        this.startTimePreSale = latestTime() - duration.weeks(4);
        this.endTimePreSale = latestTime();
        this.periodPreSale = this.endTimePreSale - this.startTimePreSale;

        this.token =  await RicoToken.new();
        this.dividendDistributor = await DividendDistributor.new(this.token.address, { from: owner });
        this.preSale = await PreSale.new(
            this.startTimePreSale, this.periodPreSale, wallet, this.token.address, minimumInvest, { from: owner }
        );

        await this.token.transferOwnership(this.preSale.address);
        // await this.token.addAdmin(this.dividendDistributor.address);

        await this.preSale.sendTransaction({from: web3.eth.accounts[1], value: web3.toWei(1, "ether"), gas: "220000"});
        await this.dividendDistributor.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(10, "ether"), gas: "220000"});
    });

    describe('creating a valid DividendDistributor', function () {
        it('should fail with zero token address', async function () {
            await DividendDistributor.new(0, { from: owner }
            ).should.be.rejectedWith(Error);
        });
    });

    describe('payable method', function () {

        it('should pass', async function () {
            await this.dividendDistributor.sendTransaction({from: web3.eth.accounts[1], value: web3.toWei(1, "ether"), gas: "220000"}).should.be.fulfilled;
        });

    });

    describe('getDividend and transfer tokens', function () {

        it('should pass due to dividend payments from first account', async function () {
            var balance;

            await this.token.balanceOf(web3.eth.accounts[1]).then(result => {
                balance = result;
            });

            assert.equal(await this.dividendDistributor.getDividend.call({from: web3.eth.accounts[1]}), true);

            await this.dividendDistributor.getDividend({from: web3.eth.accounts[1]});
            await this.token.transfer(web3.eth.accounts[3], balance, {from: web3.eth.accounts[1]});

            assert.equal(await this.dividendDistributor.getDividend.call({from: web3.eth.accounts[3]}), false);
        });

        it('should pass due to no dividend payments from first account', async function () {
            var balance;

            await this.token.balanceOf(web3.eth.accounts[1]).then(result => {
                balance = result;
            });

            await this.token.transfer(web3.eth.accounts[2], balance, {from: web3.eth.accounts[1]});

            assert.equal(await this.dividendDistributor.getDividend.call({from: web3.eth.accounts[2]}), true);
        });
    });

    describe('getDividend and check investor balance', function () {

        it('should pass and check right investor balance', async function () {

            const investor1 = web3.eth.accounts[4];

            await this.preSale.sendTransaction({from: investor1, value: web3.toWei(3, "ether"), gas: "220000"}).should.be.fulfilled;

            let balanceBefore1 = await web3.eth.getBalance(investor1).toNumber();

            await this.dividendDistributor.getDividend({from: investor1});

            let balanceAfter1 = await web3.eth.getBalance(investor1).toNumber();

            assert.equal(balanceBefore1 < balanceAfter1 - ether(7), true);

        });

        it('should pass and check right investors balances', async function () {

            const investor1 = web3.eth.accounts[4];
            const investor2 = web3.eth.accounts[5];

            await this.preSale.sendTransaction({from: investor1, value: web3.toWei(1, "ether"), gas: "220000"}).should.be.fulfilled;
            await this.preSale.sendTransaction({from: investor2, value: web3.toWei(2, "ether"), gas: "220000"}).should.be.fulfilled;

            let balanceBefore1 = await web3.eth.getBalance(investor1).toNumber();
            let balanceBefore2 = await web3.eth.getBalance(investor2).toNumber();

            await this.dividendDistributor.getDividend({from: investor1});
            await this.dividendDistributor.getDividend({from: investor2});

            let balanceAfter1 = await web3.eth.getBalance(investor1).toNumber();
            let balanceAfter2 = await web3.eth.getBalance(investor2).toNumber();

            assert.equal(balanceBefore1 < balanceAfter1 - ether(2), true);
            assert.equal(balanceBefore2 < balanceAfter2 - ether(4), true);

        });

    });

})