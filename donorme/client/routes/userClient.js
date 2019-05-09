const { hash, patientAddress, donorAddress, hKeyHash } = require('./transaction');
const { waitlistAddress, getStateWaitlist, getStateWaitlistBloodgroup } = require('./transactionWL');
const { generateTransaction, generateTransactionMatched } = require('./processor');
const { generateTransactionWL } = require('./processorWL');
const fetch = require('node-fetch');


FAMILY_NAME = 'DOHTVPM';
FAMILY_NAME_2 = 'DOHKERALA';

var DOH = '';
// Defining address for maintaining organ match log
let addressDeleted = hash(FAMILY_NAME_2).substr(0, 6) + hash(FAMILY_NAME).substr(0, 6) + hash("deletedStates").substr(0, 58);

class UserClient {

  /**
   * Function to register new patient.
   * 
   * Function creates patient addresses as per user input, creates temporary addresses for all registered hospitals
   * to check if Patient is already registered in the system, and creates new patient if all checks are passed.
   * @param {*} hkey 
   * @param {*} pAadhaar 
   * @param {*} pName 
   * @param {*} pContact 
   * @param {*} pBloodGroup 
   * @param {*} pDob 
   * @param {*} pDor 
   * @param {*} pKidney 
   * @param {*} pHeart 
   * @param {*} pLiver 
   * @param {*} dohKey 
   * @param {*} h1Key 
   * @param {*} h2Key 
   * @param {*} h3Key 
   */
  async addPatient(hkey, pAadhaar, pName, pContact, pBloodGroup, pDob, pDor, pKidney, pHeart, pLiver, dohKey, h1Key, h2Key, h3Key) {
    // Patient address for user input
    let address = patientAddress(hkey, pAadhaar, pBloodGroup);
    // Patient addresses for all registered hospitals
    let addressH1 = patientAddress(h1Key, pAadhaar, pBloodGroup);
    let addressH2 = patientAddress(h2Key, pAadhaar, pBloodGroup);
    let addressH3 = patientAddress(h3Key, pAadhaar, pBloodGroup);
    var kidneyChoice;
    var heartChoice;
    var liverChoice;
    // Patient Registration Number
    var pRegNumber = hash(pAadhaar).slice(0, 24);
    if (pKidney == 'true') {
      kidneyChoice = 'Requested';
    }
    else {
      kidneyChoice = 'NA';
    }
    if (pHeart == 'true') {
      heartChoice = 'Requested';
    }
    else {
      heartChoice = 'NA';
    }
    if (pLiver == 'true') {
      liverChoice = 'Requested';
    }
    else {
      liverChoice = 'NA';
    }
    // Payloads for all 3 addresses (for each organ)
    let payloadKidney = ["Patient", pName, pContact, pBloodGroup, pDob, pDor, kidneyChoice, pRegNumber, "K", "Active"].join(',');
    let payloadHeart = ["Patient", pName, pContact, pBloodGroup, pDob, pDor, heartChoice, pRegNumber, "H", "Active"].join(',');
    let payloadLiver = ["Patient", pName, pContact, pBloodGroup, pDob, pDor, liverChoice, pRegNumber, "L", "Active"].join(',');
    let payload = [payloadKidney, payloadHeart, payloadLiver];
    let patientStateCheckH1 = await this.getStatePatient(addressH1[0], addressH1[1], addressH1[2], true);
    let patientStateCheckH2 = await this.getStatePatient(addressH2[0], addressH2[1], addressH2[2], true);
    let patientStateCheckH3 = await this.getStatePatient(addressH3[0], addressH3[1], addressH3[2], true);
    console.log("Organ match log address: ", addressDeleted);
    var patientAddCheck = '0';
    // Checking if Patient exists
    if ((patientStateCheckH1[0].data == '' || patientStateCheckH1[0].data == null) && (patientStateCheckH2[0].data == '' || patientStateCheckH2[0].data == null) && (patientStateCheckH3[0].data == '' || patientStateCheckH3[0].data == null)) {
      await generateTransaction(FAMILY_NAME, address, address, hkey, payload);
      patientAddCheck = '1';
    }
    else {
      patientAddCheck = '3';
      console.log("Patient already exists, cannot register again!");
    }
    return patientAddCheck;
  }

