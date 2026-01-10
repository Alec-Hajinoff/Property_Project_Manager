import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer Component", () => {
  test("renders footer with correct static text", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Company address: 4 Bridge Gate, London/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /team@readingsfromsensors.com/i })
    ).toHaveAttribute("href", "mailto:team@readingsfromsensors.com");
  });

  test("displays the correct current year", () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    expect(
      screen.getByText(new RegExp(`Copyright 2024 - ${currentYear}`))
    ).toBeInTheDocument();
  });
});
