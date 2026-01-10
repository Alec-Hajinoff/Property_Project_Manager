import React from "react";
import { render, screen } from "@testing-library/react";
import HumidityGauge from "../HumidityGauge";

describe("HumidityGauge Component", () => {
  test("renders 0% and 100% labels", () => {
    render(<HumidityGauge humidity={50} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  test("rotates needle correctly for 0% humidity", () => {
    render(<HumidityGauge humidity={0} />);
    const needle = document.querySelector(".needle");
    expect(needle).not.toBeNull();
    expect(needle.style.transform).toBe("rotate(-90deg)");
  });

  test("rotates needle correctly for 100% humidity", () => {
    render(<HumidityGauge humidity={100} />);
    const needle = document.querySelector(".needle");
    expect(needle).not.toBeNull();
    expect(needle.style.transform).toBe("rotate(90deg)");
  });

  test("rotates needle correctly for 50% humidity", () => {
    render(<HumidityGauge humidity={50} />);
    const needle = document.querySelector(".needle");
    expect(needle).not.toBeNull();
    expect(needle.style.transform).toBe("rotate(0deg)");
  });
});
