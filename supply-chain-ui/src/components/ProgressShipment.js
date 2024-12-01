// src/components/ProgressShipment.js

import React, { useState } from 'react';
import { getAddress } from 'ethers';
import '../App.css';

/**
 * Component for progressing a shipment to the next station.
 * Only the account corresponding to the next station can progress the shipment.
 *
 * Props:
 * - contract: The instance of the smart contract to interact with.
 * - currentAccount: The Ethereum account currently connected via MetaMask.
 */
function ProgressShipment({ contract, currentAccount }) {
  // State variables to hold form input values and messages
  const [shipmentId, setShipmentId] = useState('');
  const [message, setMessage] = useState('');
  const [expectedNextStation, setExpectedNextStation] = useState('');

  /**
   * Handles the form submission to progress the shipment.
   * Validates that the current account is the expected next station.
   *
   * @param {Event} e - The form submission event.
   */
  const handleProgress = async (e) => {
    e.preventDefault();
    try {
      // Fetch shipment details from the smart contract
      const shipmentDetails = await contract.getShipmentDetails(shipmentId);
      const currentStationIndex = Number(shipmentDetails.currentStationIndex);
      const transitStations = shipmentDetails.transitStations;

      // Get the expected next station address based on the current station index
      const expectedStation = transitStations[currentStationIndex];
      setExpectedNextStation(expectedStation);

      // Normalize addresses to checksum format
      const normalizedCurrentAccount = getAddress(currentAccount);
      const normalizedExpectedStation = getAddress(expectedStation);

      // Compare addresses to ensure the correct station is progressing the shipment
      if (normalizedCurrentAccount !== normalizedExpectedStation) {
        setMessage('Error: You are not the next station to progress the shipment.');
        return;
      }

      // Interact with the smart contract to progress the shipment
      const tx = await contract.progressToNextStation(shipmentId);
      await tx.wait(); // Wait for the transaction to be mined
      setMessage('Shipment progressed to next station.');
    } catch (err) {
      console.error(err);
      setMessage('Error progressing shipment.');
    }
  };

  return (
    <div className="mt-5">
      <h2 style = {{fontFamily: "Creato-Bold"}}>Progress Shipment</h2>
      {/* Display the current connected Ethereum account */}
      <p style = {{color: "#0D6EFD", fontFamily: "Creato-Light"}}>Current Account: {currentAccount}</p>
      <form onSubmit={handleProgress}>
        {/* Form field for shipment ID */}
        <div className="form-group">
          <label style = {{fontFamily: "Creato-Light"}}>Shipment ID</label>
          <input
            type="number"
            className="form-control"
            value={shipmentId}
            onChange={(e) => setShipmentId(e.target.value)}
            required
          />
        </div>
        {/* Submit button */}
        <button type="submit" className="btn btn-primary mt-3" style = {{fontFamily: "Creato-Light"}}>
          Progress Shipment
        </button>
      </form>
      {/* Display the expected next station address */}
      {expectedNextStation && (
        <p className="mt-3">Expected Next Station: {expectedNextStation}</p>
      )}
      {/* Display messages to the user */}
      {message && <p className="mt-3" style = {{fontFamily: "Creato-Light"}}>{message}</p>}
    </div>
  );
}

export default ProgressShipment;
