import React from "react";
import "./UserAccountWelcome.css";
import LogoutComponent from "./LogoutComponent";
import CreateProject from "./CreateProject";
import ExistingProjects from "./ExistingProjects";

function UserAccountWelcome() {
  return (
    <div className="container">
      <div className="d-flex justify-content-end mb-3">
        <LogoutComponent />
      </div>

      <div className="text-center mt-5">
        <h1>Welcome to your dashboard</h1>
      </div>

      <CreateProject />

      <ExistingProjects />
    </div>
  );
}

export default UserAccountWelcome;
