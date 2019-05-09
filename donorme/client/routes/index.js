var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var { UserClient } = require('./userClient');

const fs = require('fs');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET login page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Donor.Me' });
  // res.redirect('index');
});

/* GET home page. */
router.get('/home', function (req, res, next) {
  res.render('home', { title: 'Donor.Me' });
});

/* GET registerDonor page. */
router.get('/registerDonor', function (req, res, next) {
  res.render('registerDonor', { title: 'Donor Registration' });
});

/* GET registerPatient page. */
router.get('/registerPatient', function (req, res, next) {
  res.render('registerPatient', { title: 'Patient Registration' });
});

/* GET list of Donors */
router.get('/listDonors', async (req, res) => {
  var donorClient = new UserClient();
  let stateData = await donorClient.getDonorListing();
  console.log("In /listDonors -----------");
  let donorList = [];
  var counter = 0;
  let donorListKidney = [];
  let donorStatusKidney = [];
  let donorListHeart = [];
  let donorStatusHeart = [];
  let donorListLiver = [];
  let donorStatusLiver = [];
  // Iterating in a loop to get Donor kidney information
  stateData[0].data.forEach(donors0 => {
    if (!donors0.data) {
      return;
    }
    let decodedDonorDetails1 = Buffer.from(donors0.data, 'base64').toString();
    let donorDetails1 = decodedDonorDetails1.split(',');
    donorListKidney[counter] = donorDetails1;
    // Checking if Donor status is 'Died' (payload length 13), else displaying organ status as '-'.
    if (donorDetails1.length == '13') {
      donorStatusKidney[counter] = donorDetails1[10];
    }
    else {
      donorStatusKidney[counter] = '-';
    }
    counter += 1;
  });
  // reset counter to 0
  counter = 0;
  // Iterating in a loop to get Donor heart information
  stateData[1].data.forEach(donors1 => {
    if (!donors1.data) {
      return;
    }
    let decodedDonorDetails2 = Buffer.from(donors1.data, 'base64').toString();
    let donorDetails2 = decodedDonorDetails2.split(',');
    donorListHeart[counter] = donorDetails2[6];
    // Checking if Donor status is 'Died' (payload length 13), else displaying organ status as '-'.
    if (donorDetails2.length == '13') {
      donorStatusHeart[counter] = donorDetails2[10];
    }
    else {
      donorStatusHeart[counter] = '-';
    }
    counter += 1;
  });
  // reset counter to 0
  counter = 0;
  // Iterating in a loop to get Donor liver information
  stateData[2].data.forEach(donors2 => {
    if (!donors2.data) {
      return;
    }
    let decodedDonorDetails3 = Buffer.from(donors2.data, 'base64').toString();
    let donorDetails3 = decodedDonorDetails3.split(',');
    donorListLiver[counter] = donorDetails3[6];
    // Checking if Donor status is 'Died' (payload length 13), else displaying organ status as '-'.
    if (donorDetails3.length == '13') {
      donorStatusLiver[counter] = donorDetails3[10];
    }
    else {
      donorStatusLiver[counter] = '-';
    }
    // Push all the donor data together by counter
    donorList.push({
      dRegNum: donorListKidney[counter][7],
      dContact: donorListKidney[counter][2],
      dRegDate: donorListKidney[counter][5],
      dBloodGroup: donorListKidney[counter][3],
      dKidneyChoice: donorListKidney[counter][6],
      dKidneyStatus: donorStatusKidney[counter],
      dHeartChoice: donorListHeart[counter],
      dHeartStatus: donorStatusHeart[counter],
      dLiverChoice: donorListLiver[counter],
      dLiverStatus: donorStatusLiver[counter],
      dStatus: donorListKidney[counter][9]
    });
    counter += 1;
  });
  // Rendering donor data 
  res.render('listDonors', { title: 'Donor List', listings: donorList })
});

/* GET list of Patients */
router.get('/listPatients', async (req, res) => {
  var patientClient = new UserClient();
  let stateData = await patientClient.getPatientListing();
  console.log("In /listPatients -------------");
  let patientList = [];
  var counter = 0;
  let patientListKidney = [];
  let patientStatusKidney = [];
  let patientListHeart = [];
  let patientStatusHeart = [];
  let patientListLiver = [];
  let patientStatusLiver = [];
  // Iterating in a loop to get Patient kidney information
  stateData[0].data.forEach(patients0 => {
    if (!patients0.data) {
      return;
    }
    let decodedPatientDetails1 = Buffer.from(patients0.data, 'base64').toString();
    let patientDetails1 = decodedPatientDetails1.split(',');
    patientListKidney[counter] = patientDetails1;
    // Checking if Patient organ request is matched, else displaying organ status as '-'.
    if (patientDetails1.length == '13') {
      patientStatusKidney[counter] = patientDetails1[10];
    }
    else if (patientDetails1.length == '11' && patientDetails1[10] == 'Matched') {
      patientStatusKidney[counter] = patientDetails1[10];
    }
    else {
      patientStatusKidney[counter] = '-';
    }
    counter += 1;
  });
  // reset counter to 0
  counter = 0;
  // Iterating in a loop to get Patient heart information
  stateData[1].data.forEach(patients1 => {
    if (!patients1.data) {
      return;
    }
    let decodedPatientDetails2 = Buffer.from(patients1.data, 'base64').toString();
    let patientDetails2 = decodedPatientDetails2.split(',');
    patientListHeart[counter] = patientDetails2[6];
    // Checking if Patient organ request is matched, else displaying organ status as '-'.
    if (patientDetails2.length == '13') {
      patientStatusHeart[counter] = patientDetails2[10];
    }
    else if (patientDetails2.length == '11' && patientDetails2[10] == 'Matched') {
      patientStatusHeart[counter] = patientDetails2[10];
    }
    else {
      patientStatusHeart[counter] = '-';
    }
    counter += 1;
  });
  // reset counter to 0
  counter = 0;
  // Iterating in a loop to get Patient liver information
  stateData[2].data.forEach(patients2 => {
    if (!patients2.data) {
      return;
    }
    let decodedPatientDetails3 = Buffer.from(patients2.data, 'base64').toString();
    let patientDetails3 = decodedPatientDetails3.split(',');
    patientListLiver[counter] = patientDetails3[6];
    // Checking if Patient organ request is matched, else displaying organ status as '-'.
    if (patientDetails3.length == '13') {
      patientStatusLiver[counter] = patientDetails3[10];
    }
    else if (patientDetails3.length == '11' && patientDetails3[10] == 'Matched') {
      patientStatusLiver[counter] = patientDetails3[10];
    }
    else {
      patientStatusLiver[counter] = '-';
    }
    // Push all the patient data together by counter
    patientList.push({
      pRegNum: patientListKidney[counter][7],
      pContact: patientListKidney[counter][2],
      pRegDate: patientListKidney[counter][5],
      pBloodGroup: patientListKidney[counter][3],
      pKidneyChoice: patientListKidney[counter][6],
      pKidneyStatus: patientStatusKidney[counter],
      pHeartChoice: patientListHeart[counter],
      pHeartStatus: patientStatusHeart[counter],
      pLiverChoice: patientListLiver[counter],
      pLiverStatus: patientStatusLiver[counter],
      pStatus: patientListKidney[counter][9]
    });
    counter += 1;
  });
  // Rendering patient data 
  res.render('listPatients', { title: 'Patient List', listings: patientList });
});

