import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "../Header";

jest.mock("../Property_Project_Manager_Logo.png", () => "logo.png");

describe("Header", () => {
  test("renders logo image with correct attributes", () => {
    render(<Header />);

    const img = screen.getByAltText(/A company logo/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "logo.png");
    expect(img).toHaveAttribute("title", "A company logo");

    expect(img).toHaveAttribute("id", "logo");
  });
});
