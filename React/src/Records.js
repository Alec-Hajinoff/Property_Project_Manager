// This file allows a builder to create a new record related to a given project.

import React, { useState } from "react";
import "./Records.css";
import { createRecord } from "./ApiService";

function Records({ projectId, builderId }) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    record_type: "Agreement",
    title: "",
    details: "",
  });

  const recordTypes = [
    "Agreement",
    "Variation",
    "Approval",
    "Delivery",
    "Issue",
    "Milestone",
    "General",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.details.trim()) {
      setErrorMessage("Title and details are required");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const recordData = {
        ...formData,
        project_id: projectId,
        builder_id: builderId,
      };

      await createRecord(recordData);

      setSuccessMessage("Record added");

      setFormData({
        record_type: "Agreement",
        title: "",
        details: "",
      });

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to save record. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);

    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div className="records-container mt-3">
      <div className="d-flex justify-content-end">
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={toggleFormVisibility}
          type="button"
        >
          {isFormVisible ? "Cancel" : "Add Record"}
        </button>
      </div>

      {isFormVisible && (
        <div className="card mt-2">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="record_type" className="form-label">
                  Record Type
                </label>
                <select
                  className="form-select"
                  id="record_type"
                  name="record_type"
                  value={formData.record_type}
                  onChange={handleInputChange}
                >
                  {recordTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Short Description *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter short description"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="details" className="form-label">
                  Detailed Notes *
                </label>
                <textarea
                  className="form-control"
                  id="details"
                  name="details"
                  rows="3"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="Enter detailed notes"
                  required
                />
              </div>

              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    "Save Record"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Records;