/* POST login page */
router.post('/', urlencodedParser, function (req, res, next) {
  const loginCred = req.body.loginCred;
  console.log("Data sent to Login!" + loginCred);
  // Restricting logins to h1, h2, h3, dohtvpm only
  if (loginCred === 'h1' || loginCred === 'h2' || loginCred === 'h3' || loginCred === 'dohtvpm') {
    // Getting the private key of Registered Hospitals from the .priv files
    var userPrivKeyFile = '/root/.sawtooth/keys/' + loginCred + '.priv';
    var h1PrivKeyFile = '/root/.sawtooth/keys/h1.priv';
    var h2PrivKeyFile = '/root/.sawtooth/keys/h2.priv';
    var h3PrivKeyFile = '/root/.sawtooth/keys/h3.priv';
    // Hard-coding DOHTVPM details to retrieve key
    var dohPrivKeyFile = '/root/.sawtooth/keys/dohtvpm.priv';
    var userPrivKey = '';
    var h1PrivKey = '';
    var h2PrivKey = '';
    var h3PrivKey = '';
    var dohPrivKey = '';
    var userPrivKeyDecoded = '';
    var dohPrivKeyDecoded = '';
    var errorCheck = '';
    //  Verify department key has been generated before going forward, verify & retrieve hospital keys if check passed
    try {
      dohPrivKey = fs.readFileSync(dohPrivKeyFile);
      console.log("dohPrivKey: ", dohPrivKey);
      dohPrivKeyDecoded = Buffer.from(dohPrivKey, 'base64').toString();
    }
    catch (err) {
      errorCheck = err.code;
      console.log("Error.code: ", errorCheck);
    }
    console.log("dohPrivKeyDecoded: ", dohPrivKeyDecoded);
    if (errorCheck === 'ENOENT') {
      res.send({ done: 2, message: "Department of Health not registered yet!" });
    }
    else {
      try {
        userPrivKey = fs.readFileSync(userPrivKeyFile);
        userPrivKeyDecoded = Buffer.from(userPrivKey, 'base64').toString();
      }
      catch (err) {
        errorCheck = err.code;
        console.log("Login Error.code: ", errorCheck);
      }
      console.log("userPrivKeyDecoded: ", userPrivKeyDecoded);
      if (errorCheck === 'ENOENT') {
        res.send({ done: 0, message: "Login Unsuccessful, Hospital not registered!" });
      }
      else {
        try {
          h1PrivKey = fs.readFileSync(h1PrivKeyFile);
          h1PrivKey = Buffer.from(h1PrivKey, 'base64').toString();
        }
        catch (err) {
          errorCheck = err.code;
          console.log("H1 Error.code: ", errorCheck);
        }
        try {
          h2PrivKey = fs.readFileSync(h2PrivKeyFile);
          h2PrivKey = Buffer.from(h2PrivKey, 'base64').toString();
        }
        catch (err) {
          errorCheck = err.code;
          console.log("H2 Error.code: ", errorCheck);
        }
        try {
          h3PrivKey = fs.readFileSync(h3PrivKeyFile);
          h3PrivKey = Buffer.from(h3PrivKey, 'base64').toString();
        }
        catch (err) {
          errorCheck = err.code;
          console.log("H3 Error.code: ", errorCheck);
        }
        res.send({
          done: 1, message: "Login Successful!",
          loginCred: loginCred,
          loginKey: userPrivKeyDecoded,
          dohKey: dohPrivKeyDecoded,
          h1Key: h1PrivKey,
          h2Key: h2PrivKey,
          h3Key: h3PrivKey
        });
      }
    }
  }
  else {
    res.send({ done: 0, message: "Registered Hospitals in this network are: h1, h2, h3! Please try again with correct details." });
  }
});

/* POST registering donor */
router.post('/registerDonor', async function (req, res, next) {
  let dohKey = req.body.dohKey;
  let hkey = req.body.hKey;
  let h1Key = req.body.h1_key;
  let h2Key = req.body.h2_key;
  let h3Key = req.body.h3_key;
  let dAadhaar = req.body.dAadhaar;
  let dName = req.body.dName;
  let dContact = req.body.dContactDetails;
  let dBloodGroup = req.body.dBloodGroup;
  let dDob = req.body.dDOB;
  let dDor = req.body.dDOR;
  let dKidney = req.body.dKidney;
  let dHeart = req.body.dHeart;
  let dLiver = req.body.dLiver;
  console.log("Donor Data sent to REST API!");
  var d_client = new UserClient();
  // Call addDonor() function, send message to page based on response from function
  var donorAddCheck = await d_client.addDonor(hkey, dAadhaar, dName, dContact, dBloodGroup, dDob, dDor, dKidney, dHeart, dLiver, dohKey, h1Key, h2Key, h3Key);
  if (donorAddCheck === '1') {
    res.send({ message: "Donor  Registration request sent!" });
  }
  else {
    res.send({ message: "Cannot register Donor / Donor already exists!" });
  }
});

