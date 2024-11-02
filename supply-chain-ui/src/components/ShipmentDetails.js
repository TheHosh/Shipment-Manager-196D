// src/components/ShipmentDetails.js

import React, { useState } from 'react';

/**
 * Component for viewing the details of a shipment.
 * Allows users to input a shipment ID and retrieve its details from the blockchain.
 *
 * Props:
 * - contract: The instance of the smart contract to interact with.
 */
function ShipmentDetails({ contract }) {
  // State variables to hold form input values, shipment details, and messages
  const [shipmentId, setShipmentId] = useState('');
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [message, setMessage] = useState('');

  /**
   * Handles the form submission to retrieve shipment details.
   *
   * @param {Event} e - The form submission event.
   */
  const handleGetDetails = async (e) => {
    e.preventDefault();
    try {
      // Fetch shipment details from the smart contract
      const details = await contract.getShipmentDetails(shipmentId);
      setShipmentDetails(details);
      setMessage('');
    } catch (err) {
      console.error(err);
      setMessage('Error retrieving shipment details.');
    }
  };

  /**
   * Converts the shipment status code to a human-readable string.
   *
   * @param {number} status - The status code of the shipment.
   * @returns {string} The status as a string.
   */
  function getStatus(status) {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'In Transit';
      case 2:
        return 'Delivered';
      case 3:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  return (
    <div className="mt-5">
      <h2>View Shipment Details</h2>
      <form onSubmit={handleGetDetails}>
        {/* Form field for shipment ID */}
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
        {/* Submit button */}
        <button type="submit" className="btn btn-primary mt-3">
          Get Details
        </button>
      </form>
      {/* Display messages to the user */}
      {message && <p className="mt-3">{message}</p>}
      {/* Display shipment details if available */}
      {shipmentDetails && (
        <div className="mt-4">
          <h3>Shipment Information:</h3>
          <p>
            <strong>ID:</strong> {shipmentDetails.id.toString()}
          </p>
          <p>
            <strong>Origin:</strong> {shipmentDetails.origin}
          </p>
          <p>
            <strong>Destination:</strong> {shipmentDetails.destination}
          </p>
          <p>
            <strong>Quantity:</strong> {shipmentDetails.quantity.toString()}
          </p>
          <p>
            <strong>Damaged Quantity:</strong>{' '}
            {shipmentDetails.damagedQuantity.toString()}
          </p>
          <p>
            {/* Convert status code to string */}
            <strong>Status:</strong> {getStatus(Number(shipmentDetails.status))}
          </p>
          <p>
            <strong>Current Station Index:</strong>{' '}
            {shipmentDetails.currentStationIndex.toString()}
          </p>
          <p>
            <strong>Transit Stations:</strong>
          </p>
          <ul>
            {/* List of transit station addresses */}
            {shipmentDetails.transitStations.map((station, index) => (
              <li key={index}>{station}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ShipmentDetails;
