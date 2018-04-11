var Presale = artifacts.require("./PreSale.sol");
var Crowdsale = artifacts.require("./rICO.sol");
var DividendDistributor = artifacts.require("./DividendDistributor.sol");
var Rico = artifacts.require("./RicoToken.sol");

var nowTimestamp = Math.round(+new Date() / 1000);

var wallet = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';

module.exports = function (deployer) {
    deployer.deploy(Rico).then(function () {
        return deployer.deploy(Presale, nowTimestamp, 20, wallet, Rico.address, 150000000000000);
    }).then(function () {
        return deployer.deploy(Crowdsale, nowTimestamp, wallet, Rico.address, Presale.address, 150000000000000);
    }).then(function () {
        return deployer.deploy(DividendDistributor, Rico.address);
    })
};