/* POST registering patient */
router.post('/registerPatient', async function (req, res, next) {
  let dohKey = req.body.dohKey;
  let hkey = req.body.hKey;
  let h1Key = req.body.h1_key;
  let h2Key = req.body.h2_key;
  let h3Key = req.body.h3_key;
  let pAadhaar = req.body.pAadhaar;
  let pName = req.body.pName;
  let pContact = req.body.pContactDetails;
  let pBloodGroup = req.body.pBloodGroup;
  let pDob = req.body.pDOB;
  let pDor = req.body.pDOR;
  let pKidney = req.body.pKidney;
  let pHeart = req.body.pHeart;
  let pLiver = req.body.pLiver;
  console.log("Patient Data sent to REST API!");
  var p_client = new UserClient();
  // Call addPatient() function, send message to page based on response from function
  var patientAddCheck = await p_client.addPatient(hkey, pAadhaar, pName, pContact, pBloodGroup, pDob, pDor, pKidney, pHeart, pLiver, dohKey, h1Key, h2Key, h3Key);
  if (patientAddCheck === '1') {
    res.send({ message: "Patient Registration request sent!" });
  }
  else if (patientAddCheck == '3') {
    res.send({ message: "Patient already exists!" });
  }
});

/* POST when editing donor */
router.post('/post1', async function (req, res, next) {
  let dohKey = req.body.dohKey;
  let hkey = req.body.hKey;
  let h1_key = req.body.h1_key;
  let h2_key = req.body.h2_key;
  let h3_key = req.body.h3_key;
  let dRegNum = req.body.dRegNum;
  let dName = req.body.dName;
  let dContact = req.body.dContactDetails;
  let dBloodGroup = req.body.dBloodGroup;
  let dDod = req.body.dDod;
  let dTod = req.body.dTod;
  let dDob = req.body.dDOB;
  let dDor = req.body.dDOR;
  let dKidneyChoice = req.body.dKidneyChoice;
  let dKidneyStatus = req.body.dKidneyStatus;
  let dHeartChoice = req.body.dHeartChoice;
  let dHeartStatus = req.body.dHeartStatus;
  let dLiverChoice = req.body.dLiverChoice;
  let dLiverStatus = req.body.dLiverStatus;
  let dHKeyHash = req.body.dHKeyHash;
  console.log("Donor Data to update sent to REST API!");
  // Call editDonor() function, send message to page
  var d_client = new UserClient();
  await d_client.editDonor(hkey, dRegNum, dName, dContact, dBloodGroup, dDod, dTod, dDob, dDor, dKidneyChoice, dKidneyStatus, dHeartChoice, dHeartStatus, dLiverChoice, dLiverStatus, dohKey, h1_key, h2_key, h3_key, dHKeyHash);
  console.log("Donor Updation request sent!");
  res.send({ message: "Donor Updation request sent!" });
});

/* POST when searching donor data */
router.post('/editDonor/post', async function (req, res, next) {
  var regNum = req.body.donorRegNum;
  var bloodGroup = req.body.dBloodGroup;
  console.log("Sending Donor details for editing! ", regNum, bloodGroup);
  res.redirect('/editDonor/' + regNum + '/' + bloodGroup);
});

/* GET when editing donor */
router.get('/editDonor/:regNum/:bloodGroup', async function (req, res, next) {
 try {
  var donorClient = new UserClient();
  var stateData = await donorClient.getDonorEdit(req.params.regNum, req.params.bloodGroup);
  let decodedDonorDetailsKidney = Buffer.from(stateData[0].data, 'base64').toString();
  let donorDetailsKidney = decodedDonorDetailsKidney.split(',');
  let decodedDonorDetailsHeart = Buffer.from(stateData[1].data, 'base64').toString();
  let donorDetailsHeart = decodedDonorDetailsHeart.split(',');
  let decodedDonorDetailsLiver = Buffer.from(stateData[2].data, 'base64').toString();
  let donorDetailsLiver = decodedDonorDetailsLiver.split(',');
  // Slicing Kidney address to get hKeyHash to identify hospital that registered donor
  var hKeyHash = stateData[0].address.slice(46, 70);
  if (donorDetailsKidney[9] == 'Died' || donorDetailsHeart[9] == 'Died' || donorDetailsLiver[9] == 'Died') {
    console.log("Donor already updated as 'Died', cannot update again!");
    res.render('editDonor', { title: 'Donor Update', message: "Donor already updated as 'Died', cannot update again!" });
  }
  else {
    console.log("Donor details loading for editing!");
    res.render('editDonor', {
      title: 'Donor Update',
      dName: donorDetailsKidney[1],
      dBloodGroup1: req.params.bloodGroup,
      dRegNum1: req.params.regNum,
      dContact: donorDetailsKidney[2],
      dRegDate: donorDetailsKidney[5],
      dDob: donorDetailsKidney[4],
      dKidneyStatus: donorDetailsKidney[6],
      dHeartStatus: donorDetailsHeart[6],
      dLiverStatus: donorDetailsLiver[6],
      dHKeyHash: hKeyHash
    })
  }
 }
 catch (err) {
  console.log("Invalid search parameters, please check!");
  res.render('errorHospital', { title: 'Donor Update', message: "Invalid search parameters, please check!" });
 }
})

