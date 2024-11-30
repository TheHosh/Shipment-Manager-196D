// src/App.js

import React, { useEffect, useState } from 'react';
import { BrowserProvider, Contract, isAddress } from 'ethers';
import SupplyChainManagement from './contracts/SupplyChainManagement.json'; // Import the contract's ABI
import CreateShipment from './components/CreateShipment';
import ProgressShipment from './components/ProgressShipment';
import ReportDamage from './components/ReportDamage';
import ShipmentDetails from './components/ShipmentDetails';
import './App.css';

/**
 * The main application component.
 * Initializes the Ethereum provider, signer, and contract.
 * Manages account changes and provides the contract instance to child components.
 */
function App() {
  // State variables to hold provider, signer, contract, and current account
  const [provider, setProvider] = useState(null); // Ethereum provider (e.g., MetaMask)
  const [signer, setSigner] = useState(null);     // Signer for signing transactions
  const [contract, setContract] = useState(null); // Smart contract instance
  const [currentAccount, setCurrentAccount] = useState(null); // Current connected Ethereum account

  // useEffect hook to initialize the provider and contract when the component mounts
  useEffect(() => {
    let newProvider; // Variable to hold the provider within the scope
    let newContract; // Variable to hold the contract within the scope

    /**
     * Handles changes to the connected Ethereum accounts.
     * Updates the signer and contract instances with the new account.
     *
     * @param {Array} accounts - The list of accounts provided by MetaMask.
     */
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        alert('Please connect to MetaMask.');
      } else {
        const newAccount = accounts[0]; // Get the new account
        setCurrentAccount(newAccount);  // Update state with the new account

        // Update the signer with the new account
        const updatedSigner = await newProvider.getSigner();
        setSigner(updatedSigner);

        // Connect the contract to the new signer
        const updatedContract = newContract.connect(updatedSigner);
        setContract(updatedContract);
      }
    };

    /**
     * Initializes the Ethereum provider, signer, and contract.
     * Requests account access and sets up event listeners for account changes.
     */
    const init = async () => {
      if (window.ethereum) {
        // Create a new provider using MetaMask's provider
        newProvider = new BrowserProvider(window.ethereum);
        setProvider(newProvider);

        // Request account access if needed
        await newProvider.send('eth_requestAccounts', []);

        // Get the signer (current account)
        const newSigner = await newProvider.getSigner();
        setSigner(newSigner);

        // Get the list of accounts
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setCurrentAccount(accounts[0]); // Set the current account

        // Replace with your deployed contract address
        const contractAddress = 'your deployed contract address here';

        // Ensure the contract address is a valid Ethereum address
        if (!isAddress(contractAddress)) {
          console.error('Invalid contract address');
          return;
        }

        // Create a new contract instance with the signer
        newContract = new Contract(
          contractAddress,
          SupplyChainManagement, // The contract's ABI
          newSigner
        );
        setContract(newContract);

        // Listen for account changes in MetaMask
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      } else {
        // MetaMask is not installed
        alert('Please install MetaMask!');
      }
    };

    init(); // Call the initialization function

    // Clean up the event listener when the component unmounts
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // If the contract is not yet initialized, display a loading message
  if (!contract) {
    return <div>Loading...</div>;
  }

  // Render the main application UI
  return (
    <div className="container">
       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="mt-4" style={{ fontFamily: "Coolvetica", fontSize: 70 }}>
            chainmail: a Supply Chain DApp
          </h1>
          <p style={{ color: "#0D6EFD", fontFamily: "Creato-Light", fontSize: 25 }}>
            Connected Account: {currentAccount}
          </p>
        </div>
        <div className="logo"></div>
      </div>
      {/* Pass the contract and current account as props to child components */}
      <CreateShipment contract={contract} currentAccount={currentAccount} />
      <ProgressShipment contract={contract} currentAccount={currentAccount} />
      <ReportDamage contract={contract} currentAccount={currentAccount} />
      <ShipmentDetails contract={contract} currentAccount={currentAccount}/>
    </div>
  );
}

export default App;
