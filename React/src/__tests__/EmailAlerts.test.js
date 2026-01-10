// EmailAlerts.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmailAlerts from "../EmailAlerts";
import {
  getAlertThresholds,
  setAlertThresholds,
  deleteAlertThresholds,
} from "../ApiService";

jest.mock("../ApiService");

describe("EmailAlerts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads existing thresholds on mount", async () => {
    getAlertThresholds.mockResolvedValue({
      success: true,
      data: {
        maxTemp: "35",
        minTemp: "5",
        maxHumidity: "80",
        minHumidity: "20",
      },
    });

    render(<EmailAlerts />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Maximum temperature/i)).toHaveValue(35);
      expect(screen.getByLabelText(/Minimum temperature/i)).toHaveValue(5);
      expect(screen.getByLabelText(/Maximum humidity/i)).toHaveValue(80);
      expect(screen.getByLabelText(/Minimum humidity/i)).toHaveValue(20);
    });
  });

  test("handles input changes", async () => {
    render(<EmailAlerts />);
    const maxTempInput = screen.getByLabelText(/Maximum temperature/i);
    fireEvent.change(maxTempInput, { target: { value: "42" } });
    expect(maxTempInput).toHaveValue(42);
  });

  test("submits thresholds successfully", async () => {
    setAlertThresholds.mockResolvedValue({ success: true });
    render(<EmailAlerts />);

    fireEvent.change(screen.getByLabelText(/Maximum temperature/i), {
      target: { value: "42" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save Alerts/i }));

    await waitFor(() => {
      expect(setAlertThresholds).toHaveBeenCalledWith({
        maxTemp: "42",
        minTemp: "",
        maxHumidity: "",
        minHumidity: "",
      });
      expect(
        screen.getByText(/Alert thresholds saved successfully/i)
      ).toBeInTheDocument();
    });
  });

  test("shows error on failed submit", async () => {
    setAlertThresholds.mockRejectedValue(new Error("Network error"));
    render(<EmailAlerts />);

    fireEvent.click(screen.getByRole("button", { name: /Save Alerts/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to save alert thresholds/i)
      ).toBeInTheDocument();
    });
  });

  test("deletes thresholds successfully", async () => {
    deleteAlertThresholds.mockResolvedValue({ success: true });
    render(<EmailAlerts />);

    fireEvent.click(screen.getByRole("button", { name: /Delete All Alerts/i }));

    await waitFor(() => {
      expect(deleteAlertThresholds).toHaveBeenCalled();
      expect(
        screen.getByText(/Alert thresholds deleted successfully/i)
      ).toBeInTheDocument();
    });
  });

  test("shows error on failed delete", async () => {
    deleteAlertThresholds.mockRejectedValue(new Error("Delete failed"));
    render(<EmailAlerts />);

    fireEvent.click(screen.getByRole("button", { name: /Delete All Alerts/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to delete alert thresholds/i)
      ).toBeInTheDocument();
    });
  });
});
