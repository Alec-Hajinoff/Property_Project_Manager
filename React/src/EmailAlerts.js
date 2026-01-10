import React, { useState, useEffect } from "react";
import {
  setAlertThresholds,
  getAlertThresholds,
  deleteAlertThresholds,
} from "./ApiService";
import "./EmailAlerts.css";

const EmailAlerts = () => {
  const [thresholds, setThresholds] = useState({
    maxTemp: "",
    minTemp: "",
    maxHumidity: "",
    minHumidity: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExistingThresholds();
  }, []);

  const fetchExistingThresholds = async () => {
    try {
      const response = await getAlertThresholds();
      if (response.success) {
        setThresholds({
          maxTemp: response.data.maxTemp,
          minTemp: response.data.minTemp,
          maxHumidity: response.data.maxHumidity,
          minHumidity: response.data.minHumidity,
        });
      }
    } catch (error) {
      setMessage({ text: "There are no existing alerts", type: "error" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setThresholds((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await setAlertThresholds(thresholds);
      if (response.success) {
        setMessage({
          text: "Alert thresholds saved successfully!",
          type: "success",
        });
      } else {
        setMessage({ text: response.message || "Save failed", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Failed to save alert thresholds", type: "error" });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await deleteAlertThresholds();
      if (response.success) {
        setThresholds({
          maxTemp: "",
          minTemp: "",
          maxHumidity: "",
          minHumidity: "",
        });
        setMessage({
          text: "Alert thresholds deleted successfully!",
          type: "success",
        });
      } else {
        setMessage({
          text: response.message || "Delete failed",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "Failed to delete alert thresholds", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="email-alerts-container">
      <h3>Email Alert Settings</h3>

      {message.text && (
        <div
          className={`alert ${
            message.type === "success" ? "alert-success" : "alert-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="alerts-form"
        aria-label="Email alert settings"
      >
        <div className="form-group">
          <label htmlFor="maxTemp">
            Send me an alert when the temperature goes above:
          </label>
          <input
            id="maxTemp"
            type="number"
            name="maxTemp"
            value={thresholds.maxTemp}
            onChange={handleInputChange}
            className="form-control"
            step="0.1"
            placeholder="e.g. 30.0"
            aria-label="Maximum temperature alert threshold"
          />
          <small className="helper-text">
            Enter value in °C (or your system units).
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="minTemp">
            Send me an alert when the temperature goes below:
          </label>
          <input
            id="minTemp"
            type="number"
            name="minTemp"
            value={thresholds.minTemp}
            onChange={handleInputChange}
            className="form-control"
            step="0.1"
            placeholder="e.g. 5.0"
            aria-label="Minimum temperature alert threshold"
          />
          <small className="helper-text">
            Enter value in °C (or your system units).
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="maxHumidity">
            Send me an alert when the humidity goes above:
          </label>
          <input
            id="maxHumidity"
            type="number"
            name="maxHumidity"
            value={thresholds.maxHumidity}
            onChange={handleInputChange}
            className="form-control"
            step="0.1"
            placeholder="e.g. 80.0"
            aria-label="Maximum humidity alert threshold"
          />
          <small className="helper-text">
            Enter value as percentage (0–100).
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="minHumidity">
            Send me an alert when the humidity goes below:
          </label>
          <input
            id="minHumidity"
            type="number"
            name="minHumidity"
            value={thresholds.minHumidity}
            onChange={handleInputChange}
            className="form-control"
            step="0.1"
            placeholder="e.g. 20.0"
            aria-label="Minimum humidity alert threshold"
          />
          <small className="helper-text">
            Enter value as percentage (0–100).
          </small>
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Save Alerts
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete All Alerts
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailAlerts;
