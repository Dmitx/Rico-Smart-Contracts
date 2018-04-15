// Change in rICO contract:
//      hardCap = 150
//      softCap = 15

import ether from './helpers/ether';
import {advanceBlock} from './helpers/advanceToBlock';
import {increaseTimeTo, duration} from './helpers/increaseTime';
import latestTime from './helpers/latestTime';

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

var chai = require('chai');
var assert = chai.assert;

const RicoToken = artifacts.require("RicoToken");
const rICO = artifacts.require("rICO");
const PreSale = artifacts.require("PreSale");

contract('rICOTest', function ([_, owner, investor, wallet, accounts]) {

    const minimumInvest = 10000;

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    });

    beforeEach(async function () {
        this.startTimePreSale = latestTime() - duration.weeks(4);
        this.endTimePreSale = latestTime();
        this.periodPreSale = this.endTimePreSale - this.startTimePreSale;

        this.startTimerICO = latestTime();
        this.endTimerICO = this.startTimerICO + duration.days(200);

        this.token =  await RicoToken.new();
        this.preSale = await PreSale.new(
            this.startTimePreSale, this.periodPreSale, wallet, this.token.address, minimumInvest, { from: owner }
        );
        this.rICO = await rICO.new(
            this.startTimerICO, wallet, this.token.address, this.preSale.address, minimumInvest, { from: owner }
        );

        await this.token.addAdmin(this.rICO.address);
    });

    describe('withdrowal', function () {

        it('should pass due to wei raised > soft cap', async function () {
            await this.rICO.sendTransaction({ from: web3.eth.accounts[0], value: web3.toWei(5, "ether"), gas: "220000"});
            await this.rICO.sendTransaction({ from: web3.eth.accounts[1], value: web3.toWei(5, "ether"), gas: "220000" });
            await this.rICO.sendTransaction({ from: web3.eth.accounts[2], value: web3.toWei(5, "ether"), gas: "220000" });
            await this.rICO.sendTransaction({ from: web3.eth.accounts[3], value: web3.toWei(5, "ether"), gas: "220000" });
            await increaseTimeTo(this.endTimerICO);

            this.rICO.withdrawal({from: owner}).should.be.fulfilled;
        });

    });

    describe('refund methods', function () {

        it('refundPart() should pass', async function () {
            await this.rICO.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(16, "ether"), gas: "220000"});
            await increaseTimeTo(this.startTimerICO + duration.days(100));
            await this.rICO.refundPart({from: web3.eth.accounts[2]}).should.be.fulfilled;
        });

    });


    describe('updateReservedWei', function () {

        it('updateReservedWei() should fail due to no endTime of CrowdSale', async function () {
            await this.rICO.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(16, "ether"), gas: "220000"});
            await increaseTimeTo(this.startTimerICO + duration.days(10));
            await this.rICO.updateReservedWei({from: web3.eth.accounts[2]}).should.be.rejectedWith('revert');
        });

        it('updateReservedWei() should fail due to endRefundableTime', async function () {
            await this.rICO.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(16, "ether"), gas: "220000"});
            await increaseTimeTo(this.startTimerICO + duration.days(155));
            await this.rICO.updateReservedWei({from: web3.eth.accounts[2]}).should.be.rejectedWith('revert');
        });

        it('updateReservedWei() should pass', async function () {
            await this.rICO.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(16, "ether"), gas: "220000"});
            await increaseTimeTo(this.startTimerICO + duration.days(120));
            await this.rICO.updateReservedWei({from: web3.eth.accounts[2]}).should.be.fulfilled;
        });

    });

})