/**
 * Transaction Processor for NAMESPACE (DonorMeHandler).
 * 
 * Receives the transaction processing requests from transactionProcessor.js.
 * Handles the creation & updation of Patient & Donor addresses.
 */

// Uses strict mode
'use strict'

const { TransactionHandler } = require('sawtooth-sdk/processor/handler');

const { InvalidTransaction, InternalError } = require('sawtooth-sdk/processor/exceptions');
const crypto = require('crypto');
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding');

var encoder = new TextEncoder('utf8');
var decoder = new TextDecoder('utf8');
// Specifies the familyname as 'DOHTVPM'
const FAMILY_NAME = 'DOHTVPM';

/**
 * Function to display errors.
 * @param {*} err 
 */
const _toInternalError = (err) => {
    console.log("In error message block --------!")
    let message = err.message ? err.message : err
    throw new InternalError(message)
}

/**
 * Function to create and return the hash of the argument passed.
 * @param {string} v 
 */
function hash(v) {
    return crypto.createHash('sha512').update(v).digest('hex');
}

// Defines NAMESPACE as the hash of FAMILY_NAME (first 6 characters).
const NAMESPACE = hash(FAMILY_NAME).substring(0, 6);
console.log("Declared NAMESPACE: ", NAMESPACE);

/**
 * Function to decode payload received from Client from UTF8 and return.
 * @param {*} payload 
 */
var decodeRequest = function decodeRequest(payload) {
    var decodedPayload = decoder.decode(payload);
    var payload1 = decodedPayload.toString().split(',');
    console.log("decoded payload: ", payload1);
    var payload_data_organ = '';
    // Check if Action = 'Patient', status is 'Active', and if payload length is 10 (when creating new Patient).
    if (payload1[0] == 'Patient' && payload1[9] == 'Active' && payload1.length == 10) {
        payload_data_organ = {
            action: payload1[0],
            pName: payload1[1],
            pContact: payload1[2],
            pBloodGroup: payload1[3],
            pDob: payload1[4],
            pDor: payload1[5],
            organChoice: payload1[6],
            pRegNumber: payload1[7],
            organ: payload1[8],
            pStatus: payload1[9]
        }
    }
    // Check if Action = 'Patient', status is 'Active', and if payload length is 11 (when updating organ match).
    else if (payload1[0] == 'Patient' && payload1[9] == 'Active' && payload1.length == 11) {
        payload_data_organ = {
            action: payload1[0],
            pName: payload1[1],
            pContact: payload1[2],
            pBloodGroup: payload1[3],
            pDob: payload1[4],
            pDor: payload1[5],
            organChoice: payload1[6],
            pRegNumber: payload1[7],
            organ: payload1[8],
            pStatus: payload1[9],
            organStatus: payload1[10]
        }
    }
    // Check if Action = 'Donor' & status = 'Active' (for creating new Donor).
    else if (payload1[0] == 'Donor' && payload1[9] == 'Active') {
        payload_data_organ = {
            action: payload1[0],
            dName: payload1[1],
            dContact: payload1[2],
            dBloodGroup: payload1[3],
            dDob: payload1[4],
            dDor: payload1[5],
            organChoice: payload1[6],
            dRegNumber: payload1[7],
            organ: payload1[8],
            dStatus: payload1[9]
        }
    }
    // Check if Action = 'Donor' & status is 'Died' (updating Donor records).
    else if (payload1[0] == 'Donor' && payload1[9] == 'Died') {
        payload_data_organ = {
            action: payload1[0],
            dName: payload1[1],
            dContact: payload1[2],
            dBloodGroup: payload1[3],
            dDob: payload1[4],
            dDor: payload1[5],
            organChoice: payload1[6],
            dRegNumber: payload1[7],
            organ: payload1[8],
            dStatus: payload1[9],
            dChoice: payload1[10],
            dDod: payload1[11],
            dTod: payload1[12]
        }
    }
    else {
        // payload_data_organ;
        throw new InvalidTransaction("Action should be Patient or Donor!");
    }
    var payload_data = [payload_data_organ];
    return payload_data;
}

/**
 * Function to set entries in the Block using SetState function.
 * @param {*} context 
 * @param {Array} userAddress 
 * @param {Array} stateValues 
 */