  /**
   * Function to register new donor.
   * 
   * Function creates donor addresses as per user input, creates temporary addresses for all registered hospitals
 * to check if Donor is already registered in the system, and creates new donor if all checks are passed.
   * @param {*} hkey 
   * @param {*} dAadhaar 
   * @param {*} dName 
   * @param {*} dContact 
   * @param {*} dBloodGroup 
   * @param {*} dDob 
   * @param {*} dDor 
   * @param {*} dKidney 
   * @param {*} dHeart 
   * @param {*} dLiver 
   * @param {*} dohKey 
   * @param {*} h1Key 
   * @param {*} h2Key 
   * @param {*} h3Key 
   */
  async addDonor(hkey, dAadhaar, dName, dContact, dBloodGroup, dDob, dDor, dKidney, dHeart, dLiver, dohKey, h1Key, h2Key, h3Key) {
    // Donor Registration Number
    let donorHash = hash(dAadhaar).slice(0, 24);
    // Donor address for user input
    let address = donorAddress(hkey, donorHash, dBloodGroup);
    // Donor addresses for all registered hospitals
    let addressH1 = donorAddress(h1Key, donorHash, dBloodGroup);
    let addressH2 = donorAddress(h2Key, donorHash, dBloodGroup);
    let addressH3 = donorAddress(h3Key, donorHash, dBloodGroup);
    var kidneyChoice;
    var heartChoice;
    var liverChoice;
    // Donor Registration Number
    var dRegNumber = hash(dAadhaar).slice(0, 24);
    if (dKidney == 'true') {
      kidneyChoice = 'Registered';
    }
    else {
      kidneyChoice = 'NA';
    }
    if (dHeart == 'true') {
      heartChoice = 'Registered';
    }
    else {
      heartChoice = 'NA';
    }
    if (dLiver == 'true') {
      liverChoice = 'Registered';
    }
    else {
      liverChoice = 'NA';
    }
    // Payloads for all 3 addresses (for each organ)
    let payloadKidney = ["Donor", dName, dContact, dBloodGroup, dDob, dDor, kidneyChoice, dRegNumber, "K", "Active"].join(',');
    let payloadHeart = ["Donor", dName, dContact, dBloodGroup, dDob, dDor, heartChoice, dRegNumber, "H", "Active"].join(',');
    let payloadLiver = ["Donor", dName, dContact, dBloodGroup, dDob, dDor, liverChoice, dRegNumber, "L", "Active"].join(',');
    let payload = [payloadKidney, payloadHeart, payloadLiver];
    let donorStateCheckH1 = await this.getStateDonor(addressH1[0], addressH1[1], addressH1[2], true);
    let donorStateCheckH2 = await this.getStateDonor(addressH2[0], addressH2[1], addressH2[2], true);
    let donorStateCheckH3 = await this.getStateDonor(addressH3[0], addressH3[1], addressH3[2], true);
    var donorAddCheck = '0';
    // Checking if Donor exists
    if ((donorStateCheckH1[0].data == '' || donorStateCheckH1[0].data == null) && (donorStateCheckH2[0].data == '' || donorStateCheckH2[0].data == null) && (donorStateCheckH3[0].data == '' || donorStateCheckH3[0].data == null)) {
      await generateTransaction(FAMILY_NAME, address, address, hkey, payload);
      donorAddCheck = '1';
    }
    else {
      console.log("Donor already exists, cannot register again!");
    }
    return donorAddCheck;
  }
  /**
   * Function to edit donor details.
   * 
   * @param {*} hkey 
   * @param {*} dRegNumber 
   * @param {*} dName 
   * @param {*} dContact 
   * @param {*} dBloodGroup 
   * @param {*} dDod 
   * @param {*} dTod 
   * @param {*} dDob 
   * @param {*} dDor 
   * @param {*} dKidneyChoice 
   * @param {*} dKidneyStatus 
   * @param {*} dHeartChoice 
   * @param {*} dHeartStatus 
   * @param {*} dLiverChoice 
   * @param {*} dLiverStatus 
   * @param {*} dohKey 
   * @param {*} h1_key 
   * @param {*} h2_key 
   * @param {*} h3_key 
   * @param {*} dHKeyHash 
   */
  editDonor(hkey, dRegNumber, dName, dContact, dBloodGroup, dDod, dTod, dDob, dDor, dKidneyChoice, dKidneyStatus, dHeartChoice, dHeartStatus, dLiverChoice, dLiverStatus, dohKey, h1_key, h2_key, h3_key, dHKeyHash) {

    let h1Hash = hKeyHash(h1_key);
    let h2Hash = hKeyHash(h2_key);
    let h3Hash = hKeyHash(h3_key);
    let hkeySigner = '';
    // Check which hospital registered the donor
    if (dHKeyHash == h1Hash) {
      hkeySigner = h1_key;
    }
    else if (dHKeyHash == h2Hash) {
      hkeySigner = h2_key;
    }
    else if (dHKeyHash == h3Hash) {
      hkeySigner = h3_key;
    }
    // Donor address using registered hospital
    let address = donorAddress(hkeySigner, dRegNumber, dBloodGroup);
    // Payloads for all 3 addresses (for each organ)
    let payloadKidney = ["Donor", dName, dContact, dBloodGroup, dDob, dDor, dKidneyChoice, dRegNumber, "K", "Died", dKidneyStatus, dDod, dTod].join(',');
    let payloadHeart = ["Donor", dName, dContact, dBloodGroup, dDob, dDor, dHeartChoice, dRegNumber, "H", "Died", dHeartStatus, dDod, dTod].join(',');
    let payloadLiver = ["Donor", dName, dContact, dBloodGroup, dDob, dDor, dLiverChoice, dRegNumber, "L", "Died", dLiverStatus, dDod, dTod].join(',');
    let payload = [payloadKidney, payloadHeart, payloadLiver];
    generateTransaction(FAMILY_NAME, address, address, hkeySigner, payload);
  }

