/**
 * Transaction Processor for NAMESPACE_2 (WaitlistHandler).
 * 
 * Receives the transaction processing requests from transactionProcessor.js.
 * Handles the creation and deletion of Waitlist addresses, and to add to the Organ Match log.
 */

// Uses strict mode
'use strict'

const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InvalidTransaction, InternalError } = require('sawtooth-sdk/processor/exceptions');
const crypto = require('crypto');
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding');

var encoder = new TextEncoder('utf8');
var decoder = new TextDecoder('utf8');
// Specifies the familyname as 'DOHKERALA'
const FAMILY_NAME_2 = 'DOHKERALA';

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

// Defines NAMESPACE_2 as the hash of FAMILY_NAME_2 (first 6 characters).
const NAMESPACE_2 = hash(FAMILY_NAME_2).substring(0, 6);
console.log("Declared NAMESPACE: ", NAMESPACE_2);

/**
 * Function to decode payload received from Client from UTF8 and return.
 * @param {*} payload 
 */
var decodeRequest = function decodeRequest(payload) {
    console.log("Entering WL decodeRequest() ----");
    var decodedPayload = decoder.decode(payload);
    var payload1 = decodedPayload.toString().split(',');
    console.log("payload1: ", payload1 + "----- length: " + payload1.length);
    var payload_data_organ = {};
    // Check if Action = 'Waitlist', to set payload for Waitlist addresses.
    if (payload1[0] == 'Waitlist') {
        payload_data_organ = {
            action: payload1[0],
            organ: payload1[1],
            bloodGroup: payload1[2],
            counter: payload1[3],
            regNumber: payload1[4],
            pOrganAddress: payload1[5]
        }
    }
    // Check if Action = 'Delete', to send address for deletion.
    else if (payload1[0] == 'Delete') {
        payload_data_organ = {
            action: payload1[0],
            address: payload1[1]
        }
    }
    // Check if Action = 'Matched', to set payload for Organ match log.
    else if (payload1[0] == 'Matched') {
        payload_data_organ = {
            action: payload1[0],
            address: payload1[1],
            deleteAddress: payload1[2],
            organ: payload1[3],
            bloodGroup: payload1[4],
            pRegNum: payload1[5],
            dRegNum: payload1[6]
        }
    }
    // If above conditions not satisfied, payload is for OrganMatch log first entry.
    else {
        console.log("Creating payload for DeletedAddress!");
        payload_data_organ = payload1;
    }
    var payload_data = [payload_data_organ];
    // Return decoded payload.
    return payload_data;
}

/**
 * Function to set entries in the Block using SetState function.
 * @param {*} context 
 * @param {Array} userAddress 
 * @param {Array} stateValues 
 */
const setEntry = (context, userAddress, stateValues) => {
    // Check if Action = 'Matched'
    if (stateValues[0] == 'Matched') {
        return context.getState([userAddress]).then(function (stateData) {
            // console.log("stateData deletedAddress: ", JSON.stringify(stateData));
            var previous_data = 0;
            previous_data = stateData[userAddress];
            var payloadToSet = [stateValues[1], stateValues[2], stateValues[3], stateValues[4], stateValues[5]];
            // Check if previous data exists in Organ Match log.
            if (previous_data == '' || previous_data == null) {
                console.log("First deletion log entry --------!");
                var details1 = [];
                details1[0] = payloadToSet;
                let encodedDataBytes = encoder.encode(details1);
                let entries = {
                    [userAddress]: encodedDataBytes
                }
                console.log('First delete entry: ', details1);
                return context.setState(entries);
            }
            // Appending to deletion log.
            else {
                console.log("Appending to deletion log ---------!");
                let decodedDetails1 = Buffer.from(previous_data, 'base64').toString();
                // console.log("decodedDetails1: ", decodedDetails1);
                let details1 = decodedDetails1.split(',');
                // console.log("details1: ", details1);
                var detailsToAppend = [];
                var logLength = details1.length / 5;
                var counter = 0;
                // console.log("length of details1: ", details1.length);
                // Creating payload to append from Decoded Details.
                for (let i = 0; i < logLength; i++) {
                    detailsToAppend[i] = [details1[counter], details1[counter + 1], details1[counter + 2], details1[counter + 3], details1[counter + 4]];
                    counter += 5;
                }
                // Adding new Payload data to existing Decoded Payload.
                detailsToAppend[logLength] = payloadToSet;
                console.log("details1 appended: ", detailsToAppend);
                let encodedDataBytes = encoder.encode(detailsToAppend);
                let entries = {
                    [userAddress]: encodedDataBytes
                }
                // Calling setState function.
                return context.setState(entries);
            }
        });
    }
    // For Action = 'Waitlist'.
    else {
        let encodedDataBytes = encoder.encode(stateValues);
        let entries = {
            [userAddress]: encodedDataBytes
        }
        // Calling setState function.
        return context.setState(entries);
    }
}

