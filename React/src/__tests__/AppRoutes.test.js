import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "../AppRoutes";

jest.mock("../MainRegLog", () => () => (
  <div data-testid="main-reg-log">MainRegLog</div>
));
jest.mock("../RegisteredPage", () => () => (
  <div data-testid="registered-page">RegisteredPage</div>
));
jest.mock("../UserAccountWelcome", () => () => (
  <div data-testid="user-account-welcome">UserAccountWelcome</div>
));
jest.mock("../LogoutComponent", () => () => (
  <div data-testid="logout-component">LogoutComponent</div>
));

describe("AppRoutes", () => {
  it("renders MainRegLog at /", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("main-reg-log")).toBeInTheDocument();
  });

  it("renders RegisteredPage at /RegisteredPage", () => {
    render(
      <MemoryRouter initialEntries={["/RegisteredPage"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("registered-page")).toBeInTheDocument();
  });

  it("renders UserAccountWelcome at /UserAccountWelcome", () => {
    render(
      <MemoryRouter initialEntries={["/UserAccountWelcome"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("user-account-welcome")).toBeInTheDocument();
  });

  it("renders LogoutComponent at /LogoutComponent", () => {
    render(
      <MemoryRouter initialEntries={["/LogoutComponent"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("logout-component")).toBeInTheDocument();
  });
});
