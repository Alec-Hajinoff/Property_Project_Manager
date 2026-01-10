import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "../Header";

describe("Header Component", () => {
  test("renders the company logo with correct alt and title", () => {
    render(<Header />);

    const logo = screen.getByRole("img", { name: /a company logo/i });

    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("alt", "A company logo");
    expect(logo).toHaveAttribute("title", "A company logo");
    expect(logo).toHaveAttribute("id", "logo");
    expect(logo).toHaveAttribute(
      "src",
      expect.stringMatching(/Readings_From_Sensors_Logo\.png$/)
    );
  });
});
