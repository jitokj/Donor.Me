
const { Stream } = require('sawtooth-sdk/messaging/stream');

const { Message, EventFilter, EventList, EventSubscription, ClientEventsSubscribeRequest, ClientEventsSubscribeResponse } = require('sawtooth-sdk/protobuf');

const VALIDATOR_URL = "tcp://validator:4004";

var { UserClient } = require('./userClient');
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding');
const fs = require('fs');
var encoder = new TextEncoder('utf8');
var decoder = new TextDecoder('utf8');

// Creating an object of Stream class
const stream = new Stream(VALIDATOR_URL);

let socket;

const setSocket = (currentSocket) => {
    socket = currentSocket;
}

const startEventListener = (socketConnection) => {
    console.log("Starting EventListener.......");
    setSocket(socketConnection);
    stream.connect(() => {
        // Attaching handler function to stream using onReceive API of Stream class
        stream.onReceive(getEventsMessage);
        eventSubscribe(stream);
    })
}
// Returns the subscription request statuses
function checkStatus(response) {
    let msg = "";
    if (response.status === 0) {
        msg = 'Subscription : OK';
    }
    else if (response.status === 1) {
        msg = 'Subscription : GOOD';
    }
    else {
        msg = 'Subscription failed!';
    }
    return msg;
}

var kidneyFlag = 0;
var heartFlag = 0;
var liverFlag = 0;
// Event Message Handler
function getEventsMessage(message) {
    // Decoding message using EventList protobuf
    let eventList = EventList.decode(message.content).events;
    var patientAddress = [];
    var kidneyChoice = '';
    var heartChoice = '';
    var liverChoice = '';
    // Iterating through event lists for "block-commit" eventType using .map JS function
    eventList.map(async function (event) {
        if (event.eventType == 'sawtooth/block-commit') {
            console.log("Block-Commit Event triggered");
        }
        // Custom Registration Event
        else if (event.eventType == 'DOHTVPM/Registration') {
            console.log("Registration-Event triggered");
            socket.emit("Registration-Event", event);
            // Checking if Action is Patient in custom event triggered, adding Waitlist addresses if triggered
            if (event.attributes[0].value == 'Patient') {
                // Retrieving Department of Health private key from .priv file
                var wlClient = new UserClient();
                var dohPrivKeyFile = '/root/.sawtooth/keys/dohtvpm.priv';
                dohPrivKey = fs.readFileSync(dohPrivKeyFile);
                dohPrivKeyDecoded = Buffer.from(dohPrivKey, 'base64').toString();
                let decodedDonorDetails1 = decoder.decode(event.data).toString();
                let donorDetails1 = decodedDonorDetails1.split(',');
                // Checking if Patient has requested organs, and updating payload for each waitlist address accordingly
                if (donorDetails1[8] == 'K' && kidneyFlag == 0) {
                    patientAddress[0] = event.attributes[2].value;
                    kidneyChoice = donorDetails1[6];
                    kidneyFlag += 1;
                }
                else if (donorDetails1[8] == 'H' && heartFlag == 0) {
                    patientAddress[1] = event.attributes[2].value;
                    heartChoice = donorDetails1[6];
                    heartFlag += 1;
                }
                else if (donorDetails1[8] == 'L' && liverFlag == 0) {
                    patientAddress[2] = event.attributes[2].value;
                    liverChoice = donorDetails1[6];
                    liverFlag += 1;
                }
                if (kidneyFlag != 0 && heartFlag != 0 && liverFlag != 0) {
                    // Calling addWL() function to create Waitlist addresses, resetting flags to zero
                    await wlClient.addWL(patientAddress, dohPrivKeyDecoded, donorDetails1[7], donorDetails1[3], kidneyChoice, heartChoice, liverChoice);
                    kidneyFlag = 0;
                    heartFlag = 0;
                    liverFlag = 0;
                }
            }
            return 1;
        }
    });
}

function eventSubscribe(stream) {
    try {
        // stream from above declaration
        // URL = url of validator
        // Creating a subcription to Block-Commit
        const blockCommitSubscription = EventSubscription.create({
            eventType: 'sawtooth/block-commit'
        });
        // Creating event filter for Registration event if Action is Donor.
        const DonorRegistrationSubscription = EventSubscription.create({
            eventType: 'DOHTVPM/Registration',
            filters: [EventFilter.create({
                key: 'Action',
                matchString: 'Donor',
                filterType: EventFilter.FilterType.REGEX_ALL
            })]
        });
        // Creating event filter for Registration event if Action is Patient.
        const PatientRegistrationSubscription = EventSubscription.create({
            eventType: 'DOHTVPM/Registration',
            filters: [EventFilter.create({
                key: 'Action',
                matchString: 'Patient',
                filterType: EventFilter.FilterType.REGEX_ALL
            })]
        });
        // Subscribing to block-commit event, and two custom events
        const subscription_request = ClientEventsSubscribeRequest.encode({
            subscriptions: [blockCommitSubscription, DonorRegistrationSubscription, PatientRegistrationSubscription]
        }).finish();

        // Decoding the response from the validator with ClientEventsSubscribeRespose protobuf
        stream.send(Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST, subscription_request)
            .then(function (response) {
                return ClientEventsSubscribeResponse.decode(response);
            })
            .then(function (decoded_Response) {
                console.log("CheckStatus: ", checkStatus(decoded_Response));
            })
    }
    catch (err) {
        console.log("Error in EventListener: ", err);
    }
}
module.exports = { startEventListener };