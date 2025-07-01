# SLP examples

The following are quick and dirty examples of creating and sending SLP tokens on the eCash chain via the Chronik indexer.

A lot of areas can be simplified and optimized along with additional error handling reviews. e.g. the tx bytesize calculation has been significantly optimized elsewhere but haven't been ported here yet.

This is just meant to give you a rundown of what's involved in creating and sending SLP tokens.

## Installation

```bsh
$ git clone https://github.com/ethanmackie/SLP-Examples
$ cd SLP-Examples
$ npm install
```

## Create a new token

To create a new SLP token, open [createSlp.js](createSlp.js) and customize the following fields:

```
const senderAddress = 'INSERT YOUR TEST WALLET ECASH ADDRESS';
const senderMnemonic = 'INSERT YOUR TEST WALLET MNEMONIC';
const derivationPath = "m/44'/1899'/0'/0/0";

// New token details
const newTokenName = 'KoushCoin';
const newTokenTicker = 'KCN';
const newTokenDecimals = 2;
const newTokenInitialQty = 5000000;
const newTokenDocumentUrl = 'https://twitter.com/e_Koush';
```
Note the senderAddress should have enough XEC to pay for the token creation transaction.

Then execute:
```
$ npm run createSlp
```

## Send a token

To send an SLP token, open [sendSlp.js](sendSlp.js) and customize the following fields:

```
const senderAddress = 'INSERT YOUR TEST WALLET ECASH ADDRESS';
const senderMnemonic = 'INSERT YOUR TEST WALLET MNEMONIC';
const derivationPath = "m/44'/1899'/0'/0/0";
const destinationAddress = 'INSERT DESTINATION ADDRESS';
const tokenId = 'INSERT TOKEN ID';
const tokenSendAmount = 50;
```
Note the senderAddress should have enough XEC to pay for the token send transaction. The wallet should also actually hold the tokens as well.

Then execute:
```
$ npm run sendSlp
```
