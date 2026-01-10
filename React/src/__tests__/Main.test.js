import React from "react";
import { render, screen } from "@testing-library/react";
import Main from "../Main";

describe("Main component", () => {
  it("renders the first paragraph with sensor description", () => {
    render(<Main />);
    expect(
      screen.getByText(/Readings From Sensors is an IoT web application/i)
    ).toBeInTheDocument();
  });

  it("renders the second paragraph with platform details", () => {
    render(<Main />);
    expect(
      screen.getByText(/The platform is built with a React frontend/i)
    ).toBeInTheDocument();
  });

  it("renders both paragraphs inside a div", () => {
    const { container } = render(<Main />);
    const div = container.querySelector("div");
    const paragraphs = container.querySelectorAll("p");
    expect(div).toBeInTheDocument();
    expect(paragraphs.length).toBe(2);
  });
});
