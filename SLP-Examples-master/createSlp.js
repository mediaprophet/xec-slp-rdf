const cashaddr = require ('ecashaddrjs');
const utxolib = require('@bitgo/utxo-lib');
const { getUtxosFromAddress } = require('./getUtxosFromAddress');
const {
  generateTokenTxInput,
  generateTokenTxOutput,
  signAndBuildTx,
  parseChronikUtxos,
  deriveWallet,
} = require('./utils');

async function createSlp(
    chronik,
    tokenObj,
    wallet,
) {
    // Retrieve XEC and SLP utxos from wallet
    const combinedUtxos = await getUtxosFromAddress(
        chronik,
        wallet.address,
    );
    const parsedUtxos = parseChronikUtxos(combinedUtxos);
    const nonSlpUtxos = parsedUtxos.xecUtxos;
    const slpUtxos = parsedUtxos.slpUtxos
    
    // Initialize the bitgo transaction builder to the XEC network
    // which will be used to build and sign the transaction
    let txBuilder = utxolib.bitgo.createTransactionBuilderForNetwork(
        utxolib.networks.ecash,
    );
    
    let tokenTxInputObj = generateTokenTxInput(
        'GENESIS',
        nonSlpUtxos,
        null, // total token UTXOS - not applicable for GENESIS tx
        null, // token ID - not applicable for GENESIS tx
        null, // token amount - not applicable for GENESIS tx
        2.01, // default fee
        txBuilder,
    );
    // update txBuilder object with inputs
    txBuilder = tokenTxInputObj.txBuilder;

    let tokenTxOutputObj = generateTokenTxOutput(
        txBuilder,
        'GENESIS',
        wallet.address,
        null, // token UTXOS being spent - not applicable for GENESIS tx
        tokenTxInputObj.remainderXecValue,
        tokenObj,
    );
    // update txBuilder object with outputs
    txBuilder = tokenTxOutputObj;
    
    // append the token input UTXOs to the array of XEC input UTXOs for signing
   const combinedInputUtxos = tokenTxInputObj.inputXecUtxos.concat(
       tokenTxInputObj.inputTokenUtxos,
   );
   
   // sign the collated inputUtxos and build the raw tx hex
   // returns the raw tx hex string
   const rawTxHex = signAndBuildTx(combinedInputUtxos, txBuilder, wallet);
   
   // Broadcast transaction to the network via the chronik client
   // sample chronik.broadcastTx() response:
   //    {"txid":"0075130c9ecb342b5162bb1a8a870e69c935ea0c9b2353a967cda404401acf19"}
    let broadcastResponse;
    try {
        broadcastResponse = await chronik.broadcastTx(
            rawTxHex,
            true, // skipSlpCheck to bypass chronik safety mechanism in place to avoid accidental burns
        );
        if (!broadcastResponse) {
            throw new Error('Empty chronik broadcast response');
        }
    } catch (err) {
        console.log('Error broadcasting tx to chronik client');
        throw err;
    }

    return broadcastResponse.txid;
}

(async () => {
    // Prepare the wallet that will create the token
    // Note: replace this wallet with a pre-funded one prior to executing example
    const senderAddress = 'INSERT YOUR TEST WALLET ECASH ADDRESS';
    const senderMnemonic = 'INSERT YOUR TEST WALLET MNEMONIC';
    const derivationPath = "m/44'/1899'/0'/0/0";
    
    // New token details
    const newTokenName = 'KoushCoin';
    const newTokenTicker = 'KCN';
    const newTokenDecimals = 2;
    const newTokenInitialQty = 5000000;
    const newTokenDocumentUrl = 'https://twitter.com/e_Koush';
    
    const newTokenObj = {
        name: newTokenName,
        ticker: newTokenTicker,
        documentUrl: newTokenDocumentUrl,
        decimals: newTokenDecimals,
        initialQty: newTokenInitialQty,
        documentHash: '',
        mintBatonVout: null,
    }

    // Derive wallet object containing the funding wif to sign txs
    const wallet = await deriveWallet(
        senderMnemonic,
        derivationPath,
        senderAddress,
    );

    // Instantiate chronik-client
    const { ChronikClient } = require('chronik-client');
    const chronik = new ChronikClient('https://chronik.fabien.cash');

    // Execute this create token tx
    const txid = await createSlp(
        chronik,
        newTokenObj,
        wallet,
    );

    console.log(
        `\nTransaction create new ${newTokenName} token has been broadcasted to the XEC blockchain. \nSee TXID: ${txid}`,
    );
})();

module.exports = { createSlp };