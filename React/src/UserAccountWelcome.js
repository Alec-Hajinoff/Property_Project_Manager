import React from "react";
import "./UserAccountWelcome.css";
import LogoutComponent from "./LogoutComponent";
import CreateProject from "./CreateProject";
import ExistingProjects from "./ExistingProjects";

function UserAccountWelcome() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Property Project Manager</h1>
          <LogoutComponent />
        </div>

        <div className="dashboard-welcome">
          <h2 className="welcome-heading">Welcome to your dashboard</h2>
          <p className="welcome-subheading">
            Manage your building projects, track progress, and maintain
            defensible records
          </p>
        </div>

        <div className="components-container">
          <CreateProject />
          <ExistingProjects />
        </div>
      </div>
    </div>
  );
}

export default UserAccountWelcome;
