Supply Chain Management DApp - Setup and Testing Guide
This guide provides step-by-step instructions to set up the development environment, deploy the smart contract, run the React application, and test the Supply Chain Management DApp.

Table of Contents
Prerequisites
Project Setup
Smart Contract Deployment
Using Remix IDE
Frontend Configuration
Running the Application
Testing the DApp
Troubleshooting
Additional Notes
Prerequisites
Before starting, ensure that you have the following software installed on your machine:

Node.js (version 14 or higher)
npm (Node Package Manager, comes with Node.js)
Git (for cloning the repository)
Ganache (for running a local Ethereum blockchain)
MetaMask extension installed in your web browser (Chrome, Firefox, etc.)
Project Setup
1. Clone the Repository
Open your terminal and clone the repository:

```bash
git clone https://github.com/TheHosh/Supply-Chain-196D
```
2. Navigate to the Project Directory
```bash
cd supply-chain-dapp
```
3. Install Dependencies
Install the required Node.js packages:
```bash
npm install
```
This command installs all the dependencies listed in package.json, including React and ethers.js.

Smart Contract Deployment
You have two options for compiling and deploying the smart contract: using Truffle or using Remix IDE.

Using Remix IDE
<details> <summary>Click to expand instructions for using Remix IDE</summary>

1. Start Ganache
Ensure that Ganache is running:

