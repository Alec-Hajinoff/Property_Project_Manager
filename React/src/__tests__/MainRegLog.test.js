import React from "react";
import { render, screen } from "@testing-library/react";
import MainRegLog from "../MainRegLog";

jest.mock("../Main", () => () => (
  <div data-testid="main-component">Main Component</div>
));
jest.mock("../UserRegistration", () => () => (
  <div data-testid="user-registration">User Registration</div>
));
jest.mock("../UserLogin", () => () => (
  <div data-testid="user-login">User Login</div>
));

describe("MainRegLog component", () => {
  it("renders the Main component", () => {
    render(<MainRegLog />);
    expect(screen.getByTestId("main-component")).toBeInTheDocument();
  });

  it("renders the UserRegistration component with correct label", () => {
    render(<MainRegLog />);
    expect(
      screen.getByText(/New user\? Please register:/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("user-registration")).toBeInTheDocument();
  });

  it("renders the UserLogin component with correct label", () => {
    render(<MainRegLog />);
    expect(
      screen.getByText(/Existing user\? Please login:/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("user-login")).toBeInTheDocument();
  });

  it("has correct layout structure", () => {
    const { container } = render(<MainRegLog />);
    expect(
      container.querySelector(".container.text-center")
    ).toBeInTheDocument();
    expect(container.querySelector(".row")).toBeInTheDocument();
    expect(container.querySelectorAll(".col-12.col-md-8").length).toBe(1);
    expect(container.querySelectorAll(".col-12.col-md-4").length).toBe(1);
  });
});
