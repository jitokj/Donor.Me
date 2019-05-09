/**
 * Function to login to the DonorMe system.
 * 
 * The login() function checks whether the user has the required permission to login to the DonorMe system,
 * and redirects users to respective pages based on login ID.
 * @param {*} event 
 */
function login(event) {
    event.preventDefault();
    const loginID = document.getElementById('loginID').value;
    // Validation for login field.
    if (loginID.length === 0 || loginID == "") {
        alert('Please provide a valid loginID!');
    }
    else {
        $.post('/', { loginCred: loginID }, (data, textStatus, jqXHR) => {
            if (data.done == 2) {
                console.log("Department of Health not registered!");
                alert(data.message);
                window.location.href = '/';
            }
            else if (data.done == 1) {
                sessionStorage.clear();
                sessionStorage.setItem("LoginCred", data.loginCred);
                sessionStorage.setItem("LoginKey", data.loginKey);
                sessionStorage.setItem("DohKey", data.dohKey);
                sessionStorage.setItem("H1Key", data.h1Key);
                sessionStorage.setItem("H2Key", data.h2Key);
                sessionStorage.setItem("H3Key", data.h3Key);
                // Adding a delay before redirecting to pages
                // to allow sessionStorage to finish execution
                setTimeout(null, 101);
                // Redirect to /home if login ID is dohtvpm
                if (data.loginCred == "dohtvpm") {
                    alert(data.message);
                    window.location.href = '/home';
                }
                // Redirect to /registerPatient if login ID is h1, h2,or h3
                else {
                    alert(data.message);
                    window.location.href = '/registerPatient';
                }
            }
            // Informs the user that only h1, h2 & h3 are registered hospitals in the network
            else if (data.done == 0) {
                alert(data.message);
                window.location.href = '/';
            }
        }, 'json');
    }
}

/**
 * Function to logout of the current session.
 * 
 * Logs the user out of their current session, clears session storage, and redirects to login page ('/').
 */
function logout() {
    sessionStorage.clear();
    window.location.href = '/';
}

/**
 * Function to register new Patients through a Hospital login.
 * 
 * Captures Patient details from the UI, provides validation for the input fields, and starts the registration
 * process.
 * @param {*} event 
 */
function registerPatient(event) {
    console.log("Registering Patient ---------------");
    event.preventDefault();
    const doh_key = sessionStorage.getItem('DohKey');
    const h_key = sessionStorage.getItem('LoginKey');
    const h1_key = sessionStorage.getItem('H1Key');
    const h2_key = sessionStorage.getItem('H2Key');
    const h3_key = sessionStorage.getItem('H3Key');
    const p_aadhaar = document.getElementById('p_aadhaar').value;
    const p_name = document.getElementById('patientName').value;
    const p_contact = document.getElementById('p_contactNo').value;
    const p_bloodGroup_choice = document.getElementById('p_bloodGroup').value;
    const p_dob = document.getElementById('p_dob').value;
    const p_regDate = document.getElementById('p_regDate').value;
    const p_kidney = document.getElementById('customCheck1').checked;
    const p_heart = document.getElementById('customCheck2').checked;
    const p_liver = document.getElementById('customCheck3').checked;
    var today = new Date();
    var regDateTest = new Date(p_regDate + ' 00:00:00 GMT+0530');
    var dobTest = new Date(p_dob + ' 00:00:00 GMT+0530');
    if (p_kidney == false && p_heart == false && p_liver == false) {
        alert("Cannot register Patient without choosing 1 or more organs!");
    }
    else if (p_aadhaar == '' || p_name == '' || p_contact == '' || p_aadhaar == null || p_name == null || p_contact == null) {
        alert("Please provide valid Patient information!");
    }
    else if (p_dob == null || p_dob == '' || p_regDate == null || p_regDate == '') {
        alert("Please choose valid dates!");
    }
    else if (p_bloodGroup_choice == 'Choose Blood Group') {
        alert("Please choose Blood Group for Patient!");
    }
    else if (regDateTest.getTime() > today.getTime() || dobTest.getTime() > today.getTime()) {
        alert("DOB & Registration Date cannot be greater than current date!");
    }
    else if (dobTest.getTime() > regDateTest.getTime()) {
        alert("DOB cannot be greater than Registration Date!");
    }
    else {
        $.post('/registerPatient', {
            dohKey: doh_key,
            hKey: h_key,
            h1_key: h1_key,
            h2_key: h2_key,
            h3_key: h3_key,
            pAadhaar: p_aadhaar,
            pName: p_name,
            pContactDetails: p_contact,
            pBloodGroup: p_bloodGroup_choice,
            pDOB: p_dob,
            pDOR: p_regDate,
            pKidney: p_kidney,
            pHeart: p_heart,
            pLiver: p_liver
        }, (data) => {
            alert(data.message);
            window.location.href = '/registerPatient';
        }, 'json');
    }
}

