import { Routes, Route } from "react-router-dom";
import MainRegLog from "./MainRegLog";
import RegisteredPage from "./RegisteredPage";
import UserAccountWelcome from "./UserAccountWelcome";
import LogoutComponent from "./LogoutComponent";
import React from "react";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainRegLog />} />
      <Route path="RegisteredPage" element={<RegisteredPage />} />
      <Route path="UserAccountWelcome" element={<UserAccountWelcome />} />
      <Route path="LogoutComponent" element={<LogoutComponent />} />
    </Routes>
  );
}
