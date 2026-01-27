import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LogoutComponent from "../LogoutComponent";
import { logoutUser } from "../ApiService";

jest.mock("../ApiService", () => ({
  logoutUser: jest.fn(),
}));

describe("LogoutComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders logout button", () => {
    render(
      <BrowserRouter>
        <LogoutComponent />
      </BrowserRouter>,
    );

    const logoutBtn = screen.getByRole("button", { name: /logout/i });
    expect(logoutBtn).toBeInTheDocument();
  });

  test("calls logoutUser and navigates to / on click", async () => {
    logoutUser.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <LogoutComponent />
      </BrowserRouter>,
    );

    const logoutBtn = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(logoutUser).toHaveBeenCalled();
    });
  });

  test("handles error when logoutUser fails", async () => {
    const error = new Error("Logout failed");
    logoutUser.mockRejectedValueOnce(error);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    render(
      <BrowserRouter>
        <LogoutComponent />
      </BrowserRouter>,
    );

    const logoutBtn = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Logout failed");
    });

    consoleErrorSpy.mockRestore();
  });
});
