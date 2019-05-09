const { CryptoFactory, createContext } = require('sawtooth-sdk/signing');
const protobuf = require('sawtooth-sdk/protobuf');

const fetch = require('node-fetch');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const { TextEncoder } = require('text-encoding/lib/encoding');
const { hash } = require('./transaction');


var encoder = new TextEncoder('utf8');

/**
 * Function to Generate Transactions for Waitlist.
 * @param {*} familyName 
 * @param {*} inputList 
 * @param {*} outputList 
 * @param {*} key 
 * @param {*} payload 
 * @param {*} familyVersion 
 */
async function generateTransactionWL(familyName, inputList, outputList, key, payload, familyVersion = '1.0') {
    console.log("Entered generateTransactionWL()");
    console.log("WL Input Addresses: ", inputList);
    console.log("WL Output Addresses: ", outputList);
    // Generating public key from private key for signing
    const privateKeyHex = key;
    const context = createContext('secp256k1');
    const secp256k1pk = Secp256k1PrivateKey.fromHex(privateKeyHex.trim());
    signer = new CryptoFactory(context).newSigner(secp256k1pk);
    const signerHex = signer.getPublicKey().asHex();
    // Create transactions and payload in a loop
    let payloadBytes = [];
    let transactionHeaderBytes = [];
    let transaction = [];
    for (let i = 0; i < inputList.length; i++) {
        payloadBytes[i] = encoder.encode(payload[i]);
        // To create Transaction Headers in a loop
        transactionHeaderBytes[i] = protobuf.TransactionHeader.encode({
            familyName: familyName,
            familyVersion: familyVersion,
            inputs: [inputList[i]],
            outputs: [outputList[i]],
            signerPublicKey: signerHex,
            nonce: "" + Math.random(),
            batcherPublicKey: signerHex,
            dependencies: [],
            payloadSha512: hash(payloadBytes[i])
        }).finish();
        // To create Transactions in a loop
        transaction[i] = protobuf.Transaction.create({
            header: transactionHeaderBytes[i],
            headerSignature: signer.sign(transactionHeaderBytes[i]),
            payload: payloadBytes[i]
        });
    }
    // Batch information
    // To create Batch Header
    const batchHeaderBytes = protobuf.BatchHeader.encode({
        signerPublicKey: signerHex,
        transactionIds: transaction.map((txn) => txn.headerSignature)
    }).finish();
    // To create Batch
    const batchSignature = signer.sign(batchHeaderBytes);
    const batch = protobuf.Batch.create({
        header: batchHeaderBytes,
        headerSignature: batchSignature,
        transactions: transaction
    });
    // To create BatchList
    const batchListBytes = protobuf.BatchList.encode({
        batches: [batch]
    }).finish();
    console.log("Calling submitTransactionWL()!");
    await submitTransactionWL(batchListBytes);
}

/**
 * Function to send batchListBytes to the validator.
 * @param {*} batchListBytes 
 */
async function submitTransactionWL(batchListBytes) {
    console.log("Entered submitTransactionWL()");
    let response = await fetch('http://rest-api:8008/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: batchListBytes
    });
}

module.exports = { generateTransactionWL };