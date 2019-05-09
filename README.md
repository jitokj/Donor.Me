<p align="right">
  <img src="donorme/client/public/images/sawtooth_logo_light_blue-small.png" width="230" height="50">
</p>

# Donor.Me 
##### *A blockchain-based Organ Donation & Matching System*



## Overview
   The Kerala Government has an initiative (KNOS - Mrithasanjeevani) established in August, 2012 to maintain records of patients waiting for organ transplants, and for citizens to register as potential organ donors. This initiative is targeted to resolve the ethical and legal issues surrounding live and deceased organ transplantation. 
   
   The proposed solution (Donor.Me) is a blockchain network, created by the Government of Kerala's Department of Health. Hospitals that are approved for organ transplant are registered in the network by each District's Department of Health, and the hospitals are permitted to register patients who are awaiting transplant, and donors who are willing to donate one or more organs. These hospitals can also update the donor's status and viability of donated organs at the donor's time of death. Patients that are registered are added into organ waitlists, and allocated waitlist numbers based on their blood group and the number of pending organ requests. The Department of Health (District) can check for matching organ donations for the patients with waitlist number 1 in their respective blood groups, and matches the patient details with donor details, removes the patient from the waitlist, and moves the other remaining patients up the waitlist. The Department can view the historical log of all the matches made in the Donor.Me system.


## Description
   Donor.Me is a proof-of-concept for organ donation and matching that has been implemented on Hyperledger Sawtooth. For a system that handles patient records, security of the information being stores is a necessity, and the system needs to be transparent and auditable (at a higher-level). It is also imperative that the records are reliable, and that there is no chance for replicating data or identity fraud. There cannot be any middle-men or third-parties who can bypass the system and procure or sell organs to patients.
   
   Blockchain networks address these issues by providing distributed ledgers that are immutable in nature, and control the user access to the network. The distributed ledgers ensure that the data cannot be manipulated by any of the parties involved, as each participant of the network has a copy of the database, and there is a protocol (consensus) that ensures that there is an agreement regarding the state of the ledger.
   
   Hyperledger Sawtooth, being an open-source business blockchain, is suitable for this scenario. The network being Byzantine Fault-tolerant, ensures that the network is kept up and running even if a node is not online or is disconnected. The permissioning (policies and roles) in Sawtooth ensures that there is control over who is allowed to do what kind of transactions.

## Components

1. **Client**: The client application is developed using Express & Node.js, with Handlebars templates for the web pages.
2. **Transaction Processors**: The Donor.Me system consists of two Transactions Processors (one for each Family, DOHKERALA and DOHTVPM).  The transactions processors are  developed in Javascript. 

## Users

1. **Department of Health**: The Department of Health (using login ‘dohtvpm’), can view all the Patients awaiting organ donations, check for matching donor organs, and view the log of all organ matches completed in the Donor.Me system.
2. **Hospitals**: The registered hospitals in the Trivandrum network are ‘h1’, ‘h2’, ‘h3’. The hospitals can register Patients and Donors, update Donors, and view Patient Lists, Donor Lists, Block Lists, search for Transaction Receipts, and view Batch Lists.

### System requirements:

1. Operating system: Ubuntu 16.04
2. System RAM: 4 GB or above (recommended 8 GB)
3. Free System storage: 4 GB on /home

### Installation prequisites:

1. Ensure that NodeJS (version 8.15 ideally) is installed in the system. For more information about NodeJS, go to https://nodejs.org. To check if installed, open a terminal window:

   ```$ node -v```
2. If NodeJS is not installed, go to https://nodejs.org and download the compatible version (version 8.15) based on system OS, or in a terminal window:

   ```$ sudo apt-get install -y nodejs```
3. Ensure that Docker is installed. Docker is a platform for developers and system administrators to develop, ship, and run applications. For more information, go to https://www.docker.com/resources/what-container. To check if installed, in terminal window:

    ```$ sudo docker --version```
4. If Docker is not installed, in terminal window:

    **Set up the repository**
*   Update the apt package index:

    ```$ sudo apt-get update```
*   Install packages to allow apt to use a repository over HTTPS:

    ```
    $ sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
    ```
*   Add Docker’s official GPG key:

    ```$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -```
*   Use the following command to set up the stable repository.
    ```
    $ sudo add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) \
    stable"
    ```
    **Install Docker CE**
*   Update the apt package index.

    ```$ sudo apt-get update```
*   Install the latest version of Docker CE.

    ```$ sudo apt-get install docker-ce```
*   Verify that Docker CE is installed correctly by running the hello-world image.

    ```$ sudo docker run hello-world```
    
   This command downloads a test image and runs it in a container. When the container runs, it prints an informational message and exits.
   
5. Ensure that Docker Compose is installed. Compose is a tool for defining and running multi-container Docker applications. To check if installed, in terminal window:

   ```$ sudo docker-compose --version```
6. If Docker Compose is not installed, in terminal window:

   ```
   $ sudo apt-get update
   $ sudo apt-get install docker-compose
   ```

### Installation/Set-up instructions:

1. Run the project YAML file using Docker Compose (docker-compose.yaml in donorme folder). Open a terminal window in the project folder:

   ```$ sudo docker-compose up```
