# Design Decisions:

* The **Donor.Me** Sawtooth network consists of a Department of Health in each District (in this case, DOHTVPM for Trivandrum) of the State, and hospitals that are registered within the district (h1, h2, and h3 in this case). For the POC, only Trivandrum district is considered, and only 3 hospitals are being registered in the district.
* Only the registered hospitals in the network can register patients and donors. The same patient / donor cannot be registered again at different hospitals once already registered.
* The family name for registering patients and donors is **DOHTVPM**, and the family name for matching organs is **DOHKERALA** (also used for waitlist addresses and log).
* Patients registered in the same district can only be matched with Donors registered and updated in the same district. This decision was taken for the POC in order to address the issue of transporting donor organs to the recipient hospital within the viability timeframe (set as 5 hours for each organ since time of death for the POC). In a real-world application, there are other factors to consider when determining the viability and transportability of organs.
* For matching patient and donor organs, the only conditions checked are viability of organ at the time of matching, and blood group. In a real-world application for organ donation, multiple conditions are checked for each organ match, which were not implemented in the POC due to time constraints.
* Time of matching is taken as the system time when the user submits the matching request. In real world applications, the time would be taken from block-info transaction family’s timestamp which is considered as network time, instead of taking individual system times. Since there is only one system doing transactions in the network for the POC, the decision was taken to use system time.
* The system handles organ donations and requests for Kidney, Heart, and Liver. The decision was taken to limit to three organs due to time constraints when developing the project. A patient can request a minimum of one of these organs at the time of registration, and a maximum of all three. Patient cannot be edited once registered, their choice made at the time of registration is final. Also, once a match has been found for a registered organ, the patient cannot request the organ again.
* The keys required for transactions are generated in the Client bash (given in the DockerFile). In order to provide access to the Client key .priv and .pub files to the Validator container (instead of giving the keys directly) while setting policies and roles, volume access is given and key mapping done in the Validator in YAML file. This is not a best practice in real world applications, and has been done only for the POC, to reduce the number of steps involved while setting permissions.
* The application has been tested primarily in Google Chrome. When using in Mozilla Firefox, an issue was identified where the time captured from the UI was stored in a different format when compared to Chrome, which impacted the time conditions in the application. Due to time constraints, further testing was not possible to ensure compatibility with all browsers.

## Registration Process:

### Patient:
When a patient is registered, three addresses are generated for them (one for each organ).

***Patient Address Scheme (3 per patient):***

First six characters sliced from hash of family name (DOHTVPM) + ‘00’ (to mark as Patient) + ‘aa’ or ‘bb’ or ‘cc’ (to denote Kidney, Heart or Liver respectively) + first 12 characters sliced from hash of blood group + first 24 characters sliced from hash of patient Aadhaar number + first 24 characters sliced from hash of hospital key. The only distinguishing factor in the three addresses for the patient are the 2 characters representing the organ. The hash function uses SHA512.

***Reasons for choosing Address Scheme:***

A patient can be registered only once in the network, and there cannot be multiple entries for the same patient from different hospitals. To ensure this, when a new patient is being registered, the entire network is checked for existing patient records using Patient’s temporary addresses created for all Hospitals (h1, h2, h3). If a record exists, an alert is provided to the user that patient already exists. The patient address scheme was designed using the Aadhaar number (unique for an individual), blood group, and hospital key (to identify which hospital registered the patient) to enable verification in this manner. Three addresses are created for each Patient so that matching can be done individually for each organ, for example, if the patient has requested Kidney and Heart, and a match is found only for Kidney, only the Kidney address will be updated as matched, and the Heart address will be updated only when a match is found in the future.

At the time of Patient registration, events are generated. Event filters are used for filtering Patient Registration events. Transaction Receipts are generated at the time of registration.

A waitlist address is only generated for each organ the patient has requested (for eg: if the patient has requested Kidney and Liver, waitlist addresses are created for Kidney and Liver, but not for Heart) & only if the patient registration is completed successfully (validated using Patient Registration event).

***Waitlist Address Scheme (for each organ requested):***

First six characters sliced from hash of family name (DOHKERALA) + first 24 characters sliced from hash of department key (dohtvpm) + ‘aaaa’ or ‘bbbb’ or ‘cccc’ (to denote Kidney, Heart or Liver respectively) + first 12 characters sliced from hash of blood group + first 24 characters sliced from hash of patient Aadhaar number. The only distinguishing factor in the three addresses for the waitlist are the 4 characters representing the organ. The hash function uses SHA512.

