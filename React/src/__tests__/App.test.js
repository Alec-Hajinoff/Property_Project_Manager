import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

jest.mock("../Header", () => () => <div data-testid="header">Header</div>);
jest.mock("../Footer", () => () => <div data-testid="footer">Footer</div>);
jest.mock("../AppRoutes", () => () => <div data-testid="routes">Routes</div>);

describe("App", () => {
  it("renders Header, AppRoutes, and Footer inside a Router", () => {
    render(<App />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("routes")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
