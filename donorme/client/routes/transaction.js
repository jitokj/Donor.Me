const { createHash } = require('crypto');
const { CryptoFactory, createContext } = require('sawtooth-sdk/signing');

const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');

FAMILY_NAME = 'DOHTVPM';

/**
 * Function to create hash of passed value using sha512.
 * @param {*} v 
 */
function hash(v) {
  return createHash('sha512').update(v).digest('hex');
}

/**
 * Function to create Patient addresses (for each organ) and return as an array.
 * @param {*} h_key 
 * @param {*} p_aadhaar 
 * @param {*} p_bloodGroup 
 */
function patientAddress(h_key, p_aadhaar, p_bloodGroup) {
  // Creating public key from hospital private key.
  const context = createContext('secp256k1');
  const key = Secp256k1PrivateKey.fromHex(h_key);
  const signer = new CryptoFactory(context).newSigner(key);
  const publicKeyHex = signer.getPublicKey().asHex();
  const keyHash = hash(publicKeyHex);
  const nameHash = hash(FAMILY_NAME);
  const patientHash = hash(p_aadhaar);
  const bloodGroupHash = hash(p_bloodGroup);
  // Values representing kidney, heart, liver to differentiate between 3 addresses for same patient
  const k = 'aa';
  const h = 'bb';
  const l = 'cc';
  // Value to differentiate between Patient addresses & Donor addresses
  const p = '00';
  // Patient address for Kidney as per defined Address Scheme
  const kAddress = nameHash.slice(0, 6) + p + k + bloodGroupHash.slice(0, 12) + patientHash.slice(0, 24) + keyHash.slice(0, 24);
  // Patient address for Heart as per defined Address Scheme
  const hAddress = nameHash.slice(0, 6) + p + h + bloodGroupHash.slice(0, 12) + patientHash.slice(0, 24) + keyHash.slice(0, 24);
  // Patient address for Liver as per defined Address Scheme
  const lAddress = nameHash.slice(0, 6) + p + l + bloodGroupHash.slice(0, 12) + patientHash.slice(0, 24) + keyHash.slice(0, 24);
  const pAddress = [kAddress, hAddress, lAddress];
  console.log("Patient addresses generated: ", pAddress);
  return pAddress;
}

/**
 * Function to create Donor addresses (for each organ) and return as an array.
 * @param {*} h_key 
 * @param {*} d_regNum 
 * @param {*} d_bloodGroup 
 */
function donorAddress(h_key, d_regNum, d_bloodGroup) {
  // Creating public key from hospital private key.
  const context = createContext('secp256k1');
  const key = Secp256k1PrivateKey.fromHex(h_key);
  const signer = new CryptoFactory(context).newSigner(key);
  const publicKeyHex = signer.getPublicKey().asHex();
  const keyHash = hash(publicKeyHex);
  const nameHash = hash(FAMILY_NAME);
  const donorHash = d_regNum.trim();
  const bloodGroupHash = hash(d_bloodGroup);
  // Values representing kidney, heart, liver to differentiate between 3 addresses for same donor
  const k = 'aa';
  const h = 'bb';
  const l = 'cc';
  // Value to differentiate between Patient addresses & Donor addresses
  const d = '11';
  // Donor address for Kidney as per defined Address Scheme
  const kAddress = nameHash.slice(0, 6) + d + k + bloodGroupHash.slice(0, 12) + donorHash + keyHash.slice(0, 24);
  // Donor address for Heart as per defined Address Scheme
  const hAddress = nameHash.slice(0, 6) + d + h + bloodGroupHash.slice(0, 12) + donorHash + keyHash.slice(0, 24);
  // Donor address for Liver as per defined Address Scheme
  const lAddress = nameHash.slice(0, 6) + d + l + bloodGroupHash.slice(0, 12) + donorHash + keyHash.slice(0, 24);
  const dAddress = [kAddress, hAddress, lAddress];
  console.log("Donor addresses generated: ", dAddress);
  return dAddress;
}

/**
 * Function to create public key from passed private key and return hash of the key (first 24 characters sliced).
 * @param {*} h_key 
 */
function hKeyHash(h_key) {
  console.log("Entering hKeyHash(): ", h_key);
  const context = createContext('secp256k1');
  const key = Secp256k1PrivateKey.fromHex(h_key);
  const signer = new CryptoFactory(context).newSigner(key);
  const publicKey = signer.getPublicKey().asHex();
  const keyHash = hash(publicKey);
  const h = keyHash.slice(0, 24);
  return h;
}

module.exports = { hash, patientAddress, donorAddress, hKeyHash }