const setEntry = (context, userAddress, stateValues) => {
    let encodedDataBytes = encoder.encode(stateValues);
    // Adding Custom Event
    let attribute;
    // Creating Event Filter based on Action
    attribute = [['Action', stateValues[0]], ['RegNum', stateValues[7]], ['Address', userAddress]];
    // Adding data below to use Event Filters
    // Adding transaction receipts, encoding to avoid data loss when retrieving
    if (stateValues.length == 13) {
        context.addEvent('DOHTVPM/Registration', attribute, encodedDataBytes);
        context.addReceiptData(Buffer.from(stateValues[0] + " - RegNum: " + stateValues[7] + " updated successfully!", 'utf8'));
    }
    else if (stateValues.length == 11 && stateValues[0] == 'Patient') {
        if (stateValues[8] == 'K') {
            context.addReceiptData(Buffer.from("Kidney donor matched for " + stateValues[0] + " - RegNum: " + stateValues[7] + " successfully!", 'utf8'));
        }
        else if (stateValues[8] == 'H') {
            context.addReceiptData(Buffer.from("Heart donor matched for " + stateValues[0] + " - RegNum: " + stateValues[7] + " successfully!", 'utf8'));
        }
        else {
            context.addReceiptData(Buffer.from("Liver donor matched for " + stateValues[0] + " - RegNum: " + stateValues[7] + " successfully!", 'utf8'));
        }
    }
    else {
        context.addEvent('DOHTVPM/Registration', attribute, encodedDataBytes);
        context.addReceiptData(Buffer.from("New " + stateValues[0] + " Registered Successfully as RegNum: " + stateValues[7] + "!", 'utf8'));
    }
    let entries = {
        [userAddress]: encodedDataBytes
    }
    return context.setState(entries);
}

/**
 * Defining the class DonorMeHandler.
 */