***Reasons for choosing Address Scheme:***

A waitlist address is only generated for each organ the patient has requested (for eg: if the patient has requested Kidney and Liver, waitlist addresses are created for Kidney and Liver, but not for Heart) & only if the patient registration is completed successfully (validated using Patient Registration event). The waitlist address scheme was designed using the Aadhaar number (unique for an individual, hence can identify each Patient), blood group (to identify organ requests for each blood group), and organ choice (to maintain separate waitlists for each organ). The waitlist number (added in the payload) is determined by the number of requests for the same organ and blood group that are already registered in the system, which is possible because of the chosen address scheme.

If there are no other patients with same blood group who have registered for the same organ, the waitlist number is assigned as 1 in the payload (top of the list), else the waitlist number is the total number of matching organ requests + 1.

### Donor:
When a donor is registered, three addresses are generated for them (one for each organ).

***Donor Address Scheme (3 per donor):***
First six characters sliced from hash of family name (DOHTVPM) + ‘11’ (to mark as Donor) + ‘aa’ or ‘bb’ or ‘cc’ (to denote Kidney, Heart or Liver respectively) + first 12 characters sliced from hash of blood group + first 24 characters sliced from hash of donor Aadhaar number + first 24 characters sliced from hash of hospital key. The only distinguishing factor in the three addresses for the donor are the 2 characters representing the organ. The hash function uses SHA512.

***Reason for choosing Address Scheme:***

A donor can be registered only once in the network, and there cannot be multiple entries for the same donor from different hospitals. To ensure this, when a new donor is being registered, the entire network is checked for existing donor records using Donor’s temporary addresses created for all Hospitals (h1, h2, h3). If a record exists, an alert is provided to the user that donor already exists. The donor address scheme was designed using the Aadhaar number (unique for an individual), blood group, and hospital key (to identify which hospital registered the donor) to enable verification in this manner. Three addresses are created for each Donor so that matching can be done individually for each organ, for example, if the Donor has registered Kidney and Liver, and a match is found only for Kidney, only the Kidney address will be updated as matched, and the Liver address will be updated only when a match is found in the future.

A donor can register a minimum of one of the organs (Kidney, Heart, or Liver) or a maximum of all three. The donor’s choice of registered organs cannot be changed after registration. If the donor has not registered an organ (for eg: Kidney), that organ status is marked as ‘Not Viable’ as default, as that organ won’t be available for matching.

At the time of Donor registration, events are generated. Event filters are used for filtering Donor Registration events. Transaction Receipts are generated at the time of registration.

## Updation Process:

The donor details are searched using the Donor registration number and blood group. If the donor doesn’t exist, an error page is shown to the user. Else, the user can update the Date & Time of death of the donor, and the viability of each registered organ. The donor organ is viable for matching 5 hours from the time of death. If the donor is updated over 5 hours from the time of death, all registered organs are marked as ‘Not Viable’ at that point. Else, it is updated as ‘Viable. The status of organ can be updated only for registered organs.

At the time of Donor updation, events are generated. Transaction Receipts are generated at the time of updation.

## Matching Process:

If the donor organ is viable at the time of updation (less than 5 hours since time of death), but when the matching occurs, the time since death has crossed 5 hours, that organ is marked as ‘Not Viable’.

When the organ matching is done (from each organ Waitlist page), the patients with waitlist number 1 are matched against registered donors whose blood group match and organs are viable at the time. Once the match has been identified, the patient and donor details are updated as matched, the waitlist address for that organ is deleted, an entry is created in the Organ Match log, and then remaining patients’ waitlist numbers (of that blood group) are decremented by 1, so that the patient who was previously waitlist number 2 would become top of the list now.

***Organ Match Address Scheme (single address):***

First six characters sliced from hash of family name (DOHKERALA) + first six characters sliced from hash of family name (DOHTVPM) + first 58 characters sliced from hash of the word “deletedStates”. The hash function uses SHA512.

***Reason for choosing Address Scheme:***

The organ match log address is created to maintain a log of all the match transactions performed in the Trivandrum district. Hence the address contains the hash of the family name DOHTVPM. This can be used to distinguish match transactions performed in each district in the state.

Transaction Receipts are generated at the time of matching.

