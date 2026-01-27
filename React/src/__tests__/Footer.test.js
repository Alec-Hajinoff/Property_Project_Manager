import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer", () => {
  test("renders copyright range, current year and mailto link", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(
        new RegExp(`Copyright\\s+2025\\s*-\\s*${currentYear}`, "i"),
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/4 Bridge Gate/i)).toBeInTheDocument();

    const mailLink = screen.getByRole("link", {
      name: /team@propertyprojectmanager\.com/i,
    });
    expect(mailLink).toBeInTheDocument();
    expect(mailLink).toHaveAttribute(
      "href",
      "mailto:team@propertyprojectmanager.com",
    );
  });
});
