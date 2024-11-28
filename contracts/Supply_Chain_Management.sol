// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SupplyChainManagement
 * @dev A smart contract to manage and track shipments in a supply chain using Ethereum blockchain.
 */
contract SupplyChainManagement {

    /**
     * @dev Enum representing the possible states of a shipment.
     * Pending: Shipment is created but not yet in transit.
     * InTransit: Shipment is currently moving through the supply chain.
     * Delivered: Shipment has reached its final destination.
     * Cancelled: Shipment has been cancelled.
     */
    enum ShippingStatus { Pending, InTransit, Delivered, Cancelled }

    /**
     * @dev Struct representing a shipment in the supply chain.
     */
    struct Shipment {
        uint256 id;                      // Unique identifier for the shipment
        string origin;                   // Origin location of the shipment
        string destination;              // Destination location of the shipment
        uint256 quantity;                // Total quantity of items being shipped
        uint256 totDamagedQuantity;         // Total quantity of items reported as damaged
        //string damageReason;             // Reason for damaged items (arrived damaged, improper packing, accidents, etc.)
        ShippingStatus status;           // Current status of the shipment
        address[] transitStations;       // Array of addresses representing transit stations
        uint256 currentStationIndex;     // Index of the current station in transitStations array
        address[] reporters;
        mapping(address => DamageReport) damageReports; // Maps address that reported damage to their report
    }

    //This struct will allow for easier accessing of what station is associated with what damage quantity and reason
    struct DamageReport {
        uint256 damagedQuantity;
        string damageReason;
    }

    // Mapping from shipment ID to Shipment struct
    mapping(uint256 => Shipment) public shipments;

    // Nested mapping to track if a shipment has passed through a specific station
    // Mapping: shipment ID => (station address => bool)
    mapping(uint256 => mapping(address => bool)) public stationPassed;


    // Event emitted when a new shipment is created
    event ShipmentCreated(uint256 shipmentId);

    // Event emitted when the status of a shipment is updated
    event StatusUpdated(uint256 shipmentId, ShippingStatus newStatus);

    // Event emitted when damage is reported for a shipment at a station
    event DamageReported(uint256 indexed shipmentId, uint256 damagedQuantity, address indexed reporter, string damageReason);

    // Event emitted when a shipment progresses to the next station
    event StationUpdated(uint256 shipmentId, address station);

    /**
     * @dev Function to create a new shipment.
     * @param _id Unique identifier for the shipment.
     * @param _origin Origin location of the shipment.
     * @param _destination Destination location of the shipment.
     * @param _quantity Total quantity of items being shipped.
     * @param _transitStations Array of addresses representing the transit stations.
     */
    function createShipment(
        uint256 _id,
        string memory _origin,
        string memory _destination,
        uint256 _quantity,
        address[] memory _transitStations
    ) public {
        // Ensure that a shipment with the same ID does not already exist
        require(shipments[_id].id == 0, "Shipment with this ID already exists");

        // Create a new Shipment struct in storage
        Shipment storage newShipment = shipments[_id];
        newShipment.id = _id;
        newShipment.origin = _origin;
        newShipment.destination = _destination;
        newShipment.quantity = _quantity;
        newShipment.status = ShippingStatus.Pending; // Set initial status to Pending
        newShipment.transitStations = _transitStations; // Set transit stations
        newShipment.currentStationIndex = 0; // Start at the first station

        // Emit an event to signal that a new shipment has been created
        emit ShipmentCreated(_id);
    }

    /**
     * @dev Function to update the status of a shipment.
     * Only the current station in the shipment's transitStations can update the status.
     * @param _shipmentId The ID of the shipment to update.
     * @param _newStatus The new status to assign to the shipment.
     */
    function updateStatus(uint256 _shipmentId, ShippingStatus _newStatus) public {
        // Retrieve the shipment from storage
        Shipment storage shipment = shipments[_shipmentId];

        // Ensure that the shipment exists
        require(shipment.id != 0, "Shipment does not exist");

        // Check if the sender is authorized to update the status
        if (shipment.status == ShippingStatus.Pending || shipment.status == ShippingStatus.InTransit) {
            // Only the current station can update the status
            require(msg.sender == shipment.transitStations[shipment.currentStationIndex], "Not authorized to update status");
        }

        // Update the shipment's status
        shipment.status = _newStatus;

        // Emit an event to signal the status update
        emit StatusUpdated(_shipmentId, _newStatus);
    }

    /**
     * @dev Function to progress the shipment to the next station.
     * Must be called by the address of the next station in the transitStations array.
     * @param _shipmentId The ID of the shipment to progress.
     */
    function progressToNextStation(uint256 _shipmentId) public {
        // Retrieve the shipment from storage
        Shipment storage shipment = shipments[_shipmentId];

        // Ensure that the shipment exists
        require(shipment.id != 0, "Shipment does not exist");

        // Ensure the shipment is in a valid state to progress
        require(
            shipment.status == ShippingStatus.Pending || shipment.status == ShippingStatus.InTransit,
            "Shipment is not in transit"
        );

        // Ensure there are more stations to progress to
        require(
            shipment.currentStationIndex < shipment.transitStations.length,
            "Shipment has already arrived at the destination"
        );

        // Get the address of the next station
        address nextStation = shipment.transitStations[shipment.currentStationIndex];

        // Ensure that the caller is the next station
        require(msg.sender == nextStation, "Only the next station can call this function");

        // Mark that the shipment has passed this station
        stationPassed[_shipmentId][msg.sender] = true;

        // Emit an event to signal that the shipment has reached this station
        emit StationUpdated(_shipmentId, msg.sender);

        // Increment the current station index to point to the next station
        shipment.currentStationIndex++;

        // Update the shipment's status accordingly
        if (shipment.currentStationIndex == shipment.transitStations.length) {
            // If all stations have been passed, mark the shipment as Delivered
            shipment.status = ShippingStatus.Delivered;
            emit StatusUpdated(_shipmentId, ShippingStatus.Delivered);
        } else {
            // Otherwise, the shipment is still InTransit
            shipment.status = ShippingStatus.InTransit;
            emit StatusUpdated(_shipmentId, ShippingStatus.InTransit);
        }
    }

    /**
     * @dev Function to report damage at a specific station.
     * Can only be called by stations that the shipment has passed.
     * @param _shipmentId The ID of the shipment.
     * @param _damagedQuantity The quantity of items reported as damaged.
     */
    function reportDamage(uint256 _shipmentId, uint256 _damagedQuantity, string memory _damageReason) public {
        // Retrieve the shipment from storage
        Shipment storage shipment = shipments[_shipmentId];

        // Ensure that the shipment exists
        require(shipment.id != 0, "Shipment does not exist");

        // Ensure that the station has already been passed by the shipment
        require(stationPassed[_shipmentId][msg.sender] == true, "Station has not been passed yet");

        //Update individual damage report
        if (shipment.damageReports[msg.sender].damagedQuantity == 0) {
            shipment.reporters.push(msg.sender); //First add new reporter if they haven't reported on this shipment yet
        }

        shipment.damageReports[msg.sender] = DamageReport({
            damagedQuantity: _damagedQuantity,
            damageReason: _damageReason
        });

        //Increase the TOTAL damaged quantity of the shipment *** NOT ADDRESS SPECIFIC ***
        //literally just an accumulator
        shipment.totDamagedQuantity += _damagedQuantity;

        /*
        // Set the reason for the damages reported
        report.damageReason = _damageReason;
        */
        // Emit an event to signal that damage has been reported
        emit DamageReported(_shipmentId, _damagedQuantity, msg.sender, _damageReason);
    }

    function getDamageReports(uint256 _shipmentId) public view returns (address[] memory, uint256[] memory) {
        Shipment storage shipment = shipments[_shipmentId];
        uint256 reporterCount = shipment.reporters.length;

        address[] memory reporters = new address[](reporterCount);
        uint256[] memory quantities = new uint256[](reporterCount);

        for (uint256 i = 0; i < reporterCount; i++) {
            address reporter = shipment.reporters[i];
            reporters[i] = reporter;
            quantities[i] = shipment.damageReports[reporter].damagedQuantity;
        }

        return (reporters, quantities);
    }

    /**
     * @dev Function to retrieve the details of a shipment.
     * @param _shipmentId The ID of the shipment to retrieve.
     * @return id The shipment's unique identifier.
     * @return origin The origin location of the shipment.
     * @return destination The destination location of the shipment.
     * @return quantity The total quantity of items being shipped.
     * @return totDamagedQuantity The total quantity of items reported as damaged.
     * @return status The current status of the shipment.
     * @return transitStations The array of transit station addresses.
     * @return currentStationIndex The index of the current station in the transitStations array.
     * @return callerDamagedQuantity The specific quantity of items reported as damaged by specific account
     * @return callerDamageReason The reason provided by the specific account
     */
    function getShipmentDetails(uint256 _shipmentId)
        public
        view
        returns (
            uint256 id,
            string memory origin,
            string memory destination,
            uint256 quantity,
            uint256 totDamagedQuantity,
            ShippingStatus status,
            address[] memory transitStations,
            uint256 currentStationIndex,
            uint256 callerDamagedQuantity,
            string memory callerDamageReason
        )
    {
        // Retrieve the shipment from storage
        Shipment storage shipment = shipments[_shipmentId];
        DamageReport storage callerReport = shipment.damageReports[msg.sender];

        // Ensure that the shipment exists
        require(shipment.id != 0, "Shipment does not exist");

        // Return all the shipment details
        return (
            shipment.id,
            shipment.origin,
            shipment.destination,
            shipment.quantity,
            shipment.totDamagedQuantity,
            shipment.status,
            shipment.transitStations,
            shipment.currentStationIndex,
            callerReport.damagedQuantity,
            callerReport.damageReason
        );
    }

    /**
     * @dev Function to check if a shipment has passed through a specific station.
     * @param _shipmentId The ID of the shipment.
     * @param _station The address of the station to check.
     * @return True if the shipment has passed this station, false otherwise.
     */
    function hasPassedStation(uint256 _shipmentId, address _station) public view returns (bool) {
        // Return whether the shipment has passed the specified station
        return stationPassed[_shipmentId][_station];
    }
}
