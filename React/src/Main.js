import React from "react";
import "./Main.css";

function Main() {
  return (
    <div className="main-container">
      <p className="app-subtitle">
        Property Project Manager is a lightweight workflow system designed for
        builders to manage building projects. Built with modern web
        technologies, this application helps builders oversee their pipeline of
        jobs while maintaining a definitive system of record for agreements,
        changes, approvals, and deliverables.
      </p>

      <div className="value-points-container">
        <div className="value-point">
          <h3 className="value-point-title">
            <i className="bi bi-eye-fill"></i> Clarity & Visibility
          </h3>
          <p className="value-point-description">
            See the status of all active jobs at a glance, from enquiry to
            handover. Gain complete visibility across multiple concurrent
            projects with an intuitive dashboard.
          </p>
        </div>

        <div className="value-point">
          <h3 className="value-point-title">
            <i className="bi bi-shield-check"></i> Defensible Records
          </h3>
          <p className="value-point-description">
            Every agreement, change, approval, and key event is captured in a
            structured timeline, creating an auditable record that protects
            builders if disputes arise.
          </p>
        </div>

        <div className="value-point">
          <h3 className="value-point-title">
            <i className="bi bi-chat-left-text"></i> Reduced Ambiguity
          </h3>
          <p className="value-point-description">
            Centralise decisions and approvals in one place, eliminating
            reliance on informal communication channels like WhatsApp, email, or
            verbal agreements.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Main;
