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


const RicoToken = artifacts.require('RicoToken');
const PreSale = artifacts.require("PreSale");


contract('PreSaleTest', function ([_, owner, investor, wallet, otherAccount]) {

    const minimumInvest = 10000;

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    });

    beforeEach(async function () {
        this.startTime = latestTime();
        this.period = 100;
        this.endTime = this.startTime + duration.days(this.period) + duration.seconds(1);

        this.token =  await RicoToken.new();
        this.preSale = await PreSale.new(
            this.startTime, this.period, wallet, this.token.address, minimumInvest, { from: owner }
        );

        await this.token.addAdmin(this.preSale.address);
    });

    describe('creating a valid PreSale', function () {
        it('should fail with zero period', async function () {
            await PreSale.new(
                this.startTime, 0, wallet, this.token.address, minimumInvest, { from: owner }
            ).should.be.rejectedWith('revert');
        });

        it('should fail with zero token address', async function () {
            await PreSale.new(
                this.startTime, this.period, wallet, 0, minimumInvest, { from: owner }
            ).should.be.rejectedWith(Error);
        });
    });

    describe('check hasEnded method', function () {
        it('should return false with presale event not ended', async function () {
            await this.preSale.hasEnded().then(result => {
                result.should.be.false
            });
        });
    });

    describe('payable method', function () {

        it('should fail with beneficiary 0', async function () {
            await this.preSale.sendTransaction({ value: minimumInvest, from: 0 }).should.be.rejectedWith(Error);
        });

        it('should fail with value < minimumInvest', async function () {
            await this.preSale.sendTransaction({ value: 10, from: investor }).should.be.rejectedWith('revert');
        });

        it('should pass with value minimumInvest', async function () {
            await this.preSale.sendTransaction({ value: minimumInvest, from: owner }).should.be.fulfilled;
        });

    });

    describe('finish PreSale method', function () {

        it('should fail with wei not raised', async function () {
            await this.preSale.finishPreSale().should.be.rejectedWith('revert');
        });

        it('should pass due to hardcap', async function () {
            await this.token.addAdmin(this.preSale.address);
            await this.preSale.sendTransaction({from: web3.eth.accounts[1], value: web3.toWei(600, "ether"), gas: "220000"});
            await this.preSale.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(1000, "ether"), gas: "220000"});
            await this.preSale.finishPreSale({from: owner}).should.be.fulfilled;
        });

        it('should pass due to endTime', async function () {
            await this.token.addAdmin(this.preSale.address);
            await this.preSale.sendTransaction({from: web3.eth.accounts[1], value: web3.toWei(500, "ether"), gas: "220000"});
            await this.preSale.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(500, "ether"), gas: "220000"});
            await increaseTimeTo(this.endTime);
            await this.preSale.finishPreSale({from: owner}).should.be.fulfilled;
        });


    });

    describe('refund method', function () {

        it('should fail with no end time for PreSale', async function () {
            await this.preSale.refund().should.be.rejectedWith('revert');
        });

        it('should pass with increasing time to endTime', async function () {
            await this.token.addAdmin(this.preSale.address);
            await this.preSale.sendTransaction({from: web3.eth.accounts[2], value: web3.toWei(1, "ether"), gas: "220000"});
            await increaseTimeTo(this.endTime);
            await this.preSale.refund({from: web3.eth.accounts[2]}).should.be.fulfilled;
        });

    });

})