/* GET editDonor page */
router.get('/editDonor', function (req, res, next) {
  res.render('editDonor', { title: 'Donor Update ' });
})

/* GET waitlistKidney page */
router.get('/waitlistKidney', async (req, res) => {
  try {
    var organ = 'aa';
    console.log("In /waitlistKidney ----------");
    var doh_client = new UserClient();
    let stateData = await doh_client.getWaitlistListing(organ);
    let organList = [];
    // Iterating in a loop to push all kidney waitlist data together
    stateData[0].data.forEach(waitlists0 => {
      if (!waitlists0.data) {
        return;
      }
      let decodedDetails = Buffer.from(waitlists0.data, 'base64').toString();
      let organDetails1 = decodedDetails.split(',');
      if (organDetails1[0] != 'NA') {
        organList.push({
          pRegNum: organDetails1[4],
          pBloodGroup: organDetails1[2],
          pKidneyCounter: organDetails1[3]
        });
      }
      else {
        console.log("Kidney not requested!")
      }
    });
    if (organList.length >= 1) {
      res.render('waitlistKidney', { title: 'Kidney Waitlist', listing: organList });
    }
    else {
      res.render('error', { title: 'Kidney Waitlist', message: "Kidney Waitlist empty, please register Patients!" });
    }
  }
  catch (err) {
    console.log("Kidney not requested, redirecting to Error Page!");
    res.render('error', { title: 'Kidney Waitlist', message: "Kidney Waitlist empty, please register Patients!" });
  }
});

/* POST waitlistKidney page */
router.post('/waitlistKidney', async function (req, res, next) {
  console.log('In waitlistKidney post ---------');
  var doh_client = new UserClient();
  let stateDataWL = await doh_client.getWaitlistListing(req.body.organ);
  let dohKey = req.body.dohKey;
  let h1Key = req.body.h1Key;
  let h2Key = req.body.h2Key;
  let h3Key = req.body.h3Key;
  let f = [];
  let stateDataDonor = await doh_client.getDonorListing();
  let kidneyWaitlist = [];
  let counter1 = 0;
  // Iterating in a loop to get all requested kidney waitlist data where waitlist number is 1
  stateDataWL[0].data.forEach(waitlists0 => {
    if (!waitlists0.data) {
      return;
    }
    let decodedDetails = Buffer.from(waitlists0.data, 'base64').toString();
    let organDetails1 = decodedDetails.split(',');
    if (organDetails1[0] == 'Waitlist' && organDetails1[3] == '1') {
      kidneyWaitlist[counter1] = [waitlists0.address, organDetails1[2], organDetails1[3], organDetails1[4], organDetails1[5]];
      counter1 += 1;
    }
    else {
      console.log("Kidney not requested by: " + organDetails1[4] + " or not first in Waitlist!")
    }
  });
  let donorAddressList = [];
  let donorDataList = [];
  let counter2 = 0;
  var today = new Date();
  // Iterating in a loop to get all requested kidney donor data if viable
  stateDataDonor[0].data.forEach(async donors0 => {
    if (!donors0.data) {
      return;
    }
    let decodedDetailsDonor = Buffer.from(donors0.data, 'base64').toString();
    let donorDetails = decodedDetailsDonor.split(',');
    var d_dodTest = new Date(donorDetails[11] + ' ' + donorDetails[12] + ':00 GMT+0530');
    var diff = today.getTime() - d_dodTest.getTime();
    var hours = (diff / (1000 * 60 * 60)).toFixed(4);
    console.log("Difference in time (hours): ", hours);
    if (donorDetails[9] == 'Died' && donorDetails[6] == 'Registered' && donorDetails[10] == 'Viable' && hours <= 4.9835) {
      donorAddressList[counter2] = donors0.address;
      donorDataList[counter2] = [donorDetails[0], donorDetails[1], donorDetails[2], donorDetails[3], donorDetails[4], donorDetails[5], donorDetails[6], donorDetails[7], donorDetails[8], donorDetails[9], donorDetails[10], donorDetails[11], donorDetails[12]];
      counter2 += 1;
    }
    else if (hours > 4.9835) {
      console.log("Over 5 hours since Time of Death, Donor Organs not viable. ---- ", donors0.address);
      let donorDataUpdate = [donorDetails[0], donorDetails[1], donorDetails[2], donorDetails[3], donorDetails[4], donorDetails[5], donorDetails[6], donorDetails[7], donorDetails[8], donorDetails[9], 'Not Viable', donorDetails[11], donorDetails[12]];
      // Calling matchFunctions to update Donor organ as 'Not Viable'
      let dUpdate = await doh_client.matchFunctions(donors0.address, donorDataUpdate, h1Key, h2Key, h3Key);
      if (dUpdate == 1) {
        console.log("Donor Kidney updated as Not Viable.");
      }
    }
  });
  // Iterating in a loop to check for match for each kidney waitlist item, for each blood group, against donor list
  for (let i = 0; i < kidneyWaitlist.length; i++) {
    let bloodGroup = kidneyWaitlist[i][1];
    for (let j = 0; j < donorDataList.length; j++) {
      console.log("Checking donor and waitlist matches in for loop Kidney");
      let tempWLAddress = kidneyWaitlist[i][0];
      // Adding matched check for second iteration after first Donor match updated
      if (bloodGroup == donorDataList[j][3] && donorDataList[j][10] != 'Matched') {
        console.log("Donor: " + donorDataList[j][7] + " matched with Patient: " + kidneyWaitlist[i][3] + " in Waitlist for Kidney with bloodgroup: ", bloodGroup);
        let pRegNum = kidneyWaitlist[i][3];
        let dRegNum = donorDataList[j][7];
        let patientStateKidney = await doh_client.getStatePatientMatched(kidneyWaitlist[i][4]);
        let decodedPatientDetails = Buffer.from(patientStateKidney.data[0].data, 'base64').toString();
        let patientDetails = decodedPatientDetails.split(',');
        patientDetails[10] = 'Matched';
        donorDataList[j][10] = 'Matched';
        // Calling matchFunctions to update patient as 'Matched'
        let p = await doh_client.matchFunctions(patientStateKidney.data[0].address, patientDetails, h1Key, h2Key, h3Key);
        if (p[0] == 1) {
          console.log("Patient updated as matched (Kidney)! ", p[0] + " ---- " + p[1]);
        }
        // Calling matchFunctions to update donor as 'Matched'
        let d = await doh_client.matchFunctions(donorAddressList[j], donorDataList[j], h1Key, h2Key, h3Key);
        if (d[0] == 1) {
          console.log("Donor updated as matched (Kidney)! ", d[0] + " ---- " + d[1]);
        }
        // Calling deleteState to delete matched waitlist address, and update organ match log
        if (p[0] == 1 && d[0] == 1) {
          console.log("Starting WL address deletion (Kidney)!")
          console.log("Deleting WL address: " + tempWLAddress + " !");
          f[2] = await doh_client.deleteFromState(tempWLAddress, dohKey, 'Kidney', bloodGroup, pRegNum, dRegNum);
          f[0] = p[0];
          f[1] = d[0];
          // Maxing out j counter to stop looking for Kidney matches for this Patient (i)
          j = donorDataList.length;
        }
      }
    }
    // If match found, updating waitlist number for remaining waitlist items for same blood group
    if (f[0] == 1 && f[1] == 1 && f[2] == 1) {
      let wlUpdate = await doh_client.getWaitlistListingBloodGroup('aa', bloodGroup);
      let wlAddress = [];
      let wlPayload = [];
      let wlFlag = 0;
      let counterTest = 0;
      for (let a = 0; a < wlUpdate[0].data.length; a++) {
        let decodedDetails = Buffer.from(wlUpdate[0].data[a].data, 'base64').toString();
        let wlDetails = decodedDetails.split(',');
        if (wlDetails[0] == 'Waitlist' && wlDetails[3] != '1') {
          console.log("Decrementing Kidney Waitlist Counters for: " + wlDetails[4] + " !");
          wlAddress[counterTest] = wlUpdate[0].data[a].address;
          wlDetails[3] -= 1;
          wlPayload[counterTest] = wlDetails.toString();
          wlFlag += 1;
          counterTest += 1;
        }
      }
      console.log("wlAddress, wlPayload to update after counter change (Kidney): ", wlAddress, wlPayload);
      if (wlFlag != 0) {
        console.log("Updating Waitlist state with updated counters (Kidney)!");
        await doh_client.updateWL(wlAddress, wlPayload, dohKey);
      }
      else {
        console.log("Kidney Waitlist empty for bloodgroup: " + bloodGroup + "!")
      }
      res.send({ message: 'Checking for Kidney matches!' });
    }
    else {
      res.send({ message: 'Checking for Kidney matches!' });
    }
  }
});

