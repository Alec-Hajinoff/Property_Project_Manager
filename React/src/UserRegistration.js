import React, { useState } from "react";
import "./UserRegistration.css";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./ApiService";

function UserRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }
    setLoading(true);
    try {
      const data = await registerUser(formData);
      if (data.success) {
        navigate("/RegisteredPage");
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Full Name
        </label>
        <input
          autoComplete="off"
          type="text"
          pattern="[a-zA-Z ]+"
          className="form-control"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Your full name"
        />
      </div>
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <input
          autoComplete="off"
          type="email"
          pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
          className="form-control"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Email address"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          autoComplete="off"
          type="password"
          className="form-control"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="8"
          placeholder="Choose a password"
        />
        <div className="password-hint">Minimum 8 characters</div>
      </div>

      {errorMessage && (
        <div className="error-message">
          <i className="bi bi-exclamation-triangle me-1"></i>
          {errorMessage}
        </div>
      )}

      <button type="submit" className="btn-register mt-3" disabled={loading}>
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Registering...
          </>
        ) : (
          <>
            <i className="bi bi-person-plus me-2"></i>
            Register Account
          </>
        )}
      </button>
    </form>
  );
}

export default UserRegistration;
