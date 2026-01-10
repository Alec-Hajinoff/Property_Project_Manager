import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import PullReadings from "../PullReadings";
import { pullReadingsFunction, pullHistory } from "../ApiService";

// Mock child components
jest.mock("../Thermometer", () => ({ temperature }) => (
  <div data-testid="thermometer">Thermometer: {temperature}</div>
));
jest.mock("../HumidityGauge", () => ({ humidity }) => (
  <div data-testid="humidity-gauge">HumidityGauge: {humidity}</div>
));
jest.mock("../LogoutComponent", () => () => (
  <button data-testid="logout-button">Logout</button>
));
jest.mock("../EmailAlerts", () => () => (
  <div data-testid="email-alerts">EmailAlerts</div>
));
jest.mock("../HistoricGraph", () => ({ historyData }) => (
  <div data-testid="historic-graph">
    HistoricGraph with {historyData.length} points
  </div>
));

// Mock API functions
jest.mock("../ApiService", () => ({
  pullReadingsFunction: jest.fn(),
  pullHistory: jest.fn(),
}));

describe("PullReadings component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSensorData = {
    temperature: 22.5,
    humidity: 55,
    inserted_at: new Date().toISOString(),
  };

  const mockHistoryData = [
    {
      received_at: new Date().toISOString(),
      temperature: 21.0,
      humidity: 50,
    },
    {
      received_at: new Date().toISOString(),
      temperature: 23.0,
      humidity: 60,
    },
  ];

  it("renders loading state initially", async () => {
    pullReadingsFunction.mockResolvedValue({
      success: true,
      data: mockSensorData,
    });
    pullHistory.mockResolvedValue({ success: true, data: mockHistoryData });

    render(<PullReadings />);
    expect(screen.getByText(/Loading sensor data/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByText(/Loading sensor data/i)
      ).not.toBeInTheDocument();
    });
  });

  it("displays sensor data, history table, and graph on success", async () => {
    pullReadingsFunction.mockResolvedValue({
      success: true,
      data: mockSensorData,
    });
    pullHistory.mockResolvedValue({ success: true, data: mockHistoryData });

    render(<PullReadings />);

    await waitFor(() => {
      expect(screen.getByTestId("thermometer")).toBeInTheDocument();
      expect(screen.getByTestId("humidity-gauge")).toBeInTheDocument();
      expect(screen.getByTestId("email-alerts")).toBeInTheDocument();
      expect(screen.getByTestId("historic-graph")).toHaveTextContent(
        "2 points"
      );
    });

    expect(
      screen.getByText(
        (content, element) =>
          element.tagName.toLowerCase() === "p" && content.includes("22.5")
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        (content, element) =>
          element.tagName.toLowerCase() === "p" && content.includes("55")
      )
    ).toBeInTheDocument();

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("shows fallback message when history data is empty", async () => {
    pullReadingsFunction.mockResolvedValue({
      success: true,
      data: mockSensorData,
    });
    pullHistory.mockResolvedValue({ success: true, data: [] });

    render(<PullReadings />);

    await waitFor(() => {
      expect(
        screen.getByText(/Historic readings will appear here/i)
      ).toBeInTheDocument();
    });
  });

  it("shows error messages when both API calls fail", async () => {
    pullReadingsFunction.mockResolvedValue({ success: false });
    pullHistory.mockResolvedValue({ success: false });

    render(<PullReadings />);

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts[0]).toHaveTextContent("Failed to load sensor data");
      expect(alerts[1]).toHaveTextContent("Failed to load historic readings");
    });
  });

  it("handles partial failure: sensor success, history failure", async () => {
    pullReadingsFunction.mockResolvedValue({
      success: true,
      data: mockSensorData,
    });
    pullHistory.mockResolvedValue({ success: false });

    render(<PullReadings />);

    await waitFor(() => {
      expect(screen.getByTestId("thermometer")).toBeInTheDocument();
      expect(screen.getByTestId("humidity-gauge")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to load historic readings")
      ).toBeInTheDocument();
    });
  });

  it("disables Refresh button while loading", async () => {
    let resolveFetch;
    pullReadingsFunction.mockImplementation(
      () => new Promise((resolve) => (resolveFetch = resolve))
    );
    pullHistory.mockResolvedValue({ success: true, data: mockHistoryData });

    render(<PullReadings />);
    const refreshButton = screen.getByRole("button", { name: /Refresh/i });
    expect(refreshButton).toBeDisabled();

    resolveFetch({ success: true, data: mockSensorData });
    await waitFor(() => expect(refreshButton).not.toBeDisabled());
  });

  it("refreshes data when Refresh button is clicked", async () => {
    pullReadingsFunction.mockResolvedValue({
      success: true,
      data: mockSensorData,
    });
    pullHistory.mockResolvedValue({ success: true, data: mockHistoryData });

    render(<PullReadings />);
    await waitFor(() => screen.getByRole("button", { name: /Refresh/i }));

    fireEvent.click(screen.getByRole("button", { name: /Refresh/i }));

    await waitFor(() => {
      expect(pullReadingsFunction).toHaveBeenCalledTimes(2);
      expect(pullHistory).toHaveBeenCalledTimes(2);
    });
  });
});