/* GET waitlistHeart page */
router.get('/waitlistHeart', async (req, res) => {
  try {
    var organ = 'bb';
    console.log("In /waitlistHeart ---------");
    var doh_client = new UserClient();
    let stateData = await doh_client.getWaitlistListing(organ);
    let organList = [];
    // Iterating in a loop to push all heart waitlist data together
    stateData[0].data.forEach(waitlists0 => {
      if (!waitlists0.data) {
        return;
      }
      let decodedDetails = Buffer.from(waitlists0.data, 'base64').toString();
      let organDetails1 = decodedDetails.split(',');
      if (organDetails1[0] != 'NA') {
        organList.push({
          pRegNum: organDetails1[4],
          pBloodGroup: organDetails1[2],
          pHeartCounter: organDetails1[3]
        });
      }
      else {
        console.log("Heart not requested!")
      }
    });
    if (organList.length >= 1) {
      res.render('waitlistHeart', { title: 'Heart Waitlist', listing: organList });
    }
    else {
      res.render('error', { title: 'Heart Waitlist', message: "Heart Waitlist empty, please register Patients!" });
    }
  }
  catch (err) {
    console.log("Heart not requested, displaying Error Page!");
    res.render('error', { title: 'Heart Waitlist', message: "Heart Waitlist empty, please register Patients!" });
  }
});

