// This file allows a builder to create a new record related to a given project.

import React, { useState } from "react";
import "./Records.css";
import { createRecord } from "./ApiService";

function Records({ projectId, builderId }) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [addParty, setAddParty] = useState(false);

  const [formValues, setFormValues] = useState({
    record_type: "Agreement",
    title: "",
    details: "",
  });

  const [partyData, setPartyData] = useState({
    name: "",
    type: "Client",
    notes: "",
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

  const partyTypes = [
    "Client",
    "Supplier",
    "Subcontractor",
    "Professional service (e.g. Architect)",
    "Authority (e.g. Council)",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });

    if (errorMessage) setErrorMessage("");
  };

  const handlePartyInputChange = (e) => {
    const { name, value } = e.target;
    setPartyData({
      ...partyData,
      [name]: value,
    });

    if (errorMessage) setErrorMessage("");
  };

  const handleAddPartyToggle = () => {
    setAddParty(!addParty);

    if (addParty) {
      setPartyData({
        name: "",
        type: "Client",
        notes: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formValues.title.trim() || !formValues.details.trim()) {
      setErrorMessage("Title and details are required");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();

      formData.append("record_type", formValues.record_type);
      formData.append("title", formValues.title);
      formData.append("details", formValues.details);
      formData.append("project_id", projectId.toString());
      formData.append("builder_id", builderId.toString());

      if (addParty && (partyData.name.trim() || partyData.notes.trim())) {
        formData.append("party[name]", partyData.name);
        formData.append("party[type]", partyData.type);
        formData.append("party[notes]", partyData.notes);
      }

      await createRecord(formData);

      setSuccessMessage("Record added");

      setFormValues({
        record_type: "Agreement",
        title: "",
        details: "",
      });

      setPartyData({
        name: "",
        type: "Client",
        notes: "",
      });
      setAddParty(false);

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

    if (isFormVisible) {
      setFormValues({
        record_type: "Agreement",
        title: "",
        details: "",
      });
      setPartyData({
        name: "",
        type: "Client",
        notes: "",
      });
      setAddParty(false);
    }

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
                  value={formValues.record_type}
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
                  value={formValues.title}
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
                  value={formValues.details}
                  onChange={handleInputChange}
                  placeholder="Enter detailed notes"
                  required
                />
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="addParty"
                    checked={addParty}
                    onChange={handleAddPartyToggle}
                  />
                  <label className="form-check-label" htmlFor="addParty">
                    Would you like to add a party to this record?
                  </label>
                </div>
              </div>

              {addParty && (
                <div className="card mb-3 border-primary">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3 text-muted">
                      Party Information (Optional)
                    </h6>

                    <div className="mb-3">
                      <label htmlFor="party_name" className="form-label">
                        Type party name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="party_name"
                        name="name"
                        value={partyData.name}
                        onChange={handlePartyInputChange}
                        placeholder="Enter party name"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="party_type" className="form-label">
                        Choose party type
                      </label>
                      <select
                        className="form-select"
                        id="party_type"
                        name="type"
                        value={partyData.type}
                        onChange={handlePartyInputChange}
                      >
                        {partyTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="party_notes" className="form-label">
                        Add notes
                      </label>
                      <textarea
                        className="form-control"
                        id="party_notes"
                        name="notes"
                        rows="2"
                        value={partyData.notes}
                        onChange={handlePartyInputChange}
                        placeholder="Enter party notes"
                      />
                    </div>
                  </div>
                </div>
              )}

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
