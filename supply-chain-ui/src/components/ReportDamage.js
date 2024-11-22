// src/components/ReportDamage.js

import React, { useState } from 'react';

/**
 * Component for reporting damage to a shipment.
 * Only stations that the shipment has passed through can report damage.
 *
 * Props:
 * - contract: The instance of the smart contract to interact with.
 * - currentAccount: The Ethereum account currently connected via MetaMask.
 */
function ReportDamage({ contract, currentAccount }) {
  // State variables to hold form input values and messages
  const [shipmentId, setShipmentId] = useState('');
  const [damagedQuantity, setDamagedQuantity] = useState('');
  const [damageReason, setDamageReason] = useState('')
  const [message, setMessage] = useState('');

  /**
   * Handles the form submission to report damage.
   *
   * @param {Event} e - The form submission event.
   */
  const handleReport = async (e) => {
    e.preventDefault();
    try {
      // Interact with the smart contract to report damage
      const tx = await contract.reportDamage(shipmentId, damagedQuantity, damageReason);
      await tx.wait(); // Wait for the transaction to be mined
      setMessage('Damage reported successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Error reporting damage.');
    }
  };

  return (
    <div className="mt-5">
      <h2>Report Damage</h2>
      {/* Display the current connected Ethereum account */}
      <p>Current Account: {currentAccount}</p>
      <form onSubmit={handleReport}>
        {/* Form fields for shipment ID and damaged quantity */}
        <div className="form-group">
          <label>Shipment ID</label>
          <input
            type="number"
            className="form-control"
            value={shipmentId}
            onChange={(e) => setShipmentId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Damaged Quantity</label>
          <input
            type="number"
            className="form-control"
            value={damagedQuantity}
            onChange={(e) => setDamagedQuantity(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Explanation for Damages</label>
          <input
            type="text"
            className="form-control"
            value={damageReason}
            onChange={(e) => setDamageReason(e.target.value)}
            required
          />
        </div>
        {/* Submit button */}
        <button type="submit" className="btn btn-primary mt-3">
          Report Damage
        </button>
      </form>
      {/* Display messages to the user */}
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}

export default ReportDamage;