/* POST waitlistHeart page */
router.post('/waitlistHeart', async function (req, res, next) {
  console.log('In waitlistHeart post ----------');
  var doh_client = new UserClient();
  let stateDataWL = await doh_client.getWaitlistListing(req.body.organ);
  let dohKey = req.body.dohKey;
  let h1Key = req.body.h1Key;
  let h2Key = req.body.h2Key;
  let h3Key = req.body.h3Key;
  let f = [];
  let stateDataDonor = await doh_client.getDonorListing();
  let heartWaitlist = [];
  let counter1 = 0;
  // Iterating in a loop to get all requested heart waitlist data where waitlist number is 1
  stateDataWL[0].data.forEach(waitlists0 => {
    if (!waitlists0.data) {
      return;
    }
    let decodedDetails = Buffer.from(waitlists0.data, 'base64').toString();
    let organDetails1 = decodedDetails.split(',');
    if (organDetails1[0] == 'Waitlist' && organDetails1[3] == '1') {
      heartWaitlist[counter1] = [waitlists0.address, organDetails1[2], organDetails1[3], organDetails1[4], organDetails1[5]];
      counter1 += 1;
    }
    else {
      console.log("Heart not requested by: " + organDetails1[4] + " or not first in Waitlist!")
    }
  });
  let donorAddressList = [];
  let donorDataList = [];
  let counter2 = 0;
  var today = new Date();
  // Iterating in a loop to get all requested heart donor data if viable
  stateDataDonor[1].data.forEach(async donors0 => {
    if (!donors0.data) {
      return;
    }
    let decodedDetailsDonor = Buffer.from(donors0.data, 'base64').toString();
    let donorDetails = decodedDetailsDonor.split(',');
    var d_dodTest = new Date(donorDetails[11] + ' ' + donorDetails[12] + ':00 GMT+0530');
    var diff = today.getTime() - d_dodTest.getTime();
    var hours = (diff / (1000 * 60 * 60)).toFixed(4);
    console.log("Difference in time (hours): ", hours);
    if (donorDetails[9] == 'Died' && donorDetails[6] == 'Registered' && donorDetails[10] == 'Viable' && hours <= 4.9835) {
      donorAddressList[counter2] = donors0.address;
      donorDataList[counter2] = [donorDetails[0], donorDetails[1], donorDetails[2], donorDetails[3], donorDetails[4], donorDetails[5], donorDetails[6], donorDetails[7], donorDetails[8], donorDetails[9], donorDetails[10], donorDetails[11], donorDetails[12]];
      counter2 += 1;
    }
    else if (hours > 4.9835) {
      console.log("Over 5 hours since Time of Death, Donor Organs not viable. ---- ", donors0.address);
      let donorDataUpdate = [donorDetails[0], donorDetails[1], donorDetails[2], donorDetails[3], donorDetails[4], donorDetails[5], donorDetails[6], donorDetails[7], donorDetails[8], donorDetails[9], 'Not Viable', donorDetails[11], donorDetails[12]];
      // Calling matchFunctions to update Donor organ as 'Not Viable'
      let dUpdate = await doh_client.matchFunctions(donors0.address, donorDataUpdate, h1Key, h2Key, h3Key);
      if (dUpdate == 1) {
        console.log("Donor Heart updated as Not Viable.");
      }
    }
  });
  // Iterating in a loop to check for match for each heart waitlist item, for each blood group, against donor list
  for (let i = 0; i < heartWaitlist.length; i++) {
    let bloodGroup = heartWaitlist[i][1];
    for (let j = 0; j < donorDataList.length; j++) {
      console.log("Checking donor and waitlist matches in for loop Heart");
      let tempWLAddress = heartWaitlist[i][0];
      // Adding matched check for second iteration after first Donor match updated
      if (bloodGroup == donorDataList[j][3] && donorDataList[j][10] != 'Matched') {
        console.log("Donor: " + donorDataList[j][7] + " matched with Patient: " + heartWaitlist[i][3] + " in Waitlist for Heart with bloodgroup: ", bloodGroup);
        let pRegNum = heartWaitlist[i][3];
        let dRegNum = donorDataList[j][7];
        let patientStateHeart = await doh_client.getStatePatientMatched(heartWaitlist[i][4]);
        let decodedPatientDetails = Buffer.from(patientStateHeart.data[0].data, 'base64').toString();
        console.log("DecodedPatientDetails Heart: ", decodedPatientDetails);
        let patientDetails = decodedPatientDetails.split(',');
        patientDetails[10] = 'Matched';
        donorDataList[j][10] = 'Matched';
        console.log("donorDataList[j][10] Heart: ", donorDataList[j][10]);
        // Calling matchFunctions to update patient as 'Matched'
        let p = await doh_client.matchFunctions(patientStateHeart.data[0].address, patientDetails, h1Key, h2Key, h3Key);
        if (p[0] == 1) {
          console.log("Patient updated as matched (Heart)! ", p[0] + " ---- " + p[1]);
        }
        // Calling matchFunctions to update donor as 'Matched'
        let d = await doh_client.matchFunctions(donorAddressList[j], donorDataList[j], h1Key, h2Key, h3Key);
        if (d[0] == 1) {
          console.log("Donor updated as matched (Heart)! ", d[0] + " ---- " + d[1]);
        }
        // Calling deleteState to delete matched waitlist address, and update organ match log
        if (p[0] == 1 && d[0] == 1) {
          console.log("Starting WL address deletion (Heart)!")
          console.log("Deleting WL address: " + tempWLAddress + " !");
          f[2] = await doh_client.deleteFromState(tempWLAddress, dohKey, 'Heart', bloodGroup, pRegNum, dRegNum);
          f[0] = p[0];
          f[1] = d[0];
          // Maxing out j counter to stop looking for Heart matches for this Patient (i)
          j = donorDataList.length;
        }
      }
    }
    // If match found, updating waitlist number for remaining waitlist items for same blood group
    if (f[0] == 1 && f[1] == 1 && f[2] == 1) {
      let wlUpdate = await doh_client.getWaitlistListingBloodGroup('bb', bloodGroup);
      let wlAddress = [];
      let wlPayload = [];
      let wlFlag = 0;
      let counterTest = 0;
      for (let a = 0; a < wlUpdate[0].data.length; a++) {
        let decodedDetails = Buffer.from(wlUpdate[0].data[a].data, 'base64').toString();
        let wlDetails = decodedDetails.split(',');
        if (wlDetails[0] == 'Waitlist' && wlDetails[3] != '1') {
          console.log("Decrementing Heart Waitlist Counters for: " + wlDetails[4] + " !");
          wlAddress[counterTest] = wlUpdate[0].data[a].address;
          wlDetails[3] -= 1;
          wlPayload[counterTest] = wlDetails.toString();
          wlFlag += 1;
          counterTest += 1;
        }
      }
      console.log("wlAddress, wlPayload to update after counter change (Heart): ", wlAddress, wlPayload);
      if (wlFlag != 0) {
        console.log("Updating Waitlist state with updated counters (Heart)!");
        await doh_client.updateWL(wlAddress, wlPayload, dohKey);
      }
      else {
        console.log("Heart Waitlist empty for bloodgroup: " + bloodGroup + "!")
      }
      res.send({ message: 'Checking for Heart matches!' });
    }
    else {
      res.send({ message: 'Checking for Heart matches!' });
    }
  }
});