2. Compose pulls and builds an image for the code, and starts the services defined in it. In the client dockerfile, it is specified to create all the department and hospitals keys required for making transactions in the network. Permissions need to be set for these keys to restrict their actions. 
3. Open validator bash shell to set the permissions for the network. In another terminal window in the project folder (CTRL+SHIFT+T when in terminal):

   ```$ sudo docker exec -it validator bash```
4. Copy the below commands to create a proposal, create two policies and assign roles to the keys generated for the two policies. Paste the below code completely in the validator bash (ensure all the 5 instances of rest-api port are 8008 in the code when pasting in bash shell):

   ```
   sawset proposal create --key  ~/.sawtooth/keys/my_key.priv  sawtooth.identity.allowed_keys=$(cat ~/.sawtooth/keys/my_key.pub) --url http://rest-api:8008 && sawtooth identity policy create --key /root/.sawtooth/keys/my_key.priv policy_dohtvpm "PERMIT_KEY $(cat /root/.sawtooth/keys/my_key.pub)" "PERMIT_KEY $(cat /root/.sawtooth/keys/h1.pub)" "PERMIT_KEY $(cat /root/.sawtooth/keys/h2.pub)" "PERMIT_KEY $(cat /root/.sawtooth/keys/h3.pub) " --url http://rest-api:8008 && sawtooth identity role create --key ~/.sawtooth/keys/my_key.priv transactor.transaction_signer.DOHTVPM policy_dohtvpm --url http://rest-api:8008 && sawtooth identity policy create --key ~/.sawtooth/keys/my_key.priv policy_dohkerala "PERMIT_KEY $(cat /root/.sawtooth/keys/my_key.pub)" "PERMIT_KEY $(cat /root/.sawtooth/keys/dohtvpm.pub)" --url http://rest-api:8008 && sawtooth identity role create --key ~/.sawtooth/keys/my_key.priv transactor.transaction_signer.DOHKERALA policy_dohkerala --url http://rest-api:8008
   ```
5. If there are issues copying and runnning the above command, please run the below commands (6 to 10) one-by-one in validator bash (ensure all the 5 instances of rest-api port are 8008 in the code when pasting in bash shell). If step 4 worked without issues, please move on to step 11.
6. Creating proposal. In validator bash:

   ```
   sawset proposal create --key  ~/.sawtooth/keys/my_key.priv  sawtooth.identity.allowed_keys=$(cat ~/.sawtooth/keys/my_key.pub) --url http://rest-api:8008
   ```
7. Creating policy for DOHTVPM family. In validator bash:

   ```
   sawtooth identity policy create --key /root/.sawtooth/keys/my_key.priv policy_dohtvpm "PERMIT_KEY $(cat /root/.sawtooth/keys/my_key.pub)" "PERMIT_KEY $(cat /root/.sawtooth/keys/h1.pub)" "PERMIT_KEY $(cat /root/.sawtooth/keys/h2.pub)" "PERMIT_KEY $(cat /root/.sawtooth/keys/h3.pub) " --url http://rest-api:8008
   ```
8. Creating role for policy_dohtvpm. In validator bash:

   ```
   sawtooth identity role create --key ~/.sawtooth/keys/my_key.priv transactor.transaction_signer.DOHTVPM policy_dohtvpm --url http://rest-api:8008
   ```
9. Creating policy for DOHKERALA family. In validator bash:

   ```
   sawtooth identity policy create --key ~/.sawtooth/keys/my_key.priv policy_dohkerala "PERMIT_KEY $(cat /root/.sawtooth/keys/my_key.pub)" "PERMIT_KEY $(cat /root/.sawtooth/keys/dohtvpm.pub)" --url http://rest-api:8008
   ```
10. Creating role for policy_dohkerala. In validator bash:

   ```
   sawtooth identity role create --key ~/.sawtooth/keys/my_key.priv transactor.transaction_signer.DOHKERALA policy_dohkerala --url http://rest-api:8008
   ```
11. Open a browser window in Google Chrome. Go to https://localhost:3000
12. To terminate the app execution, go to the terminal window (where docker-compose is running) and give CTRL+C
13. Wait for docker-compose to gracefully stop. Then:

    ```$ sudo docker-compose down```
14. After docker-compose down and all the containers have been removed, run the below command to remove the volumes created so that Validator has access to Client keys (IMPORTANT - to avoid issues when running the project again):

    ```$ sudo docker volume rm $(sudo docker volume ls)```


### Project conditions:

* The registered hospital login IDs are '**h1**', '**h2**', and '**h3**' and the Department of Health login ID is '**dohtvpm**' (keys are generated via DockerFile, all login IDs are in lower case).
* Only the registered hospitals are permitted to create Patients, Donors, and edit Donor details.
* When a patient is being registered, only if the Patient Registration event is triggered, waitlist addresses are generated for the requested organs.
* Once the donor has been updated as 'Died', the organs are viable for 5 hours from Time of Death (marked as 'Not Viable' by default if Time of Death is greater that 5 hours at the time of updation). 
* If matching is done within 5 hours, the donor and patient are updated as matched, the patient waitlist address is deleted, and remaining waitlist numbers are updated to reflect the updated waitlist. To match organs, login as Department of Health, '**dohtvpm**'.



##### Created by: 
###### Github: jitokj anoopev lakshmi11rv
###### GitLab: @jitokj @anoopv @Lakshmi_Ravindranath