/**
 * Function to register new Donors through a Hospital login.
 * 
 * Captures Donor details from the UI, provides validation for the input fields, and starts the registration
 * process.
 * @param {*} event 
 */
function registerDonor(event) {
    console.log("Registering Donor ------------");
    event.preventDefault();
    const doh_key = sessionStorage.getItem('DohKey');
    const h_key = sessionStorage.getItem('LoginKey');
    const h1_key = sessionStorage.getItem('H1Key');
    const h2_key = sessionStorage.getItem('H2Key');
    const h3_key = sessionStorage.getItem('H3Key');
    const d_aadhaar = document.getElementById('d_aadhaar').value;
    const d_name = document.getElementById('donorName').value;
    const d_contact = document.getElementById('d_contactNo').value;
    const d_bloodGroup_choice = document.getElementById('d_bloodGroup').value;
    const d_dob = document.getElementById('d_dob').value;
    const d_regDate = document.getElementById('d_regDate').value;
    const d_kidney = document.getElementById('customCheck1').checked;
    const d_heart = document.getElementById('customCheck2').checked;
    const d_liver = document.getElementById('customCheck3').checked;
    var today = new Date();
    var regDateTest = new Date(d_regDate + ' 00:00:00 GMT+0530');
    var dobTest = new Date(d_dob + ' 00:00:00 GMT+0530');
    if (d_kidney == false && d_heart == false && d_liver == false) {
        alert("Cannot register Donor without choosing 1 or more organs!");
    }
    else if (d_aadhaar == '' || d_name == '' || d_contact == '' || d_aadhaar == null || d_name == null || d_contact == null) {
        alert("Please provide valid Donor information!");
    }
    else if (d_dob == null || d_dob == '' || d_regDate == null || d_regDate == '') {
        alert("Please choose valid dates!");
    }
    else if (d_bloodGroup_choice == 'Choose Blood Group') {
        alert("Please choose Blood Group for Donor!");
    }
    else if (regDateTest.getTime() > today.getTime() || dobTest.getTime() > today.getTime()) {
        alert("DOB & Registration Date cannot be greater than current date!");
    }
    else if (dobTest.getTime() > regDateTest.getTime()) {
        alert("DOB cannot be greater than Registration Date !");
    }
    else {
        $.post('/registerDonor', {
            dohKey: doh_key,
            hKey: h_key,
            h1_key: h1_key,
            h2_key: h2_key,
            h3_key: h3_key,
            dAadhaar: d_aadhaar,
            dName: d_name,
            dContactDetails: d_contact,
            dBloodGroup: d_bloodGroup_choice,
            dDOB: d_dob,
            dDOR: d_regDate,
            dKidney: d_kidney,
            dHeart: d_heart,
            dLiver: d_liver
        }, (data) => {
            alert(data.message);
            window.location.href = '/registerDonor';
        }, 'json');
    }
}

/**
 * Function to edit or update Donors through a Hospital login.
 * 
 * Permits user to search for registered Donor from the UI, and edit/update the Donor details,
 * while providing validation for the input fields, and sends data for the update process to start.
 * If the Donor update is over 5 hours from Time of Death, all the Donor organs are marked as 'Not Viable'.
 * Also, if the Donor has not chosen to donate an organ, that organ is marked as 'Not Viable' by default.
 * @param {*} event 
 */