/**
 * Function to delete Waitlist address once Organ match completed.
 * @param {*} context 
 * @param {string} address 
 */
const deleteEntry = (context, address) => {
    console.log("Entering deleteEntry() for address: ", [address]);
    // Calling deleteState function.
    return context.deleteState([address]);
}

/**
 * Defining the class WaitlistHandler.
 */
class WaitlistHandler extends TransactionHandler {
    constructor() {
        super(FAMILY_NAME_2, ['1.0'], [NAMESPACE_2]);
        console.log("Waitlist Constructor Called ------- ", FAMILY_NAME_2, ['1.0'], [NAMESPACE_2]);
        console.log("NAMESPACE ------ ", NAMESPACE_2);
    }
    apply(transactionProcessRequest, context) {
        try {
            const payload = transactionProcessRequest.payload;
            // Calling decodeRequest function.
            let update = decodeRequest(payload);
            console.log("Update in Waitlist apply(): ", update[0]);
            var header = transactionProcessRequest.header;
            console.log("TransactionProcessRequest: ", transactionProcessRequest.header);
            // Checking if Action = 'Waitlist' and creating temporary addresses to call setEntry function.
            if (update[0].action == 'Waitlist') {
                // Check if organ is Kidney.
                if (update[0].organ == 'K') {
                    var tempAddress = NAMESPACE_2 + hash(transactionProcessRequest.header.signerPublicKey).slice(0, 24) + 'aaaa' + hash(update[0].bloodGroup).slice(0, 12) + update[0].regNumber;
                }
                // Check if organ is Heart.
                else if (update[0].organ == 'H') {
                    var tempAddress = NAMESPACE_2 + hash(transactionProcessRequest.header.signerPublicKey).slice(0, 24) + 'bbbb' + hash(update[0].bloodGroup).slice(0, 12) + update[0].regNumber;
                }
                // Check if organ is Liver.
                else if (update[0].organ == 'L') {
                    var tempAddress = NAMESPACE_2 + hash(transactionProcessRequest.header.signerPublicKey).slice(0, 24) + 'cccc' + hash(update[0].bloodGroup).slice(0, 12) + update[0].regNumber;
                }
                else {
                    throw new InvalidTransaction("Organ should be Kidney, Heart or Liver!");
                }
                // Setting payload.
                var payloadToSet = [update[0].action, update[0].organ, update[0].bloodGroup, update[0].counter, update[0].regNumber, update[0].pOrganAddress];
                console.log("Waitlist payloadToSet: ", payloadToSet);
                // Calling setEntry function for Waitlist Address creation.
                return setEntry(context, tempAddress, payloadToSet);
            }
            // Checking if Action = 'Delete'.
            else if (update[0].action == 'Delete') {
                console.log("Calling deleteEntry() in WaitlistHandler ------!");
                // Calling deleteEntry function.
                return deleteEntry(context, update[0].address);
            }
            // Checking if Action = 'Matched'.
            else if (update[0].action == 'Matched') {
                console.log("Calling setEntry() for matched in WaitlistHandler: ", update[0].address);
                var payloadToSet = [];
                // Setting payload.
                payloadToSet = [update[0].action, update[0].address, update[0].organ, update[0].bloodGroup, update[0].pRegNum, update[0].dRegNum];
                // Calling setEntry function for Organ Match log.
                return setEntry(context, update[0].deleteAddress, payloadToSet);
            }
            // Throw error for Invalid action.
            else {
                throw new InvalidTransaction("Action should be Waitlist, Matched or Delete!");
            }
        } catch (err) {
            _toInternalError(err);
        }
    }
}

module.exports = WaitlistHandler;
