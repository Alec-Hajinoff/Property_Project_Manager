import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserAccountWelcome from "../UserAccountWelcome";
import LogoutComponent from "../LogoutComponent";
import CreateProject from "../CreateProject";
import ExistingProjects from "../ExistingProjects";

jest.mock("../LogoutComponent", () => () => (
  <div data-testid="logout-component-mock">LogoutComponent</div>
));

jest.mock("../CreateProject", () => () => (
  <div data-testid="create-project-mock">CreateProject</div>
));

jest.mock("../ExistingProjects", () => () => (
  <div data-testid="existing-projects-mock">ExistingProjects</div>
));

describe("UserAccountWelcome", () => {
  test("renders welcome heading", () => {
    render(
      <BrowserRouter>
        <UserAccountWelcome />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Welcome to your dashboard/i)).toBeInTheDocument();
  });

  test("renders welcome subheading with project management description", () => {
    render(
      <BrowserRouter>
        <UserAccountWelcome />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(
        /Manage your building projects, track progress, and maintain/i,
      ),
    ).toBeInTheDocument();
  });

  test("renders LogoutComponent", () => {
    render(
      <BrowserRouter>
        <UserAccountWelcome />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("logout-component-mock")).toBeInTheDocument();
  });

  test("renders CreateProject component", () => {
    render(
      <BrowserRouter>
        <UserAccountWelcome />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("create-project-mock")).toBeInTheDocument();
  });

  test("renders ExistingProjects component", () => {
    render(
      <BrowserRouter>
        <UserAccountWelcome />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("existing-projects-mock")).toBeInTheDocument();
  });

  test("renders all main container divs with correct classes", () => {
    const { container } = render(
      <BrowserRouter>
        <UserAccountWelcome />
      </BrowserRouter>,
    );

    expect(container.querySelector(".dashboard-container")).toBeInTheDocument();
    expect(container.querySelector(".dashboard-content")).toBeInTheDocument();
    expect(container.querySelector(".dashboard-header")).toBeInTheDocument();
    expect(container.querySelector(".dashboard-welcome")).toBeInTheDocument();
    expect(
      container.querySelector(".components-container"),
    ).toBeInTheDocument();
  });
});