class DonorMeHandler extends TransactionHandler {
    constructor() {
        super(FAMILY_NAME, ['1.0'], [NAMESPACE]);
        console.log("DonorMe Constructor Called ------- ", FAMILY_NAME, ['1.0'], [NAMESPACE]);
        console.log("NAMESPACE ------ ", NAMESPACE);
    }
    apply(transactionProcessRequest, context) {
        try {
            const payload = transactionProcessRequest.payload;
            // Calling decodeRequest function.
            let update = decodeRequest(payload);
            console.log("Update in DonorMe apply(): ", update[0]);
            var headerTest = transactionProcessRequest.header;
            console.log("TransactionProcessRequest: ", headerTest);
            // console.log("headerTest.signerPublicKey(): ", headerTest.signerPublicKey);
            // console.log("Hash of headerTest.signerPublicKey(): ", hash(headerTest.signerPublicKey));

            // Check if Action = 'Patient'.
            if (update[0].action == 'Patient') {
                // Check if organ is Kidney.
                if (update[0].organ == 'K') {
                    var tempAddress = NAMESPACE + '00' + 'aa' + hash(update[0].pBloodGroup).slice(0, 12) + update[0].pRegNumber + hash(headerTest.signerPublicKey).slice(0, 24);
                }
                // Check if organ is Heart.
                else if (update[0].organ == 'H') {
                    var tempAddress = NAMESPACE + '00' + 'bb' + hash(update[0].pBloodGroup).slice(0, 12) + update[0].pRegNumber + hash(headerTest.signerPublicKey).slice(0, 24);
                }
                // Check if organ is Liver.
                else if (update[0].organ == 'L') {
                    var tempAddress = NAMESPACE + '00' + 'cc' + hash(update[0].pBloodGroup).slice(0, 12) + update[0].pRegNumber + hash(headerTest.signerPublicKey).slice(0, 24);
                }
                // Throw error for Invalid organ choice.
                else {
                    throw new InvalidTransaction("Organ should be Kidney, Heart or Liver!");
                }
                return context.getState([tempAddress]).then(function (stateKeyValueAddress) {
                    console.log("Temp Address for Patient: ", tempAddress);
                    var previous_data = 0;
                    previous_data = stateKeyValueAddress[tempAddress];
                    console.log("previous_data Patient: ", previous_data);
                    // Checking if Patient has been registered already.
                    if (previous_data == '' || previous_data == null) {
                        console.log("Patient not registered previously, registering now --------!");
                        // Setting payload.
                        var payloadToSet = [update[0].action, update[0].pName, update[0].pContact, update[0].pBloodGroup, update[0].pDob, update[0].pDor, update[0].organChoice, update[0].pRegNumber, update[0].organ, update[0].pStatus];
                        console.log("payloadToSet new Patient: ", payloadToSet);
                        // Calling setEntry.
                        return setEntry(context, tempAddress, payloadToSet);
                    }
                    // Checking if Action = 'Matched' to update Patient.
                    else if (update[0].organStatus == 'Matched') {
                        console.log("Patient match found, updating now ---------!");
                        var payloadToSet = [update[0].action, update[0].pName, update[0].pContact, update[0].pBloodGroup, update[0].pDob, update[0].pDor, update[0].organChoice, update[0].pRegNumber, update[0].organ, update[0].pStatus, update[0].organStatus];
                        console.log("payloadToSet Patient Matched: ", payloadToSet);
                        // Calling setEntry.
                        return setEntry(context, tempAddress, payloadToSet);
                    }
                    // Throw error that Patient has already been registered.
                    else {
                        console.log("Patient already registered ----------!");
                        throw new InvalidTransaction("Patient already registered --------!");
                    }
                })
            }
            // Check if Action = 'Donor'.
            else if (update[0].action == 'Donor') {
                // Check if organ is Kidney.
                if (update[0].organ == 'K') {
                    var tempAddress = NAMESPACE + '11' + 'aa' + hash(update[0].dBloodGroup).slice(0, 12) + update[0].dRegNumber + hash(transactionProcessRequest.header.signerPublicKey).slice(0, 24);
                }
                // Check if Organ is Heart.
                else if (update[0].organ == 'H') {
                    var tempAddress = NAMESPACE + '11' + 'bb' + hash(update[0].dBloodGroup).slice(0, 12) + update[0].dRegNumber + hash(transactionProcessRequest.header.signerPublicKey).slice(0, 24);
                }
                // Check if Organ is Liver.
                else if (update[0].organ == 'L') {
                    var tempAddress = NAMESPACE + '11' + 'cc' + hash(update[0].dBloodGroup).slice(0, 12) + update[0].dRegNumber + hash(transactionProcessRequest.header.signerPublicKey).slice(0, 24);
                }
                // Throw error for Invalid organ choice.
                else {
                    throw new InvalidTransaction("Organ should be Kidney, Heart or Liver!");
                }
                console.log("hash(transactionProcessRequest.header.signerPublicKey).slice(0, 24): ", hash(transactionProcessRequest.header.signerPublicKey).slice(0, 24));
                console.log("Temp Address for Donor before getState(): ", tempAddress);
                return context.getState([tempAddress]).then(function (stateKeyValueAddress) {
                    console.log("Temp Address for Donor: ", tempAddress);
                    var previous_data = 0;
                    previous_data = stateKeyValueAddress[tempAddress];
                    console.log("previous_data Donor: ", previous_data);
                    // Checking if Donor has been registered already.
                    if (previous_data == '' || previous_data == null) {
                        console.log("Donor not registered previously, registering now ---------!");
                        // Setting payload.
                        var payloadToSet = [update[0].action, update[0].dName, update[0].dContact, update[0].dBloodGroup, update[0].dDob, update[0].dDor, update[0].organChoice, update[0].dRegNumber, update[0].organ, update[0].dStatus];
                        console.log("payloadToSet new Donor: ", payloadToSet);
                        // Calling setEntry.
                        return setEntry(context, tempAddress, payloadToSet);
                    }
                    // Check if Donor Status is 'Died'.
                    else if (update[0].dStatus == 'Died') {
                        console.log("Donor updating now --------!");
                        // Setting payload.
                        var payloadToSet = [update[0].action, update[0].dName, update[0].dContact, update[0].dBloodGroup, update[0].dDob, update[0].dDor, update[0].organChoice, update[0].dRegNumber, update[0].organ, update[0].dStatus, update[0].dChoice, update[0].dDod, update[0].dTod];
                        console.log("payloadToSet editing Donor: ", payloadToSet);
                        // Calling setEntry.
                        return setEntry(context, tempAddress, payloadToSet);
                    }
                    // Throw error that Donor has already been registered.
                    else {
                        console.log("Donor already registered -----------!");
                        throw new InvalidTransaction("Donor already registered ----------!");
                    }
                })
            }
        } catch (err) {
            _toInternalError(err);
        }
    }
}

module.exports = DonorMeHandler;