function editDonor(event) {
    console.log("Updating Donor -----------");
    event.preventDefault();
    const doh_key = sessionStorage.getItem('DohKey');
    const h_key = sessionStorage.getItem('LoginKey');
    const h1_key = sessionStorage.getItem('H1Key');
    const h2_key = sessionStorage.getItem('H2Key');
    const h3_key = sessionStorage.getItem('H3Key');
    const d_regNum = document.getElementById('dRegNum1').value;
    const d_name = document.getElementById('dName').value;
    const d_contact = document.getElementById('contactNo').value;
    const d_bloodGroup_choice = document.getElementById('dBloodGroup1').value;
    const d_dob = document.getElementById('dob').value;
    const d_regDate = document.getElementById('regDate').value;
    const d_dod = document.getElementById('dod').value;
    const d_tod = document.getElementById('tod').value;
    const d_kidneyChoice = document.getElementById('dKidneyChoice').value;
    const d_heartChoice = document.getElementById('dHeartChoice').value;
    const d_liverChoice = document.getElementById('dLiverChoice').value;
    const hKeyHash = document.getElementById('dHKeyHash').value;
    let d_kidneyStatus = '', d_heartStatus = '', d_LiverStatus = '';
    var today = new Date();
    var d_dodTest = new Date(d_dod + ' ' + d_tod + ':00 GMT+0530');
    var regDateTest = new Date(d_regDate + ' 00:00:00 GMT+0530');
    var d_dodTestDate = new Date(d_dob + ' 00:00:00 GMT+0530');
    var diff = today.getTime() - d_dodTest.getTime();
    var hours = (diff / (1000 * 60 * 60)).toFixed(4);
    console.log("Difference in time (hours): ", hours);
    if (d_name == '' || d_name == null) {
        alert("Please search for Donor using Registration Number & Blood Group!");
    }
    else if (d_dod == null || d_dod == '' || d_tod == null || d_tod == '') {
        alert("Please choose valid date and/or time!");
    }
    else if (d_dodTestDate.getTime() > today.getTime()) {
        alert("DOD cannot be greater than current date!");
    }
    else if (d_dodTest.getTime() > today.getTime()) {
        alert("TOD cannot be greater than current time!");
    }
    else if (regDateTest.getTime() > d_dodTest.getTime()) {
        alert("Registration Date cannot be greater than TOD & DOD!");
    }
    else {
        if (d_kidneyChoice == 'NA' || hours > 4.9835) {
            d_kidneyStatus = 'Not Viable';
        }
        else {
            d_kidneyStatus = document.getElementById('dKidneyStatus').value;
        }
        if (d_heartChoice == 'NA' || hours > 4.9835) {
            d_heartStatus = 'Not Viable';
        }
        else {
            d_heartStatus = document.getElementById('dHeartStatus').value;
        }
        if (d_liverChoice == 'NA' || hours > 4.9835) {
            d_LiverStatus = 'Not Viable';
        }
        else {
            d_LiverStatus = document.getElementById('dLiverStatus').value;
        }
        $.post('/post1', {
            dohKey: doh_key,
            hKey: h_key,
            h1_key: h1_key,
            h2_key: h2_key,
            h3_key: h3_key,
            dRegNum: d_regNum,
            dName: d_name,
            dContactDetails: d_contact,
            dBloodGroup: d_bloodGroup_choice,
            dDod: d_dod,
            dTod: d_tod,
            dDOB: d_dob,
            dDOR: d_regDate,
            dKidneyChoice: d_kidneyChoice,
            dKidneyStatus: d_kidneyStatus,
            dHeartChoice: d_heartChoice,
            dHeartStatus: d_heartStatus,
            dLiverChoice: d_liverChoice,
            dLiverStatus: d_LiverStatus,
            dHKeyHash: hKeyHash
        }, (data) => {
            alert(data.message);
            window.location.href = '/editDonor';
        }, 'json');
    }
}

/**
 * Function to check for matching Donor organ, based on the organ data requested.
 * 
 * Function checks whether a Donor organ is available, and starts the organ match process.
 * @param {string} organ 
 */
function checkWaitlistMatch(organ) {
    console.log("Checking for availability of matching " + organ + " in Donor List!");
    const doh_key = sessionStorage.getItem('DohKey');
    const h1_key = sessionStorage.getItem('H1Key');
    const h2_key = sessionStorage.getItem('H2Key');
    const h3_key = sessionStorage.getItem('H3Key');
    if (organ === 'Kidney') {
        $.post('/waitlistKidney', {
            dohKey: doh_key,
            h1Key: h1_key,
            h2Key: h2_key,
            h3Key: h3_key,
            organ: 'aa'
        }, (data) => {
            alert(data.message);
            window.location.href = '/waitlistKidney';
        }, 'json');
    }
    else if (organ === 'Heart') {
        $.post('/waitlistHeart', {
            dohKey: doh_key,
            h1Key: h1_key,
            h2Key: h2_key,
            h3Key: h3_key,
            organ: 'bb'
        }, (data) => {
            alert(data.message);
            window.location.href = '/waitlistHeart';
        }, 'json');
    }
    else if (organ === 'Liver') {
        $.post('/waitlistLiver', {
            dohKey: doh_key,
            h1Key: h1_key,
            h2Key: h2_key,
            h3Key: h3_key,
            organ: 'cc'
        }, (data) => {
            alert(data.message);
            window.location.href = '/waitlistLiver';
        }, 'json');
    }
}

/**
 * Checks whether the current location is '/registerDonor', and starts listening for
 * a registration event.
 */
if (location.pathname == '/registerDonor') {
    var socket = io('http://localhost:3000');
    var x = 0;
    socket.on('Registration-Event', () => {
        console.log("Socket Message Received!");
        registrationEvent(x, 'Donor');
        x += 1;
    });
}
/**
 * Checks whether the current location is '/registerPatient', and starts listening for
 * a registration event.
 */
else if (location.pathname == '/registerPatient') {
    var socket = io('http://localhost:3000');
    var y = 0;
    socket.on('Registration-Event', () => {
        console.log("Socket Message Received!");
        registrationEvent(y, 'Patient');
        y += 1;
    });
}

/**
 * Function to send a user alert for Registration event once to the UI.
 */
function registrationEvent(x, action) {
    if (x == 0 && action == 'Donor') {
        alert("Donor Registration Event occured successfully!");
    }
    else if (x == 0 && action == 'Patient') {
        alert("Patient Registration Event occured successfully!");
    }
}