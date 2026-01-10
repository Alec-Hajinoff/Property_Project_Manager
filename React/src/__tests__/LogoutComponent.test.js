import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LogoutComponent from "../LogoutComponent";
import { logoutUser } from "../ApiService";
import { useNavigate } from "react-router-dom";

jest.mock("../ApiService", () => ({
  logoutUser: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("LogoutComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the logout button", () => {
    render(<LogoutComponent />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls logoutUser and navigates to '/' on successful logout", async () => {
    logoutUser.mockResolvedValueOnce();

    render(<LogoutComponent />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(logoutUser).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("logs error message on logout failure", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    logoutUser.mockRejectedValueOnce(new Error("Logout failed"));

    render(<LogoutComponent />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(logoutUser).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Logout failed");
    });

    consoleSpy.mockRestore();
  });
});
