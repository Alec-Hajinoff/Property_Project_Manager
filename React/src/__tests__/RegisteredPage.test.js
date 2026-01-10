import React from "react";
import { render, screen } from "@testing-library/react";
import RegisteredPage from "../RegisteredPage";

jest.mock("../UserLogin", () => () => (
  <div data-testid="user-login">UserLogin Component</div>
));

describe("RegisteredPage component", () => {
  it("renders the registration confirmation message", () => {
    render(<RegisteredPage />);
    expect(
      screen.getByText(
        /Thank you for registering! Please log in using your credentials/i
      )
    ).toBeInTheDocument();
  });

  it("renders the login prompt and UserLogin component", () => {
    render(<RegisteredPage />);
    expect(screen.getByText(/Registered user login:/i)).toBeInTheDocument();
    expect(screen.getByTestId("user-login")).toBeInTheDocument();
  });

  it("has correct layout structure", () => {
    const { container } = render(<RegisteredPage />);
    expect(
      container.querySelector(".container.text-center")
    ).toBeInTheDocument();
    expect(container.querySelector(".row")).toBeInTheDocument();
    expect(container.querySelectorAll(".col-12.col-md-8").length).toBe(1);
    expect(container.querySelectorAll(".col-12.col-md-4").length).toBe(1);
  });
});
