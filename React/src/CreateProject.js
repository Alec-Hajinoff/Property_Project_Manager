import React, { useState } from "react";
import "./CreateProject.css";
import { createProject } from "./ApiService";

function CreateProject() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    project_address: "",
    status: "Enquiry",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

    if (!formData.project_address.trim()) {
      setErrorMessage("Project address is required");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await createProject(formData);

      setSuccessMessage("Your project is saved");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      setIsFormVisible(false);
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to save project. Please try again.",
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
    <div className="create-project-container">
      <div className="create-project-card">
        <div className="card-header card-header-primary">
          <div className="d-flex justify-content-between align-items-center">
            <h5>Create a new project</h5>
            <button
              className="toggle-form-btn"
              onClick={toggleFormVisibility}
              type="button"
            >
              {isFormVisible ? "Hide Form" : "Show Form"}
            </button>
          </div>
        </div>

        {isFormVisible && (
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="project_address" className="form-label">
                  Project Address *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="project_address"
                  name="project_address"
                  value={formData.project_address}
                  onChange={handleInputChange}
                  placeholder="Enter full project address"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label d-block">Project Status *</label>
                <div className="status-options">
                  {["Enquiry", "Active", "On hold", "Completed"].map(
                    (status) => (
                      <div className="form-check" key={status}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id={`status${status}`}
                          value={status}
                          checked={formData.status === status}
                          onChange={handleInputChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`status${status}`}
                        >
                          {status}
                        </label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div
                  className="alert alert-success alert-dismissible fade show"
                  role="alert"
                >
                  {successMessage}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSuccessMessage("")}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn-save-project"
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
                    "Save Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateProject;
