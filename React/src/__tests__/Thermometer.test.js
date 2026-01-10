import React from "react";
import { render } from "@testing-library/react";
import Thermometer from "../Thermometer";

describe("Thermometer component", () => {
  it("renders with correct fill height for a normal temperature", () => {
    const { container } = render(<Thermometer temperature={15} />);
    const fill = container.querySelector(".stem-fill");
    expect(fill.style.height).toBe("50%");
  });

  it("caps fill height at 100% for high temperature", () => {
    const { container } = render(<Thermometer temperature={100} />);
    const fill = container.querySelector(".stem-fill");
    expect(fill.style.height).toBe("100%");
  });

  it("renders 0% fill for zero temperature", () => {
    const { container } = render(<Thermometer temperature={0} />);
    const fill = container.querySelector(".stem-fill");
    expect(fill.style.height).toBe("0%");
  });

  it("renders scale labels correctly", () => {
    const { getByText } = render(<Thermometer temperature={20} />);
    expect(getByText("30°C")).toBeInTheDocument();
    expect(getByText("0°C")).toBeInTheDocument();
  });
});
