import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css";
import { loginUser } from "./ApiService";

function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
    setLoading(true);
    try {
      const data = await loginUser(formData);
      if (data.status === "success") {
        navigate("/UserAccountWelcome");
      } else {
        setErrorMessage("Sign in failed. Please check your credentials.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="yourEmailLogin" className="form-label">
          Email Address
        </label>
        <input
          autoComplete="off"
          type="email"
          pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
          className="form-control"
          id="yourEmailLogin"
          name="email"
          required
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="yourPasswordLogin" className="form-label">
          Password
        </label>
        <input
          autoComplete="off"
          type="password"
          className="form-control"
          id="yourPasswordLogin"
          name="password"
          required
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      {errorMessage && (
        <div className="login-error">
          <i className="bi bi-exclamation-triangle me-1"></i>
          {errorMessage}
        </div>
      )}

      <button type="submit" className="login-btn mt-3" disabled={loading}>
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Signing in...
          </>
        ) : (
          <>
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Sign In
          </>
        )}
      </button>

      <div className="forgot-password">
        <a href="/forgot-password">Forgot your password?</a>
      </div>
    </form>
  );
}

export default UserLogin;
