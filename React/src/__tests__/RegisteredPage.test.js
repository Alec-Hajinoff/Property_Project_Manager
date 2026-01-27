import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import RegisteredPage from "../RegisteredPage";
import UserLogin from "../UserLogin";

jest.mock("../UserLogin", () => () => (
  <div data-testid="user-login-mock">UserLogin</div>
));

describe("RegisteredPage", () => {
  test("renders thank you message for registration", () => {
    render(
      <BrowserRouter>
        <RegisteredPage />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(
        /Thank you for registering! Please log in using your credentials/i,
      ),
    ).toBeInTheDocument();
  });

  test("renders registered user login label", () => {
    render(
      <BrowserRouter>
        <RegisteredPage />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Registered user login:/i)).toBeInTheDocument();
  });

  test("renders UserLogin component", () => {
    render(
      <BrowserRouter>
        <RegisteredPage />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("user-login-mock")).toBeInTheDocument();
  });

  test("renders layout with correct bootstrap columns", () => {
    const { container } = render(
      <BrowserRouter>
        <RegisteredPage />
      </BrowserRouter>,
    );

    const cols = container.querySelectorAll("[class*='col-']");
    expect(cols.length).toBeGreaterThanOrEqual(2);

    const col9 = Array.from(cols).find((col) =>
      col.className.includes("col-md-9"),
    );
    const col3 = Array.from(cols).find((col) =>
      col.className.includes("col-md-3"),
    );

    expect(col9).toBeInTheDocument();
    expect(col3).toBeInTheDocument();
  });
});
