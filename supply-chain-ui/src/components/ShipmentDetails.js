// src/components/ShipmentDetails.js

import { useEffect } from "react";
import React, { useState } from 'react';
import '../App.css';

/**
 * Component for viewing the details of a shipment.
 * Allows users to input a shipment ID and retrieve its details from the blockchain.
 *
 * Props:
 * - contract: The instance of the smart contract to interact with.
 */
function ShipmentDetails({ contract, currentAccount }) {
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
      const [reporters, quantities, explanations] = await contract.getDamageReports(shipmentId);
      const reporterList = reporters.map((address, index) => ({
        address, 
        damagedQuantity: quantities[index], 
        explanation: explanations[index]
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
        <h2 style = {{fontFamily: "Creato-Bold"}}>View Shipment Details</h2>
        {/* Display the current connected Ethereum account */}
        <p style = {{color: "#0D6EFD", fontFamily: "Creato-Light"}}>Current Account: {currentAccount}</p>
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
        {/* Display messages to the user */}
        {message && <p className="mt-3">{message}</p>}
        {/* Display shipment details if available */}
        {shipmentDetails && (
          <div className="mt-4">
            <p>
              <strong style = {{fontFamily: "Creato-Light"}}>ID:</strong> {shipmentDetails.id.toString()}
            </p>
            <p>
              <strong style = {{fontFamily: "Creato-Light"}}>Origin:</strong> {shipmentDetails.origin}
            </p>
            <p>
              <strong style = {{fontFamily: "Creato-Light"}}>Destination:</strong> {shipmentDetails.destination}
            </p>
            <p>
              <strong style = {{fontFamily: "Creato-Light"}}>Quantity:</strong> {shipmentDetails.quantity.toString()}
            </p>
            <p>
              <strong style = {{fontFamily: "Creato-Light"}}>Total Damaged Quantity:</strong>{' '}
              {shipmentDetails.totDamagedQuantity.toString()}
            </p>
            <p>
                <strong style = {{fontFamily: "Creato-Light"}}>Damage Reporters & Quantity: </strong>
              {damageReporters.length > 0 ? (
                damageReporters.map((report, index) => (
                    <li key={index} style = {{textIndent: "1.2vw"}}>
                      <strong style = {{fontFamily: "Creato-Light"}}>Address:</strong> {report.address} &emsp; <strong style = {{fontFamily: "Creato-Light"}}>Damaged Quantity:</strong> {" "}{report.damagedQuantity.toString()} &emsp; <strong style = {{fontFamily: "Creato-Light"}}>Explanation:</strong> {report.explanation}
                    </li>
                ))
              ) : (<inline>N/A</inline>)
              }
            </p>
            <p>
              <strong style = {{fontFamily: "Creato-Light"}}>Status:</strong>{" "}
              {getStatus(Number(shipmentDetails.status))}
            </p>
            <p>
              <strong style = {{fontFamily: "Creato-Light"}}>Current Station Index:</strong>{" "}
              {shipmentDetails.currentStationIndex.toString()}
            </p>
            <p>
              <strong style = {{fontFamily: "Creato-Light"}}>Transit Stations:</strong>
              {shipmentDetails.transitStations.map((station, index) => (
                <li key={index} style = {{textIndent: "1.2vw"}}> <strong style = {{fontFamily: "Creato-Light"}}>Address:</strong> {station}</li>
              ))}
            </p>
          </div>
        )}
      </div>
      <br></br><br></br><br></br><br></br>
    </>
  );
}

export default ShipmentDetails;