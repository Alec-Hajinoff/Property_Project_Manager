import React, { useState } from "react";
import "./UserAccountWelcome.css";
import LogoutComponent from "./LogoutComponent";
import { createProject } from "./ApiService";

function UserAccountWelcome() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    project_address: "",
    client_party: "",
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
    // Clear error when user starts typing
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.project_address.trim() || !formData.client_party.trim()) {
      setErrorMessage("Project address and client name are required");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await createProject(formData);

      // Show success message
      setSuccessMessage("Your project is saved");

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Collapse the form after successful submission
      setIsFormVisible(false);
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to save project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
    // Clear messages when toggling form
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-end mb-3">
        <LogoutComponent />
      </div>

      <div className="text-center mt-5">
        <h1>Welcome to your dashboard</h1>
      </div>

      {/* Create New Project Section */}
      <div className="row justify-content-center mt-5">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Create a new project</h5>
                <button
                  className="btn btn-light btn-sm"
                  onClick={toggleFormVisibility}
                  type="button"
                >
                  {isFormVisible ? "Hide Form" : "Show Form"}
                </button>
              </div>
            </div>

            {isFormVisible && (
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Project Address */}
                  <div className="mb-3">
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

                  {/* Client Name */}
                  <div className="mb-3">
                    <label htmlFor="client_party" className="form-label">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="client_party"
                      name="client_party"
                      value={formData.client_party}
                      onChange={handleInputChange}
                      placeholder="Enter client name"
                      required
                    />
                  </div>

                  {/* Project Status - Radio Buttons */}
                  <div className="mb-4">
                    <label className="form-label d-block">
                      Project Status *
                    </label>
                    <div className="d-flex flex-wrap gap-3">
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
                        )
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                      {errorMessage}
                    </div>
                  )}

                  {/* Success Toast/Alert */}
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

                  {/* Save Button */}
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
                        "Save Project"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserAccountWelcome;