  /**
   * Function to get data of all registered Patients from state.
   */
  async getPatientListing() {
    console.log("Entering getPatientListing()");
    let patientListingAddressKidney = hash(FAMILY_NAME).substr(0, 6) + '00' + 'aa';
    let patientListingAddressHeart = hash(FAMILY_NAME).substr(0, 6) + '00' + 'bb';
    let patientListingAddressLiver = hash(FAMILY_NAME).substr(0, 6) + '00' + 'cc';
    return this.getStatePatient(patientListingAddressKidney, patientListingAddressHeart, patientListingAddressLiver, true);
  }

  /**
   * Function to get data of all registered Donors from state.
   */
  async getDonorListing() {
    console.log("Entering getDonorListing()");
    let donorListingAddressKidney = hash(FAMILY_NAME).substr(0, 6) + '11' + 'aa';
    let donorListingAddressHeart = hash(FAMILY_NAME).substr(0, 6) + '11' + 'bb';
    let donorListingAddressLiver = hash(FAMILY_NAME).substr(0, 6) + '11' + 'cc';
    return this.getStateDonor(donorListingAddressKidney, donorListingAddressHeart, donorListingAddressLiver, true);
  }

  /**
   * Function to get data of Donor from state using Registration Number & blood group from /editDonor page, return as an array.
   * @param {*} dRegNum 
   * @param {*} dBloodGroup 
   */
  async getDonorEdit(dRegNum, dBloodGroup) {
    console.log("Entering getDonorEdit(), dRegNum: ", dRegNum);
    let bloodHash = hash(dBloodGroup);
    // Partial Donor address for all organs
    let addressKidney = hash(FAMILY_NAME).substr(0, 6) + '11' + 'aa' + bloodHash.slice(0, 12) + dRegNum.substr(0, 24);
    let addressHeart = hash(FAMILY_NAME).substr(0, 6) + '11' + 'bb' + bloodHash.slice(0, 12) + dRegNum.substr(0, 24);
    let addressLiver = hash(FAMILY_NAME).substr(0, 6) + '11' + 'cc' + bloodHash.slice(0, 12) + dRegNum.substr(0, 24);
    let stateDonorKidneyJSON = await this.getEditStateDonor(addressKidney);
    let stateDonorHeartJSON = await this.getEditStateDonor(addressHeart);
    let stateDonorLiverJSON = await this.getEditStateDonor(addressLiver);
    let stateDonorJSON = [stateDonorKidneyJSON.data[0], stateDonorHeartJSON.data[0], stateDonorLiverJSON.data[0]];
    return stateDonorJSON;
  }

