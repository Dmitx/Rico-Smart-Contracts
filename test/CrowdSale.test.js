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

    describe('creating a valid rICO', function () {
        it('should fail with zero token address', async function () {
            rICO.new(
                this.endTimePreSale, wallet, 0, this.preSale.address, minimumInvest, { from: owner }
            ).should.be.rejectedWith('revert');
        });
    });

    describe('check hasEnded method', function () {
        it('should return false with rICO event not ended', async function () {
            this.rICO.hasEnded().then(result => {
                result.should.be.false
            });
        });

        it('should return true with rICO event ended', async function () {
            await increaseTimeTo(this.endTimerICO + duration.days(200));
            this.rICO.hasEnded().then(result => {
                result.should.be.true
            });
        });
    });

    describe('withdrowal', function () {

        it('should fail due to wei raised < soft cap', async function () {
            this.rICO.withdrawal().should.be.rejectedWith('revert');
        });

    });

    describe('finishCrowdsale', function () {

        it('should fail due to wei raised < soft cap', async function () {
            this.rICO.finishCrowdSale().should.be.rejectedWith('revert');
        });

    });

    describe('payable method', function () {

        it('should fail with beneficiary 0', async function () {
            this.rICO.sendTransaction({ from: 0, value: web3.toWei(500, "ether"), gas: "220000" }).should.be.rejectedWith('revert');
        });

        it('should fail with value < minimumInvest', async function () {
            this.rICO.sendTransaction({ from: web3.eth.accounts[0], value: 10, gas: "220000"}).should.be.rejectedWith('revert');
        });

        it('should pass with value minimumInvest', async function () {
            this.rICO.sendTransaction({ from: web3.eth.accounts[0], value: web3.toWei(10, "ether"), gas: "220000" }).should.be.fulfilled;
        });

    });

    describe('refund methods', function () {

        it('refund() should fail due to no endTime of CrowdSale', async function () {
            await this.rICO.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(1, "ether"), gas: "220000"});
            await increaseTimeTo(this.startTimerICO + duration.days(10));
            await this.rICO.refund({from: web3.eth.accounts[2]}).should.be.rejectedWith('revert');
        });

        it('refund() should pass', async function () {
            await this.rICO.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(1, "ether"), gas: "220000"});
            await increaseTimeTo(this.startTimerICO + duration.days(120));
            await this.rICO.refund({from: web3.eth.accounts[2]}).should.be.fulfilled;
        });

        it('refundPart() should fail due to no endTime of CrowdSale', async function () {
            await this.rICO.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(1, "ether"), gas: "220000"});
            await increaseTimeTo(this.startTimerICO + duration.days(10));
            await this.rICO.refundPart({from: web3.eth.accounts[2]}).should.be.rejectedWith('revert');
        });

        it('refundPart() should fail due to endRefundableTime', async function () {
            await this.rICO.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(1, "ether"), gas: "220000"});
            await increaseTimeTo(this.startTimerICO + duration.days(155));
            await this.rICO.refundPart({from: web3.eth.accounts[2]}).should.be.rejectedWith('revert');
        });

        it('refundPart() should fail due to weiRaised < hardCap', async function () {
            await this.rICO.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(1, "ether"), gas: "220000"});
            await increaseTimeTo(this.startTimerICO + duration.days(100));
            await this.rICO.refundPart({from: web3.eth.accounts[2]}).should.be.rejectedWith('revert');
        });

    });


    describe('updateReservedWei', function () {

        it('updateReservedWei() should fail due to wei raised < soft cap', async function () {
            await this.rICO.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(1, "ether"), gas: "220000"});
            await increaseTimeTo(this.startTimerICO + duration.days(120));
            await this.rICO.updateReservedWei({from: web3.eth.accounts[2]}).should.be.rejectedWith('revert');
        });

    });

})