/* GET waitlistLiver page */
router.get('/waitlistLiver', async (req, res) => {
  try {
    var organ = 'cc';
    console.log("In /waitlistLiver ---------");
    var doh_client = new UserClient();
    let stateData = await doh_client.getWaitlistListing(organ);
    let organList = [];
    // Iterating in a loop to push all liver waitlist data together
    stateData[0].data.forEach(waitlists0 => {
      if (!waitlists0.data) {
        return;
      }
      let decodedDetails = Buffer.from(waitlists0.data, 'base64').toString();
      let organDetails1 = decodedDetails.split(',');
      if (organDetails1[0] != 'NA') {
        organList.push({
          pRegNum: organDetails1[4],
          pBloodGroup: organDetails1[2],
          pLiverCounter: organDetails1[3]
        });
      }
      else {
        console.log("Liver not requested!")
      }
    });
    console.log("Organ List Liver: ", organList);
    if (organList.length >= 1) {
      res.render('waitlistLiver', { title: 'Liver Waitlist', listing: organList });
    }
    else {
      res.render('error', { title: 'Liver Waitlist', message: "Liver Waitlist empty, please register Patients!" });
    }
  }
  catch (err) {
    console.log("Liver not requested, redirecting to Error Page!");
    res.render('error', { title: 'Liver Waitlist', message: "Liver Waitlist empty, please register Patients!" });
  }
});

/* POST waitlistLiver page */
router.post('/waitlistLiver', async function (req, res, next) {
  console.log('In waitlistLiver post ---------');
  var doh_client = new UserClient();
  let stateDataWL = await doh_client.getWaitlistListing(req.body.organ);
  let dohKey = req.body.dohKey;
  let h1Key = req.body.h1Key;
  let h2Key = req.body.h2Key;
  let h3Key = req.body.h3Key;
  let f = [];
  let stateDataDonor = await doh_client.getDonorListing();
  let liverWaitlist = [];
  let counter1 = 0;
  // Iterating in a loop to get all requested liver waitlist data where waitlist number is 1
  stateDataWL[0].data.forEach(waitlists0 => {
    if (!waitlists0.data) {
      return;
    }
    let decodedDetails = Buffer.from(waitlists0.data, 'base64').toString();
    let organDetails1 = decodedDetails.split(',');
    if (organDetails1[0] == 'Waitlist' && organDetails1[3] == '1') {
      liverWaitlist[counter1] = [waitlists0.address, organDetails1[2], organDetails1[3], organDetails1[4], organDetails1[5]];
      counter1 += 1;
    }
    else {
      console.log("Liver not requested by: " + organDetails1[4] + " or not first in Waitlist!")
    }
  });
  let donorAddressList = [];
  let donorDataList = [];
  let counter2 = 0;
  var today = new Date();
  // Iterating in a loop to get all requested liver donor data if viable
  stateDataDonor[2].data.forEach(async donors0 => {
    if (!donors0.data) {
      return;
    }
    let decodedDetailsDonor = Buffer.from(donors0.data, 'base64').toString();
    let donorDetails = decodedDetailsDonor.split(',');
    var d_dodTest = new Date(donorDetails[11] + ' ' + donorDetails[12] + ':00 GMT+0530');
    var diff = today.getTime() - d_dodTest.getTime();
    var hours = (diff / (1000 * 60 * 60)).toFixed(4);
    console.log("Difference in time (hours): ", hours);
    if (donorDetails[9] == 'Died' && donorDetails[6] == 'Registered' && donorDetails[10] == 'Viable' && hours <= 4.9835) {
      donorAddressList[counter2] = donors0.address;
      donorDataList[counter2] = [donorDetails[0], donorDetails[1], donorDetails[2], donorDetails[3], donorDetails[4], donorDetails[5], donorDetails[6], donorDetails[7], donorDetails[8], donorDetails[9], donorDetails[10], donorDetails[11], donorDetails[12]];
      counter2 += 1;
    }
    else if (hours > 4.9835) {
      console.log("Over 5 hours since Time of Death, Donor Organs not viable. ---- ", donors0.address);
      let donorDataUpdate = [donorDetails[0], donorDetails[1], donorDetails[2], donorDetails[3], donorDetails[4], donorDetails[5], donorDetails[6], donorDetails[7], donorDetails[8], donorDetails[9], 'Not Viable', donorDetails[11], donorDetails[12]];
      // Calling matchFunctions to update Donor organ as 'Not Viable'
      let dUpdate = await doh_client.matchFunctions(donors0.address, donorDataUpdate, h1Key, h2Key, h3Key);
      if (dUpdate == 1) {
        console.log("Donor Liver updated as Not Viable.");
      }
    }
  });
  // Iterating in a loop to check for match for each liver waitlist item, for each blood group, against donor list
  for (let i = 0; i < liverWaitlist.length; i++) {
    let bloodGroup = liverWaitlist[i][1];
    for (let j = 0; j < donorDataList.length; j++) {
      console.log("Checking donor and waitlist matches in for loop Liver");
      let tempWLAddress = liverWaitlist[i][0];
      // Adding matched check for second iteration after first Donor match updated
      if (bloodGroup == donorDataList[j][3] && donorDataList[j][10] != 'Matched') {
        console.log("Donor: " + donorDataList[j][7] + " matched with Patient: " + liverWaitlist[i][3] + " in Waitlist for Liver with bloodgroup: ", bloodGroup);
        let pRegNum = liverWaitlist[i][3];
        let dRegNum = donorDataList[j][7];
        let patientStateLiver = await doh_client.getStatePatientMatched(liverWaitlist[i][4]);
        let decodedPatientDetails = Buffer.from(patientStateLiver.data[0].data, 'base64').toString();
        let patientDetails = decodedPatientDetails.split(',');
        patientDetails[10] = 'Matched';
        donorDataList[j][10] = 'Matched';
        // Calling matchFunctions to update patient as 'Matched'
        let p = await doh_client.matchFunctions(patientStateLiver.data[0].address, patientDetails, h1Key, h2Key, h3Key);
        if (p[0] == 1) {
          console.log("Patient updated as matched (Liver)! ", p[0] + " ---- " + p[1]);
        }
        // Calling matchFunctions to update donor as 'Matched'
        let d = await doh_client.matchFunctions(donorAddressList[j], donorDataList[j], h1Key, h2Key, h3Key);
        if (d[0] == 1) {
          console.log("Donor updated as matched (Liver)! ", d[0] + " ---- " + d[1]);
        }
        // Calling deleteState to delete matched waitlist address, and update organ match log
        if (p[0] == 1 && d[0] == 1) {
          console.log("Starting WL address deletion (Liver)!")
          console.log("Deleting WL address: " + tempWLAddress + " !");
          f[2] = await doh_client.deleteFromState(tempWLAddress, dohKey, 'Liver', bloodGroup, pRegNum, dRegNum);
          f[0] = p[0];
          f[1] = d[0];
          // Maxing out j counter to stop looking for Liver matches for this Patient (i)
          j = donorDataList.length;
        }
      }
    }
    // If match found, updating waitlist number for remaining waitlist items for same blood group
    if (f[0] == 1 && f[1] == 1 && f[2] == 1) {
      let wlUpdate = await doh_client.getWaitlistListingBloodGroup('cc', bloodGroup);
      let wlAddress = [];
      let wlPayload = [];
      let wlFlag = 0;
      let counterTest = 0;
      for (let a = 0; a < wlUpdate[0].data.length; a++) {
        let decodedDetails = Buffer.from(wlUpdate[0].data[a].data, 'base64').toString();
        let wlDetails = decodedDetails.split(',');
        if (wlDetails[0] == 'Waitlist' && wlDetails[3] != '1') {
          console.log("Decrementing Liver Waitlist Counters for: " + wlDetails[4] + " !");
          wlAddress[counterTest] = wlUpdate[0].data[a].address;
          wlDetails[3] -= 1;
          wlPayload[counterTest] = wlDetails.toString();
          wlFlag += 1;
          counterTest += 1;
        }
      }
      console.log("wlAddress, wlPayload to update after counter change (Liver): ", wlAddress, wlPayload);
      if (wlFlag != 0) {
        console.log("Updating Waitlist state with updated counters (Liver)!");
        await doh_client.updateWL(wlAddress, wlPayload, dohKey);
      }
      else {
        console.log("Liver Waitlist empty for bloodgroup: " + bloodGroup + "!")
      }
      res.send({ message: 'Checking for Liver matches!' });
    }
    else {
      res.send({ message: 'Checking for Liver matches!' });
    }
  }
});