  /**
   * Function to get data for Donor from state for passed address.
   * @param {*} addressPassed 
   */
  async getEditStateDonor(addressPassed) {
    console.log("Entering getEditStateDonor(), addressPassed: ", addressPassed);
    // Defining rest-api endpoint for querying state data
    let stateRequest = 'http://rest-api:8008/state?address=' + addressPassed;
    let stateResponse = await fetch(stateRequest);
    let stateJSON = await stateResponse.json();
    return stateJSON;
  }

  /**
   * Function to get data for Patient from state for passed address.
   * @param {*} addressKidney 
   * @param {*} addressHeart 
   * @param {*} addressLiver 
   * @param {*} isQuery 
   */
  async getStatePatient(addressKidney, addressHeart, addressLiver, isQuery) {
    console.log("Entering getStatePatient()");
    // Defining rest-api endpoint for querying state data
    let stateRequestKidney = 'http://rest-api:8008/state';
    let stateRequestHeart = 'http://rest-api:8008/state';
    let stateRequestLiver = 'http://rest-api:8008/state';
    if (addressKidney) {
      if (isQuery) {
        stateRequestKidney += ('?address=');
        stateRequestHeart += ('?address=');
        stateRequestLiver += ('?address=');
      }
      else {
        stateRequestKidney += ('/address/');
        stateRequestHeart += ('/address/');
        stateRequestLiver += ('/address/');
      }
      stateRequestKidney += addressKidney;
      stateRequestHeart += addressHeart;
      stateRequestLiver += addressLiver;
    }
    let stateResponseKidney = await fetch(stateRequestKidney);
    let stateKidneyJSON = await stateResponseKidney.json();
    let stateResponseHeart = await fetch(stateRequestHeart);
    let stateHeartJSON = await stateResponseHeart.json();
    let stateResponseLiver = await fetch(stateRequestLiver);
    let stateLiverJSON = await stateResponseLiver.json();
    let stateResponseJSON = [stateKidneyJSON, stateHeartJSON, stateLiverJSON];
    return stateResponseJSON;
  }

