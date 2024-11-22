// src/components/ShipmentDetails.js

import { useEffect } from "react";
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
  const [damageReporters, setDamageReporters] = useState([]);
  const [message, setMessage] = useState('');

 // Fetch shipment details when shipmentId changes
 useEffect(() => {
  const fetchShipmentDetails = async () => {
    if (!shipmentId) return;
    try {
      const details = await contract.getShipmentDetails(shipmentId);
      const [
        id,
        origin,
        destination,
        quantity,
        totDamagedQuantity,
        status,
        transitStations,
        currentStationIndex,
        callerDamagedQuantity,
        callerDamageReason
      ] = details;

      setShipmentDetails({
        id,
        origin,
        destination,
        quantity,
        totDamagedQuantity,
        status,
        transitStations,
        currentStationIndex,
        callerDamagedQuantity,
        callerDamageReason
      });

      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Error retrieving shipment details.");
    }
  };

  fetchShipmentDetails();
}, [shipmentId, contract]);

// Listen for DamageReported events and update the state
useEffect(() => {
  if (!contract) return;

  const handleDamageReported = async (eventShipmentId, damagedQuantity, reporter, damageReason) => {
    if (shipmentId && eventShipmentId.toString() === shipmentId) {
      setDamageReporters((prev) => {
        const updatedReporters = [...prev];
        const existingReporterIndex = updatedReporters.findIndex(
          (report) => report.address === reporter
        );

        if (existingReporterIndex >= 0) {
          // Update existing reporter
          updatedReporters[existingReporterIndex].damagedQuantity = damagedQuantity;
        } else {
          // Add new reporter
          updatedReporters.push({ address: reporter, damagedQuantity });
        }

        return updatedReporters;
      });
    }
  };

  // Attach event listener for DamageReported
  contract.on("DamageReported", handleDamageReported);

  // Cleanup the event listener on component unmount
  return () => {
    contract.off("DamageReported", handleDamageReported);
  };
}, [contract, shipmentId]);

  /**
   * Converts the shipment status code to a human-readable string.
   *
   * @param {number} status - The status code of the shipment.
   * @returns {string} The status as a string.
   */
  function getStatus(status) {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "In Transit";
      case 2:
        return "Delivered";
      case 3:
        return "Cancelled";
      default:
        return "Unknown";
    }
  }

  return (
    <>
      <div className="mt-5">
        <h2>View Shipment Details</h2>
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
            <div className="shipment-details-damages">
              <p>
                <strong>Total Damaged Quantity:</strong>{' '}
                {shipmentDetails.totDamagedQuantity.toString()}
              </p>
              <p>
                <strong>Damage Reporters & Quantity:
                </strong>
              </p>
              <ul>
              {damageReporters.map((report, index) => (
                <li key={index}>
                  Address: {report.address}, Damaged Quantity: {report.damagedQuantity.toString()}
                </li>
              ))}
            </ul>
            </div>
            <p>
              <strong>Status:</strong>{" "}
              {getStatus(Number(shipmentDetails.status))}
            </p>
            <p>
              <strong>Current Station Index:</strong>{" "}
              {shipmentDetails.currentStationIndex.toString()}
            </p>
            <p>
              <strong>Transit Stations:</strong>
            </p>
            <ul>
              {shipmentDetails.transitStations.map((station, index) => (
                <li key={index}>{station}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default ShipmentDetails;