# Smart Contracts for RICO

# Project description 

Unknown///

# Dependencies 
[![truffle](https://img.shields.io/badge/truffle-v3.4.11-orange.svg)](https://truffle.readthedocs.io/en/latest/)
[![solidity](https://img.shields.io/badge/solidity-docs-red.svg)](http://solidity.readthedocs.io/en/develop/types.html)

# Smart contracts

## [Token](???)
ERC20 mintable token with additional overridings to create a  possibility of dividends issuing and investment refund

Token | Parameters
------------ | -------------
Token name	| Unknown
Symbol 	 | Unknown
Decimals |	18
Token amount to issue |	100 000 000
Additional token emission |	no
Freeze tokens | no
Burnable | yes


## [Pre-Sale](???)
Basic Parameters of Presale

First Header | Second Header
------------ | -------------
Token price in ETH	| 0,00015 ETH
Token Bonus |	50% for participants
Soft Cap 150 ETH | Hard Cap 1500 ETH
Refund Terms	| If Soft Cap is not reached
Withdrawal terms | After the end of Pre-Sale
Manual token issue (if founders accepts BTC/USD/EURO) |	no
Pre-Sale dates	| To be delivered

## [rICO=refundable ICO](???)

First Header | Second Header
------------ | -------------
Token price in ETH	| 0,00015 ETH
Token Bonus |	From 150 to 1500=20%(including Pre-Sale ETH), 1501 to 5000 = 10%, 5001 to 10000 = 5%
Soft Cap 1500 ETH | Hard Cap 15000 ETH
Refund Terms	| If Soft Cap is not reached/ In refund smart contract
Withdrawal terms | In refund smart contract
Manual token issue (if founders accepts BTC/USD/EURO)	| no
rICO dates	| To be delivered

## [Refund](???)
After the end of rICO refund function will be available for 90 days for rICO participants. Token equivalent to funds refunded will be burned. They will be able to refund their funds following stated conditions:

Funds | Conditions
------------ | -------------
750 ETH	| After the end of rICO 750 ETH will be withdrawn and won't be included in refund cap(if they wouldn't be withdrawn they must don't be included in refund cap too)
30% 	 | After 60 days from Refund contract start 30% of total cap will be unlocked for founders withdrawal
100% |	After 30 days from Refund contract start 100% of remaining funds will be unlocked for founders withdrawal

## [Dividends](???)
Dividends mechanism: any sum transfered to Dividends contract adress may be withdrawn in appropriate to investor's token stake amount, i.e. 10% total tokens = 10% of total dividends. Tokens inherit dividends mechanism even if transfered to other person

# Created by 
<p align="center">
  <img width="240" height ="240" alt="Hashlab" src = "Rico/logowhite.png">
</p>