  /**
   * Function to get data for Donor from state for passed address.
   * @param {*} addressKidney 
   * @param {*} addressHeart 
   * @param {*} addressLiver 
   * @param {*} isQuery 
   */
  async getStateDonor(addressKidney, addressHeart, addressLiver, isQuery) {
    console.log("Entering getStateDonor()");
    // Defining rest-api endpoint for querying state data
    let stateRequestKidney = 'http://rest-api:8008/state';
    let stateRequestHeart = 'http://rest-api:8008/state';
    let stateRequestLiver = 'http://rest-api:8008/state';
    if (addressKidney) {
      if (isQuery) {
        stateRequestKidney += ('?address=');
        stateRequestHeart += ('?address=');
        stateRequestLiver += ('?address=');
      }
      else {
        stateRequestKidney += ('/address/');
        stateRequestHeart += ('/address/');
        stateRequestLiver += ('/address/');
      }
      stateRequestKidney += addressKidney;
      stateRequestHeart += addressHeart;
      stateRequestLiver += addressLiver;
    }
    let stateResponseKidney = await fetch(stateRequestKidney);
    let stateKidneyJSON = await stateResponseKidney.json();
    let stateResponseHeart = await fetch(stateRequestHeart);
    let stateHeartJSON = await stateResponseHeart.json();
    let stateResponseLiver = await fetch(stateRequestLiver);
    let stateLiverJSON = await stateResponseLiver.json();
    let stateResponseJSON = [stateKidneyJSON, stateHeartJSON, stateLiverJSON];
    return stateResponseJSON;
  }

  /**
   * Function creates waitlist addresses as per user input for Patient when registering.
   * 
   * Function creates waitlist addresses only if Patient has requested the organ.
   * @param {*} address 
   * @param {*} dohKey 
   * @param {*} pRegNumber 
   * @param {*} pBloodGroup 
   * @param {*} kidneyChoice 
   * @param {*} heartChoice 
   * @param {*} liverChoice 
   */
  async addWL(address, dohKey, pRegNumber, pBloodGroup, kidneyChoice, heartChoice, liverChoice) {
    console.log("Entering addWL(), checking address required: ");
    DOH = dohKey;
    let wlAddressKidney;
    let wlAddressHeart;
    let wlAddressLiver;
    let wlAddress = [];
    let wlCounter = 0;
    var kidneyAction = 'Waitlist';
    var heartAction = 'Waitlist';
    var liverAction = 'Waitlist';
    var kidneyCounter = 0;
    var heartCounter = 0;
    var liverCounter = 0;
    let kidneyState = [];
    let kidneyStateTest = [];
    let heartState = [];
    let heartStateTest = [];
    let liverState = [];
    let liverStateTest = [];
    let payload = [];
    if (kidneyChoice == 'Requested') {
      wlAddressKidney = await waitlistAddress(dohKey, pRegNumber, pBloodGroup, 'aa');
      wlAddress[wlCounter] = wlAddressKidney;
      // Checking if waitlist for Kidney for this bloodgroup has other requests, set waitlist number accordingly.
      kidneyState = await getStateWaitlistBloodgroup('aa', pBloodGroup);
      kidneyStateTest = kidneyState[0].data;
      if (kidneyState[0].data == '' || kidneyState[0].data == null) {
        console.log("No previous Kidney data in Waitlist!");
        kidneyCounter = 1;
        if (kidneyChoice != 'Requested') {
          kidneyCounter = 'NA';
          kidneyAction = 'NA'
        }
      }
      else {
        console.log("Kidney Waitlist data exists, getting length for counter");
        kidneyCounter = kidneyStateTest.length + 1;
        if (kidneyChoice != 'Requested') {
          kidneyCounter = 'NA';
          kidneyAction = 'NA'
        }
      }
      // Set payload for Kidney Waitlist
      let payloadKidney = [kidneyAction, "K", pBloodGroup, kidneyCounter, pRegNumber, address[0]];
      payload[wlCounter] = payloadKidney;
      wlCounter += 1;
    }
    else {
      console.log("Kidney Not Requested!");
    }

    if (heartChoice == 'Requested') {
      wlAddressHeart = await waitlistAddress(dohKey, pRegNumber, pBloodGroup, 'bb');
      wlAddress[wlCounter] = wlAddressHeart;
      // Checking if waitlist for Heart for this bloodgroup has other requests, set waitlist number accordingly.
      heartState = await getStateWaitlistBloodgroup('bb', pBloodGroup);
      heartStateTest = heartState[0].data;
      if (heartState[0].data == '' || heartState[0].data == null) {
        console.log("No previous Heart data in Waitlist!");
        heartCounter = 1;
        if (heartChoice != 'Requested') {
          heartCounter = 'NA';
          heartAction = 'NA'
        }
      }
      else {
        console.log("Heart Waitlist data exists, getting length for counter");
        heartCounter = heartStateTest.length + 1;
        if (heartChoice != 'Requested') {
          heartCounter = 'NA';
          heartAction = 'NA'
        }
        console.log("heartCounter: ", heartCounter);
      }
      // Set payload for Heart Waitlist.
      let payloadHeart = [heartAction, "H", pBloodGroup, heartCounter, pRegNumber, address[1]];
      payload[wlCounter] = payloadHeart;
      wlCounter += 1;
    }
    else {
      console.log("Heart Not Requested!");
    }
    if (liverChoice == 'Requested') {
      wlAddressLiver = await waitlistAddress(dohKey, pRegNumber, pBloodGroup, 'cc');
      wlAddress[wlCounter] = wlAddressLiver;
      // Checking if waitlist for Liver for this bloodgroup has other requests, set waitlist number accordingly.
      liverState = await getStateWaitlistBloodgroup('cc', pBloodGroup);
      liverStateTest = liverState[0].data;
      console.log("length of liverStateTest: ", liverStateTest.length);
      if (liverState[0].data == '' || liverState[0].data == null) {
        console.log("No previous Liver data in Waitlist!");
        liverCounter = 1;
        if (liverChoice != 'Requested') {
          liverCounter = 'NA';
          liverAction = 'NA'
        }
      }
      else {
        console.log("Liver Waitlist data exists, getting length for counter");
        liverCounter = liverStateTest.length + 1;
        if (liverChoice != 'Requested') {
          liverCounter = 'NA';
          liverAction = 'NA'
        }
        console.log("liverCounter: ", liverCounter);
      }
      // Set payload for Liver Waitlist.
      let payloadLiver = [liverAction, "L", pBloodGroup, liverCounter, pRegNumber, address[2]];
      payload[wlCounter] = payloadLiver;
      wlCounter += 1;
    }
    else {
      console.log("Liver Not Requested!");
    }
    console.log("Waitlist addresses: ", wlAddress);
    await generateTransactionWL(FAMILY_NAME_2, wlAddress, wlAddress, dohKey, payload);
  }

