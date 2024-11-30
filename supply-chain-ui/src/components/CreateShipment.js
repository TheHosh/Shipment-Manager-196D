// src/components/CreateShipment.js

import React, { useState } from 'react';
import { getAddress } from 'ethers';
import '../App.css';

/**
 * Component for creating a new shipment in the supply chain.
 * Allows users to input shipment details and submit them to the blockchain.
 *
 * Props:
 * - contract: The instance of the smart contract to interact with.
 * - currentAccount: The Ethereum account currently connected via MetaMask.
 */
function CreateShipment({ contract, currentAccount }) {
  // State variables to hold form input values
  const [shipmentId, setShipmentId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [quantity, setQuantity] = useState('');
  const [transitStations, setTransitStations] = useState('');
  const [message, setMessage] = useState(''); // For user feedback

  /**
   * Handles the form submission to create a new shipment.
   * Validates and normalizes input data before sending it to the smart contract.
   *
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Split the transitStations input into an array and normalize addresses
    let stationsArray;
    try {
      stationsArray = transitStations.split(',').map((s) => {
        const trimmed = s.trim();
        return getAddress(trimmed); // Normalize and validate Ethereum address
      });
    } catch (error) {
      console.error('Invalid address in transit stations:', error);
      alert('One or more transit station addresses are invalid.');
      return;
    }

    try {
      // Interact with the smart contract to create a new shipment
      const tx = await contract.createShipment(
        shipmentId,
        origin,
        destination,
        quantity,
        stationsArray
      );
      await tx.wait(); // Wait for the transaction to be mined
      setMessage('Shipment created successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Error creating shipment.');
    }
  };

  return (
    <div className="mt-5">
      <h2 style = {{fontFamily: "Creato-Bold"}}>Create Shipment</h2>
      {/* Display the current connected Ethereum account */}
      <p style = {{color: "#0D6EFD", fontFamily: "Creato-Light"}}>Current Account: {currentAccount}</p>
      <form onSubmit={handleSubmit}>
        {/* Form fields for shipment details */}
        <div className="form-group">
          <label style = {{fontFamily: "Creato-Light"}}>Shipment ID</label>
          <input
            type="number"
            className="form-control"
            value={shipmentId}
            onChange={(e) => setShipmentId(e.target.value)}
            required
          /><br></br>
        </div>
        <div className="form-group">
          <label style = {{fontFamily: "Creato-Light"}}>Origin</label>
          <input
            type="text"
            className="form-control"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
          /><br></br>
        </div>
        <div className="form-group">
          <label style = {{fontFamily: "Creato-Light"}}>Destination</label>
          <input
            type="text"
            className="form-control"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          /><br></br>
        </div>
        <div className="form-group">
          <label style = {{fontFamily: "Creato-Light"}}>Quantity</label>
          <input
            type="number"
            className="form-control"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          /><br></br>
        </div>
        <div className="form-group">
          <label style = {{fontFamily: "Creato-Light"}}>Transit Stations (comma-separated addresses)</label>
          <input
            type="text"
            className="form-control"
            value={transitStations}
            onChange={(e) => setTransitStations(e.target.value)}
            required
          />
        </div>
        {/* Submit button */}
        <button type="submit" className="btn btn-primary mt-3" style = {{fontFamily: "Creato-Light"}}>
          Create Shipment
        </button>
      </form>
      {/* Display messages to the user */}
      {message && <p className="mt-3" style = {{fontFamily: "Creato-Light"}}>{message}</p>}
    </div>
  );
}

export default CreateShipment;
