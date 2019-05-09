const { createHash } = require('crypto');
const { CryptoFactory, createContext } = require('sawtooth-sdk/signing');

const fetch = require('node-fetch');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');

FAMILY_NAME_2 = 'DOHKERALA';
var DOH = '';

/**
 * Function to create hash of passed value using sha512.
 * @param {*} v 
 */
function hash(v) {
  return createHash('sha512').update(v).digest('hex');
}

/**
 * Function to create Waitlist address (for specified organ), return address.
 * @param {*} dKey 
 * @param {*} regNum 
 * @param {*} bloodGroup 
 * @param {*} organ 
 */
function waitlistAddress(dKey, regNum, bloodGroup, organ) {
  // Creating public key from hospital private key.
  const context = createContext('secp256k1');
  const keyDoh = Secp256k1PrivateKey.fromHex(dKey);
  const signerDoh = new CryptoFactory(context).newSigner(keyDoh);
  const dohPublicKeyHex = signerDoh.getPublicKey().asHex();
  const dohKeyHash = hash(dohPublicKeyHex);
  DOH = dKey;
  const nameHashD = hash(FAMILY_NAME_2);
  const bloodGroupHash = hash(bloodGroup);
  // Waitlist address for organ as per defined Address Scheme
  const wlAddress = nameHashD.slice(0, 6) + dohKeyHash.slice(0, 24) + organ + organ + bloodGroupHash.slice(0, 12) + regNum;
  console.log("WL address generated: ", wlAddress);
  return wlAddress;
}

/**
 * Function to get waitlist data from state for specified organ, return as array.
 * @param {*} organ 
 */
async function getStateWaitlist(organ) {
  console.log("Entering getStateWaitlist()");
  // Creating public key from hospital private key.
  const context = createContext('secp256k1');
  const keyDoh = Secp256k1PrivateKey.fromHex(DOH);
  const signer = new CryptoFactory(context).newSigner(keyDoh);
  const dohPublicKeyHex = signer.getPublicKey().asHex();
  const dohKeyHash = hash(dohPublicKeyHex);
  // Partial Waitlist address for specified organ
  let wlAddress = hash(FAMILY_NAME_2).substr(0, 6) + dohKeyHash.slice(0, 24) + organ + organ;
  // Defining rest-api endpoint for querying state data
  let stateRequest = 'http://rest-api:8008/state?address=' + wlAddress;
  let stateResponse = await fetch(stateRequest);
  let stateJSON = await stateResponse.json();
  return [stateJSON];
}

/**
 * Function to get waitlist data from state for specified organ & bloodgroup, return as array.
 * @param {*} organ 
 * @param {*} bloodGroup 
 */
async function getStateWaitlistBloodgroup(organ, bloodGroup) {
  console.log("Entering getStateWaitlistBloodgroup()");
  // Creating public key from hospital private key.
  const context = createContext('secp256k1');
  const keyDoh = Secp256k1PrivateKey.fromHex(DOH);
  const signer = new CryptoFactory(context).newSigner(keyDoh);
  const dohPublicKeyHex = signer.getPublicKey().asHex();
  const dohKeyHash = hash(dohPublicKeyHex);
  const bloodGroupHash = hash(bloodGroup);
  // Partial Waitlist address for specified organ & blood group
  let wlAddress = hash(FAMILY_NAME_2).substr(0, 6) + dohKeyHash.slice(0, 24) + organ + organ + bloodGroupHash.slice(0, 12);
  // Defining rest-api endpoint for querying state data
  let stateRequest = 'http://rest-api:8008/state?address=' + wlAddress;
  let stateResponse = await fetch(stateRequest);
  let stateJSON = await stateResponse.json();
  return [stateJSON];
}

module.exports = { waitlistAddress, getStateWaitlist, getStateWaitlistBloodgroup }