  /**
   * Function to get data of all waitlist items for specified organ from state.
   * @param {*} organ 
   */
  async getWaitlistListing(organ) {
    console.log("Entering getWaitlistListing()");
    let waitlistData = await getStateWaitlist(organ);
    return waitlistData;
  }

  /**
   * Function to get data of all waitlist items for specified organ & blood group from state.
   * @param {*} organ 
   * @param {*} bloodGroup 
   */
  async getWaitlistListingBloodGroup(organ, bloodGroup) {
    console.log("Entering getWaitlistListingBloodGroup()");
    let waitlistData = await getStateWaitlistBloodgroup(organ, bloodGroup);
    return waitlistData;
  }

  /**
   * Function to get data of specified patient address from state when matching.
   * 
   * @param {*} pOrganAddress 
   */
  async getStatePatientMatched(pOrganAddress) {
    console.log("Entering getStatePatientMatched()");
    // Defining rest-api endpoint for querying state data
    let stateRequestOrgan = 'http://rest-api:8008/state?address=' + pOrganAddress;
    let stateResponseOrgan = await fetch(stateRequestOrgan);
    let stateOrganJSON = await stateResponseOrgan.json();
    return stateOrganJSON;
  }

  /**
   * Function to check which key was used to set passed address, and call generateTransactionMatched() to set data.
   * 
   * @param {*} address 
   * @param {*} payload 
   * @param {*} h1Key 
   * @param {*} h2Key 
   * @param {*} h3Key 
   */
  async matchFunctions(address, payload, h1Key, h2Key, h3Key) {
    console.log("Entering matchFunctions for address: ", address);
    let hKeyTemp = address.slice(46, 70);
    let hKeyMatch;
    let hKey = [h1Key, h2Key, h3Key];
    let returnFlag = 0;
    for (let i = 0; i < 3; i++) {
      var tempKey = hKey[i];
      if (returnFlag == 0) {
        hKeyMatch = await hKeyHash(tempKey);
        if (hKeyMatch == hKeyTemp) {
          console.log("Key match found: ", hKeyMatch);
          await generateTransactionMatched(FAMILY_NAME, address, address, tempKey, payload);
          returnFlag = 1;
        }
        else {
          console.log("Unable to call generateTransactionMatched, please check!");
        }
      }
    }
    return ([returnFlag, addressDeleted]);
  }