/* GET listBlocks page */
router.get('/listBlocks', async (req, res) => {
  var blockClient = new UserClient();
  let stateData = await blockClient.getBlocks();
  // batches[1] for patient data, [0] for WL data since waitlist generated second
  let transactionIDs = [];
  // Condition for Patient Registration, since WL generated at same time
  if (stateData.data[0].batches[0].transactions[0].header.family_name != "sawtooth_settings") {
    if (stateData.data[0].batches[0].transactions[0].header.family_name == "DOHTVPM") {
      transactionIDs = stateData.data[0].batches[0].header.transaction_ids;
    }
    else {
      transactionIDs = stateData.data[1].batches[0].header.transaction_ids;
    }
  }
  else {
    console.log("No registration data available!");
  }

  var blockNumbers = stateData.data[0].header.block_num;
  let blockList = [];
  for (let i = 0; i < transactionIDs.length; i++) {
    blockList.push({
      blockNum: blockNumbers,
      transactionID: transactionIDs[i]
    });
  }
  res.render('listBlocks', { title: 'Block List', title2: 'Transaction Receipt', listings: blockList });
});

/* POST txnReceipt page (in iframe) */
router.post('/txnReceipt', async function (req, res, next) {
  var txnClient = new UserClient();
  var txnID = req.body.txnID;
  // Calling getTxnReceipt to get Transaction Receipt data for specified Transaction ID
  let stateData = await txnClient.getTxnReceipt(txnID);
  let txnReceiptDecoded = Buffer.from(stateData.data[0].data[0], 'base64').toString();
  res.send("Decoded Transaction Receipt Data ---- " + txnReceiptDecoded);
});

/* POST batches page */
router.post('/batches', async function (req, res, next) {
  var batchClient = new UserClient();
  var familyName = req.body.familyName;
  console.log("familyName: ", familyName);
  let stateData = await batchClient.getBatches();
  let batchList = [];
  let counter = 0;
  for (let i = 0; i < stateData.data.length; i++) {
      batchList[counter] = stateData.data[i];
      counter += 1;
  }
  res.send(batchList);
});

/* GET listBatches page */
router.get('/listBatches', function (req, res, next) {
  res.render('listBatches', { title: 'Batch List' });
});

/* GET list of Organ Matches */
router.get('/listMatches', async (req, res) => {
  try {
    var organClient = new UserClient();
    let stateData = await organClient.getMatchListing();
    let listData = [];
    let payload = stateData.data[0].data;
    let decodedDetails1 = Buffer.from(payload, 'base64').toString();
    let details1 = decodedDetails1.split(',');
    // Separating each Organ Match log item from decoded payload (each match has 5 items in payload)
    // Getting count of Organ Matches from log
    var c = details1.length / 5;
    var counter = 0;
    for (let i = 0; i < c; i++) {
      listData.push({
        wlAddress: details1[counter],
        organ: details1[counter + 1],
        bloogGroup: details1[counter + 2],
        pRegNum: details1[counter + 3],
        dRegNum: details1[counter + 4]
      });
      counter += 5;
    }
    res.render('listMatches', { title: 'Organ Match Log', listings: listData });
  }
  catch (err) {
    console.log("No Match List items!");
    if (err == "TypeError: Cannot read property 'data' of undefined") {
      res.render('error', { title: 'Organ Match Log', message: "No Organ Matches done yet!" });
    }
    else {
      res.render('error', { title: 'Error Page' });
    }
  }
});

module.exports = router;
