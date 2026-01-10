import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "../AppRoutes";
import React from "react";

describe("App Component", () => {
  test("renders MainRegLog component", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText(/Please register:/i)).toBeInTheDocument();
  });

  test("renders RegisteredPage component", () => {
    render(
      <MemoryRouter initialEntries={["/RegisteredPage"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/Thank you for registering!/i)).toBeInTheDocument();
  });

  test("renders PullReadings component when on /PullReadings path", () => {
    render(
      <MemoryRouter initialEntries={["/PullReadings"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/Latest Sensor Readings:/i)).toBeInTheDocument();
  });

  test("renders LogoutComponent component when on /LogoutComponent path", () => {
    render(
      <MemoryRouter initialEntries={["/LogoutComponent"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });
});
