import React from "react";
import "./MainRegLog.css";
import Main from "./Main.js";
import UserRegistration from "./UserRegistration.js";
import UserLogin from "./UserLogin.js";

function MainRegLog() {
  return (
    <div className="main-reglog-container">
      <div className="container">
        <div className="content-wrapper">
          <div className="row g-0">
            <div className="col-12 col-md-9">
              <Main />
            </div>
            <div className="col-12 col-md-3 sidebar">
              <p className="text-muted small mb-3">
                New to Property Project Manager? Register for an account to
                start managing your projects.
              </p>
              <UserRegistration />

              <p className="text-muted small mb-3 mt-4">
                Already have an account? Sign in to access your projects.
              </p>
              <UserLogin />

              <div className="mt-4 pt-3 border-top">
                <p className="text-muted small">
                  <i className="bi bi-shield-check me-1"></i>
                  Your data is securely stored and encrypted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainRegLog;
