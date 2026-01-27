import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MainRegLog from "../MainRegLog";
import Main from "../Main";
import UserRegistration from "../UserRegistration";
import UserLogin from "../UserLogin";

jest.mock("../Main", () => () => <div data-testid="main-mock">Main</div>);
jest.mock("../UserRegistration", () => () => (
  <div data-testid="user-registration-mock">UserRegistration</div>
));
jest.mock("../UserLogin", () => () => (
  <div data-testid="user-login-mock">UserLogin</div>
));

describe("MainRegLog", () => {
  test("renders Main component", () => {
    render(
      <BrowserRouter>
        <MainRegLog />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("main-mock")).toBeInTheDocument();
  });

  test("renders UserRegistration and UserLogin components", () => {
    render(
      <BrowserRouter>
        <MainRegLog />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("user-registration-mock")).toBeInTheDocument();
    expect(screen.getByTestId("user-login-mock")).toBeInTheDocument();
  });

  test("renders descriptive text for registration and login sections", () => {
    render(
      <BrowserRouter>
        <MainRegLog />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(
        /New to Property Project Manager\? Register for an account/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Already have an account\? Sign in to access your projects/i,
      ),
    ).toBeInTheDocument();
  });

  test("renders security disclaimer text", () => {
    render(
      <BrowserRouter>
        <MainRegLog />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(/Your data is securely stored and encrypted/i),
    ).toBeInTheDocument();
  });

  test("renders main-reglog container and sidebar", () => {
    const { container } = render(
      <BrowserRouter>
        <MainRegLog />
      </BrowserRouter>,
    );

    const mainReglogContainer = container.querySelector(
      ".main-reglog-container",
    );
    expect(mainReglogContainer).toBeInTheDocument();

    const sidebar = container.querySelector(".sidebar");
    expect(sidebar).toBeInTheDocument();
  });
});
