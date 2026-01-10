import React from "react";
import { render, screen } from "@testing-library/react";
import HistoricGraph from "../HistoricGraph";

// Fixed timestamp: Nov 5, 2025 06:00:00 GMT
const MOCK_NOW = new Date("2025-11-05T06:00:00Z").getTime();

beforeAll(() => {
  jest.spyOn(Date, "now").mockImplementation(() => MOCK_NOW);
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Helper to create entries relative to MOCK_NOW
const makeEntry = (offsetMinutes, temperature, humidity) => {
  const ts = new Date(MOCK_NOW - offsetMinutes * 60 * 1000).toISOString();
  return { received_at: ts, temperature, humidity };
};

describe("HistoricGraph", () => {
  test("renders header and subtitle", () => {
    render(<HistoricGraph historyData={[]} />);
    expect(screen.getByText("24h Trends")).toBeInTheDocument();
    expect(screen.getByText("Showing last 24 hours")).toBeInTheDocument();
  });

  test("shows empty state when no data is passed", () => {
    render(<HistoricGraph historyData={[]} />);
    expect(
      screen.getByText("No temperature history available")
    ).toBeInTheDocument();
    expect(
      screen.getByText("No humidity history available")
    ).toBeInTheDocument();
  });

  test("shows empty state when data is older than 24h", () => {
    const oldEntry = makeEntry(1441, 20, 50); // 1441 minutes ago
    render(<HistoricGraph historyData={[oldEntry]} />);
    expect(
      screen.getByText("No temperature history available")
    ).toBeInTheDocument();
    expect(
      screen.getByText("No humidity history available")
    ).toBeInTheDocument();
  });

  test("renders SVG charts when valid data is passed", () => {
    const entries = [
      makeEntry(60, 21.5, 45),
      makeEntry(30, 22.0, 50),
      makeEntry(10, 23.0, 55),
    ];
    const { container } = render(<HistoricGraph historyData={entries} />);

    // Temperature chart
    expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();
    expect(
      screen.queryByText("No temperature history available")
    ).not.toBeInTheDocument();

    // Humidity chart
    expect(screen.getByText("Humidity (%)")).toBeInTheDocument();
    expect(
      screen.queryByText("No humidity history available")
    ).not.toBeInTheDocument();

    // SVG elements
    expect(container.querySelectorAll("svg").length).toBe(2);

    // Axis labels
    const labels = screen.getAllByText(/^\d{1,2}:\d{2}:\d{2}$/); // time strings
    expect(labels.length).toBe(4);
  });

  test("sets aria-hidden correctly based on data presence", () => {
    const entries = [makeEntry(5, 20, 40)];
    render(<HistoricGraph historyData={entries} />);
    const tempChart = screen
      .getByText("Temperature (°C)")
      .closest(".temperature-chart");
    const humChart = screen
      .getByText("Humidity (%)")
      .closest(".humidity-chart");

    expect(tempChart).toHaveAttribute("aria-hidden", "false");
    expect(humChart).toHaveAttribute("aria-hidden", "false");
  });
});
