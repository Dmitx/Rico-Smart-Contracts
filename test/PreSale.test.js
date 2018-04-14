import ether from './helpers/ether';
import {advanceBlock} from './helpers/advanceToBlock';
import {increaseTimeTo, duration} from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

var chai = require('chai');
var assert = chai.assert;

const PreSaleInterface = artifacts.require('./PreSale.sol');
const TokenInterface = artifacts.require('./RicoToken.sol');

contract('PreSaleTest', function ([_, owner, investor, wallet, purchaser]) {
    const value = ether(42);

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    });

    beforeEach(async function () {
        this.openingTime = latestTime() + duration.weeks(1);
        this.periodTimeInDays = 30;
        this.afterClosingTime = this.openingTime + duration.days(this.periodTimeInDays) + duration.seconds(1);
        this.token = await TokenInterface.new();
        this.minimumInvest = ether(15);
        this.preSale = await PreSaleInterface.new(this.openingTime, this.periodTimeInDays, wallet, this.token.address, this.minimumInvest);
    });

    describe('right deploy PreSale contract', function () {

        it("token's admin should be PreSale Contract", async () => {
            let tokenInstance = await TokenInterface.deployed();
            let preSaleInstance = await PreSaleInterface.deployed();

            // unnecessary because add PreSale to admin in migrations
            // await tokenInstance.addAdmin(preSaleInstance.address);

            let isAdmin = await tokenInstance.isAdmin(preSaleInstance.address);
            console.log(isAdmin);
            assert.equal(true, isAdmin);
        });

    });

    describe('valid end of PreSale', function () {

        it('should be ended only after end', async function () {
            let ended = await this.preSale.hasEnded();
            assert.equal(ended, false);
            await increaseTimeTo(this.afterClosingTime);
            ended = await this.preSale.hasEnded();
            assert.equal(ended, true);
        });

    });

    describe('creating a valid PreSale', function () {

        it('should fail with zero period', async function () {
            await PreSaleInterface.new(
                this.startTime, 0, wallet, this.token.address, this.minimumInvest, {from: owner}
            ).should.be.rejectedWith('revert');
        });

        it('should fail with zero token address', async function () {
            await PreSaleInterface.new(
                this.startTime, this.period, wallet, 0, this.minimumInvest, {from: owner}
            ).should.be.rejectedWith('revert');
        });

    });

    describe('accepting payments', function () {
        it('should reject payments before start', async function () {
            await this.preSale.sendTransaction({ value: value, from: investor }).should.be.rejectedWith(EVMRevert);
        });

        it('should accept payments after start', async function () {
            await increaseTimeTo(this.openingTime);
            await this.preSale.sendTransaction({ value: value, from: investor }).should.be.fulfilled;
        });

        it('should reject payments after end', async function () {
            await increaseTimeTo(this.afterClosingTime);
            await this.preSale.sendTransaction({ value: value, from: investor }).should.be.rejectedWith(EVMRevert);
        });
    });

    describe('payable method', function () {

        it('should fail with buy tokens from zero address', async function () {
            this.preSale.sendTransaction({value: value, from: 0}).should.be.rejectedWith(EVMRevert);
        });

        it('should fail with value < minimumInvest', async function () {
            this.preSale.sendTransaction({value: 10, from: investor}).should.be.rejectedWith(EVMRevert);
        });

        it('should pass with value minimumInvest', async function () {
            this.preSale.sendTransaction({ value: this.minimumInvest, from: investor }).should.be.fulfilled;
        });
    });

    describe('finish preSale method', function () {

        it('should fail with wei not raised', async function () {
            this.preSale.finishPreSale().should.be.rejectedWith('revert');
        });

        it('should pass with wei raised and time reached end time', async function () {
            await this.preSale.sendTransaction({ value: value, from: investor });
            await increaseTimeTo(this.afterClosingTime );
            await this.preSale.finishPreSale().should.be.fulfilled;
        });

    });

    describe('refund method', function () {

        it('should fail with reach end time for preSale', async function () {
            this.preSale.refund().should.be.rejectedWith('revert');
        });

        it('should pass with increasing time to endTime', async function () {
            await this.preSale.sendTransaction({ value: minimumInvest, from: owner });
            await increaseTimeTo(this.afterClosingTime );
            await this.preSale.refund();
        });

    });

});