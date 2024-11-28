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

      //fetch and update the damage reporters and quantities list
      const [reporters, quantities] = await contract.getDamageReports(shipmentId);
      const reporterList = reporters.map((address, index) => ({
        address, 
        damagedQuantity: quantities[index],
      }));
      setDamageReporters(reporterList);
      
    } catch (err) {
      console.error(err);
      setMessage("Error retrieving shipment details.");
    }
  };

useEffect(() => { fetchShipmentDetails(); }, [shipmentId]);

/**
   * Listen for any smart contract events to trigger a refresh.
   */
useEffect(() => {
  if (!contract) return;

  const refreshOnEvent = () => {
    fetchShipmentDetails(); // Re-fetch shipment details when an event is emitted
  };

  // Listen to all events emitted by the contract
  contract.on("*", refreshOnEvent);

  // Cleanup the event listener on component unmount
  return () => {
    contract.off("*", refreshOnEvent);
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
                  Address: {report.address}, Damaged Quantity: {" "}{report.damagedQuantity.toString()}
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