Open Ganache and start a new workspace or use an existing one.
Note the RPC Server address (e.g., HTTP://127.0.0.1:7545).
2. Open Remix IDE
Go to Remix IDE in your web browser.
3. Connect Remix to Ganache
In Remix, click on the "Deploy & Run Transactions" tab on the left sidebar (represented by a Ethereum logo).
Under Environment, select "Web3 Provider".
A prompt will appear asking for the Web3 provider endpoint.
Enter the Ganache RPC server address (e.g., http://127.0.0.1:7545) and click OK.
4. Import the Smart Contract
In Remix's File Explorer, create a new file named SupplyChainManagement.sol.
Copy and paste your smart contract code into this file.
5. Compile the Smart Contract
Click on the "Solidity Compiler" tab on the left sidebar (represented by a gavel icon).
Ensure the compiler version matches the version specified in your smart contract (e.g., 0.8.0).
Click on the Advanced Configurations and make sure to set the EVM Version to London.
Click Compile SupplyChainManagement.sol.
6. Deploy the Smart Contract
Go back to the "Deploy & Run Transactions" tab.
Under Contract, ensure SupplyChainManagement is selected.
Click Deploy.
The contract will be deployed to the Ganache blockchain.
After deployment, the deployed contract will appear under Deployed Contracts.
Expand the deployed contract, and you'll find the contract address.
7. Retrieve the Contract ABI and Update the ABI

Click on the "Solidity Compiler" tab.
At the bottom of the Solodity Compiler tab, you will see a copy action for copying the ABI.
Click on the ABI button to copy the ABI.
Paste the ABI over the contents of the JSON file named SupplyChainManagement.json in your React app's src/contracts directory.

8. Update the Contract Address in the React App
In your React application's src directory:

Update Contract Address:

In App.js, replace the contract address with the one obtained from the deployment step:


```plaintext
// Replace with your deployed contract address
const contractAddress = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```
Frontend Configuration
1. Configure MetaMask
Add Localhost Network:
Open MetaMask.
Click on the network dropdown and select Custom RPC or Add Network.
Configure the network as follows:
Network Name: Localhost 7545 (or any name you prefer)
New RPC URL: http://127.0.0.1:7545 (use the same port as Ganache)
Chain ID: 1337 (or 5777 for Ganache GUI; check Ganache settings)
Currency Symbol: ETH
Block Explorer URL: Leave blank
Import Accounts from Ganache:
In Ganache, view the accounts and their private keys.
In MetaMask, click on the account icon and select Import Account.
Paste the private key of the first account.
Repeat for additional accounts as needed.
Note: Be cautious with private keys and only use them in a development environment.

2. Multiple Accounts for Transit Stations
Explanation:

Why Multiple Accounts Are Needed:

In the supply chain DApp, shipments pass through multiple transit stations.
Each transit station is represented by an Ethereum address (account).
To simulate different stations, you need to have multiple accounts in MetaMask corresponding to the transit station addresses specified when creating a shipment.
This allows you to switch between accounts in MetaMask to perform actions as different stations (e.g., progressing the shipment).
Importing Multiple Accounts:

Import at least as many accounts from Ganache into MetaMask as there are transit stations in your test shipment.
This will enable you to act as each station by switching accounts in MetaMask.
Example:

If your shipment has three transit stations, import three different accounts from Ganache into MetaMask.
Assign each account to a station (e.g., Account 1 = Station 1, Account 2 = Station 2).
Running the Application
1. Start the React Application
In the project directory, run:

```bash
npm start
```
This command starts the React development server. Open http://localhost:3000 to view the app in your browser.

2. Connect MetaMask to the Application
When you open the application, MetaMask may prompt you to connect. Ensure you select the correct account.

Testing the DApp
You can now test the various functionalities of the application.

1. Create a Shipment
Navigate to the Create Shipment section.

Fill in the shipment details:

Shipment ID: A unique identifier (e.g., 1).

Origin: The starting location (e.g., Factory A).

Destination: The end location (e.g., Warehouse B).

Quantity: The number of items (e.g., 100).

Transit Stations: Comma-separated Ethereum addresses of transit stations (e.g., 0x...1, 0x...2, 0x...3).

Note: Use the addresses of the accounts you've imported into MetaMask from Ganache.

Click Create Shipment.

Confirm the transaction in MetaMask.

2. Progress the Shipment
Important: Only the account corresponding to the next transit station can progress the shipment.

For each transit station:

Switch MetaMask to the account corresponding to the next transit station.
Click on the MetaMask extension icon.
Select the account assigned to the next station.
Navigate to the Progress Shipment section.
Enter the Shipment ID.
Click Progress Shipment.
Confirm the transaction in MetaMask.
Observe the message confirming the progression.
Repeat these steps for each transit station in the shipment.
3. Report Damage
Note: Only stations that the shipment has passed through can report damage.

Switch to an account that represents a station that has processed the shipment.

Navigate to the Report Damage section.

Enter the Shipment ID and the Damaged Quantity.

Click Report Damage.

Confirm the transaction in MetaMask.

4. View Shipment Details
Navigate to the View Shipment Details section.

Enter the Shipment ID.

Click Get Details.

The shipment information, including status, current station index, and damaged quantity, will be displayed.

Troubleshooting
1. Common Issues
MetaMask Not Connecting:

Ensure that MetaMask is connected to the correct network (Localhost 7545).
Check that Ganache is running.
Contract Not Deployed:

Verify that you have deployed the contract and updated the contract address in App.js.
Ensure that the ABI in SupplyChainManagement.json matches the deployed contract.
Transactions Failing:

Ensure you have sufficient funds in your accounts (Ganache accounts should have ETH by default).
Check that you are using the correct account for each action (e.g., only the next station can progress the shipment).
Verify that the transit station addresses used when creating the shipment match the accounts imported into MetaMask.
Address Casing Issues:

Ethereum addresses are case-insensitive, but when comparing addresses in JavaScript, casing matters.
Ensure that addresses are normalized (e.g., using toLowerCase() or getAddress() from ethers.js) when comparing.
2. Logs and Errors
Check the Browser Console:

Press F12 or Ctrl+Shift+I to open the developer console.
Look for any error messages that can help diagnose issues.
Ganache Logs:

Review the Ganache CLI or GUI logs for transaction details and errors.
MetaMask Notifications:

Pay attention to any error messages or prompts from MetaMask.

Smart Contract Modifications:

If you modify the smart contract, remember to recompile and redeploy it.
Update the ABI and contract address in the React application accordingly.
