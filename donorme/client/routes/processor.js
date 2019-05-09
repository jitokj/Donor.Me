const { CryptoFactory, createContext } = require('sawtooth-sdk/signing');
const protobuf = require('sawtooth-sdk/protobuf');

const fetch = require('node-fetch');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const { TextEncoder } = require('text-encoding/lib/encoding');
const { hash } = require('./transaction');


var encoder = new TextEncoder('utf8');

// 
/**
 * Function to Generate Transactions for Donor (create & Edit) & Patient (create).
 * @param {*} familyName 
 * @param {*} inputList 
 * @param {*} outputList 
 * @param {*} key 
 * @param {*} payload 
 * @param {*} familyVersion 
 */
async function generateTransaction(familyName, inputList, outputList, key, payload, familyVersion = '1.0') {
    console.log("Entered generateTransaction()");
    console.log("Input Addresses: ", inputList);
    console.log("Output Addresses: ", outputList);
    // Generating public key from private key for signing
    const privateKeyHex = key;
    const context = createContext('secp256k1');
    const secp256k1pk = Secp256k1PrivateKey.fromHex(privateKeyHex.trim());
    signer = new CryptoFactory(context).newSigner(secp256k1pk);
    const signerHex = signer.getPublicKey().asHex();
    // Creating 3 transactions and payload
    const payloadBytes1 = encoder.encode(payload[0]);
    const payloadBytes2 = encoder.encode(payload[1]);
    const payloadBytes3 = encoder.encode(payload[2]);
    // To create Transaction Headers
    const transactionHeaderBytes1 = protobuf.TransactionHeader.encode({
        familyName: familyName,
        familyVersion: familyVersion,
        inputs: [inputList[0]],
        outputs: [outputList[0]],
        signerPublicKey: signerHex,
        nonce: "" + Math.random(),
        batcherPublicKey: signerHex,
        dependencies: [],
        payloadSha512: hash(payloadBytes1)
    }).finish();
    const transactionHeaderBytes2 = protobuf.TransactionHeader.encode({
        familyName: familyName,
        familyVersion: familyVersion,
        inputs: [inputList[1]],
        outputs: [outputList[1]],
        signerPublicKey: signerHex,
        nonce: "" + Math.random(),
        batcherPublicKey: signerHex,
        dependencies: [],
        payloadSha512: hash(payloadBytes2)
    }).finish();
    const transactionHeaderBytes3 = protobuf.TransactionHeader.encode({
        familyName: familyName,
        familyVersion: familyVersion,
        inputs: [inputList[2]],
        outputs: [outputList[2]],
        signerPublicKey: signerHex,
        nonce: "" + Math.random(),
        batcherPublicKey: signerHex,
        dependencies: [],
        payloadSha512: hash(payloadBytes3)
    }).finish();
    // To create Transactions
    const transaction1 = protobuf.Transaction.create({
        header: transactionHeaderBytes1,
        headerSignature: signer.sign(transactionHeaderBytes1),
        payload: payloadBytes1
    });
    const transaction2 = protobuf.Transaction.create({
        header: transactionHeaderBytes2,
        headerSignature: signer.sign(transactionHeaderBytes2),
        payload: payloadBytes2
    });
    const transaction3 = protobuf.Transaction.create({
        header: transactionHeaderBytes3,
        headerSignature: signer.sign(transactionHeaderBytes3),
        payload: payloadBytes3
    });

    // Batch information
    const transactions = [transaction1, transaction2, transaction3];
    // To create Batch Header
    const batchHeaderBytes = protobuf.BatchHeader.encode({
        signerPublicKey: signerHex,
        transactionIds: transactions.map((txn) => txn.headerSignature)
    }).finish();
    // To create Batch
    const batchSignature = signer.sign(batchHeaderBytes);
    const batch = protobuf.Batch.create({
        header: batchHeaderBytes,
        headerSignature: batchSignature,
        transactions: transactions
    });
    // To create BatchList
    const batchListBytes = protobuf.BatchList.encode({
        batches: [batch]
    }).finish();
    console.log("Calling submitTransaction!");
    await submitTransaction(batchListBytes);
}

/**
 * Function to send batchListBytes to the validator.
 * @param {*} batchListBytes 
 */
async function submitTransaction(batchListBytes) {
    console.log("Entered submitTransaction()");
    let response = await fetch('http://rest-api:8008/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: batchListBytes
    });
}

/**
 * Function to Generate Transactions for Donor (matched) & Patient (matched).
 * @param {*} familyName 
 * @param {*} inputList 
 * @param {*} outputList 
 * @param {*} key 
 * @param {*} payload 
 * @param {*} familyVersion 
 */
async function generateTransactionMatched(familyName, inputList, outputList, key, payload, familyVersion = '1.0') {
    console.log("Entered generateTransactionMatched()");
    console.log("Input Addresses: ", inputList);
    console.log("Output Addresses: ", outputList);
    // Generating public key from private key for signing
    const context = createContext('secp256k1');
    const secp256k1pk = Secp256k1PrivateKey.fromHex(key);
    const signer = new CryptoFactory(context).newSigner(secp256k1pk);
    const signerHex = signer.getPublicKey().asHex();
    // Creating transaction and payload
    const payloadBytes = encoder.encode(payload);

    // To create Transaction Headers
    const transactionHeaderBytes = protobuf.TransactionHeader.encode({
        familyName: familyName,
        familyVersion: familyVersion,
        inputs: [inputList],
        outputs: [outputList],
        signerPublicKey: signerHex,
        nonce: "" + Math.random(),
        batcherPublicKey: signerHex,
        dependencies: [],
        payloadSha512: hash(payloadBytes)
    }).finish();

    // To create Transaction
    const transaction = protobuf.Transaction.create({
        header: transactionHeaderBytes,
        headerSignature: signer.sign(transactionHeaderBytes),
        payload: payloadBytes
    });

    // Batch information
    const transactions = [transaction];
    // To create Batch Header
    const batchHeaderBytes = protobuf.BatchHeader.encode({
        signerPublicKey: signerHex,
        transactionIds: transactions.map((txn) => txn.headerSignature)
    }).finish();
    // To create Batch
    const batchSignature = signer.sign(batchHeaderBytes);
    const batch = protobuf.Batch.create({
        header: batchHeaderBytes,
        headerSignature: batchSignature,
        transactions: transactions
    });
    // To create BatchList
    const batchListBytes = protobuf.BatchList.encode({
        batches: [batch]
    }).finish();
    // console.log("batcherPublicKey: ", signerHex);
    // console.log("headerSignature: ", signer.sign(transactionHeaderBytes));
    // console.log("batchSignature: ", signer.sign(batchHeaderBytes));
    // console.log("hash of signerHex: ", hash(signerHex));
    console.log("Calling submitTransactionMatch()!");
    await submitTransactionMatched(batchListBytes);
}

/**
 * Function to send batchListBytes to the validator.
 * @param {*} batchListBytes 
 */
async function submitTransactionMatched(batchListBytes) {
    console.log("Entered submitTransactionMatched()");
    let response = await fetch('http://rest-api:8008/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: batchListBytes
    });
}

module.exports = { generateTransaction, generateTransactionMatched };