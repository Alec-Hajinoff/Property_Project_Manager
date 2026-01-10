// This file runs the user dashboard displaying sensor readings.

import React, { useEffect, useState } from "react";
import "./PullReadings.css";
import Thermometer from "./Thermometer.js";
import HumidityGauge from "./HumidityGauge.js";
import LogoutComponent from "./LogoutComponent";
import { pullReadingsFunction, pullHistory } from "./ApiService";
import HistoricGraph from "./HistoricGraph";
import EmailAlerts from "./EmailAlerts";

function PullReadings() {
  const [sensorData, setSensorData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [historyError, setHistoryError] = useState("");

  const loadSensorData = async () => {
    try {
      setLoading(true);
      // Fetch latest and historic readings concurrently so the UI updates together.
      const [latestResponse, historyResponse] = await Promise.all([
        pullReadingsFunction(),
        pullHistory(),
      ]);

      if (latestResponse.success && latestResponse.data) {
        setSensorData(latestResponse.data);
        setErrorMessage("");
      } else {
        setSensorData(null);
        setErrorMessage("Failed to load sensor data");
      }

      if (historyResponse.success && Array.isArray(historyResponse.data)) {
        setHistoryData(historyResponse.data); // Populate table with returned rows.
        setHistoryError("");
      } else {
        setHistoryData([]);
        setHistoryError("Failed to load historic readings"); // Let the user know the table fetch failed.
      }
    } catch (error) {
      setSensorData(null);
      setErrorMessage(error.message || "Failed to load sensor data");
      setHistoryData([]);
      setHistoryError(error.message || "Failed to load historic readings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSensorData();
  }, []);

  return (
    <div className="container">
      <div className="d-flex justify-content-end mb-3">
        <LogoutComponent />
      </div>

      <h2 className="h5">Latest Sensor Readings:</h2>
      {loading && <p>Loading sensor data...</p>}
      {!loading && errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      {!loading && sensorData && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-4">
              {/* LEFT COLUMN - Sensor Readings */}
              <div className="col-lg-6">
                <h5 className="card-title text-center mb-4">
                  Current Readings
                </h5>

                <div className="text-center mb-4">
                  <Thermometer temperature={sensorData.temperature} />
                  <p className="mt-3">
                    <strong>Temperature:</strong> {sensorData.temperature}°C
                  </p>
                </div>

                <div className="text-center">
                  <HumidityGauge humidity={sensorData.humidity} />
                  <p className="mt-3">
                    <strong>Humidity:</strong> {sensorData.humidity}%
                  </p>
                </div>

                <p className="text-muted text-center mt-4 small">
                  <strong>Received:</strong>{" "}
                  {new Date(sensorData.inserted_at).toLocaleString()}
                </p>
              </div>

              {/* RIGHT COLUMN - Email Alerts */}
              <div className="col-lg-6">
                <h5 className="card-title mb-4">Alert Settings</h5>
                <EmailAlerts />
              </div>
            </div>
          </div>
        </div>
      )}
      <br></br>

      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={loadSensorData}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      <br></br>

      {/* A graph showing historic readings trend */}
      {!loading && <HistoricGraph historyData={historyData} />}

      {!loading && (
        <div className="mt-4">
          <h2 className="h5">Historic Readings:</h2>
          {historyError && (
            <div className="alert alert-warning" role="alert">
              {historyError}
            </div>
          )}
          {/* Render a table when we have historic rows, otherwise show a friendly notice. */}
          {historyData.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Received At</th>
                    <th scope="col">Temperature</th>
                    <th scope="col">Humidity</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((reading, index) => (
                    <tr key={`${reading.received_at}-${index}`}>
                      <td>{new Date(reading.received_at).toLocaleString()}</td>
                      <td>{reading.temperature}</td>
                      <td>{reading.humidity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">
              Historic readings will appear here once available.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PullReadings;