  /**
   * Function to update Waitlist data.
   * 
   * @param {*} address 
   * @param {*} payload 
   * @param {*} dohKey 
   */
  async updateWL(address, payload, dohKey) {
    console.log("WL addresses to update: ", address);
    await generateTransactionWL(FAMILY_NAME_2, address, address, dohKey, payload);
  }

  /**
   * Function to update organ match log, and delete waitlist address after matching.
   * 
   * @param {*} address 
   * @param {*} dohKey 
   * @param {*} organ 
   * @param {*} bloodGroup 
   * @param {*} pRegNum 
   * @param {*} dRegNum 
   */
  async deleteFromState(address, dohKey, organ, bloodGroup, pRegNum, dRegNum) {
    console.log("Entered deleteFromState()!");
    let a = 'Delete';
    let b = 'Matched';
    let returnFlag = 1;
    // Set payload for delete
    let payload = [a, address];
    let payload2 = [];
    // Set payload for organ match log
    payload2 = [b, address, addressDeleted, organ, bloodGroup, pRegNum, dRegNum];
    await generateTransactionWL(FAMILY_NAME_2, [addressDeleted], [addressDeleted], dohKey, [payload2]);
    await generateTransactionWL(FAMILY_NAME_2, [address], [address], dohKey, [payload]);
    return returnFlag;
  }

  /**
   * Function to list last committed Block information.
   */
  async getBlocks() {
    console.log("Entering getBlocks()");
    // Defining rest-api endpoint for querying block
    let blockRequest = 'http://rest-api:8008/blocks';
    let blockResponse = await fetch(blockRequest);
    let blockResponseJSON = await blockResponse.json();
    return blockResponseJSON;
  }

  /**
   * Function to query Transaction Receipt data for specified Transaction ID.
   * 
   * @param {*} txnID 
   */
  async getTxnReceipt(txnID) {
    console.log("Entering getTxnReceipt()");
    // Defining rest-api endpoint for querying receipts
    let txnRequest = 'http://rest-api:8008/receipts?id=' + txnID;
    let txnResponse = await fetch(txnRequest);
    let txnResponseJSON = await txnResponse.json();
    return txnResponseJSON;
  }

  /**
   * Function to query batch information.
   */
  async getBatches() {
    console.log("Entering getBatches()");
    // Defining rest-api endpoint for querying batches
    let blockRequest = 'http://rest-api:8008/batches';
    let blockResponse = await fetch(blockRequest);
    let blockResponseJSON = await blockResponse.json();
    return blockResponseJSON;
  }

  /**
   * Function to display data in organ match log.
   */
  async getMatchListing() {
    console.log("Entering getMatchListing()");
    // Defining rest-api endpoint for querying state data
    let stateRequest = 'http://rest-api:8008/state?address=' + addressDeleted;
    let stateResponse = await fetch(stateRequest);
    let stateJSON = await stateResponse.json();
    return stateJSON;
  }

}

module.exports.UserClient = UserClient;
