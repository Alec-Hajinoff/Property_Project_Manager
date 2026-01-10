import React from "react";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="container text-center">
      <br />
      <div className="row">
        <p className="footer">
          <em>
            &copy; Copyright 2025 - {currentYear}. All rights reserved. Company
            address: 4 Bridge Gate, London, N21 2AH, United Kingdom. Email
            address:<span> </span>
            <a href="mailto:team@propertyprojectmanager.com">team@propertyprojectmanager.com</a>
          </em>
        </p>
      </div>
    </div>
  );
}

export default Footer;
