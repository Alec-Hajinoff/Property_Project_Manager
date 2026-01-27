import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserLogin from "../UserLogin";
import { loginUser } from "../ApiService";

jest.mock("../ApiService", () => ({
  loginUser: jest.fn(),
}));

describe("UserLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders email and password input fields", () => {
    render(
      <BrowserRouter>
        <UserLogin />
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test("renders Sign In button and Forgot password link", () => {
    render(
      <BrowserRouter>
        <UserLogin />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("button", { name: /Sign In/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Forgot your password/i }),
    ).toBeInTheDocument();
  });

  test("updates form state on input change", () => {
    render(
      <BrowserRouter>
        <UserLogin />
      </BrowserRouter>,
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("submits form and navigates on successful login", async () => {
    loginUser.mockResolvedValueOnce({ status: "success" });

    render(
      <BrowserRouter>
        <UserLogin />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  test("shows error message when login fails", async () => {
    loginUser.mockResolvedValueOnce({ status: "failed" });

    render(
      <BrowserRouter>
        <UserLogin />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(
      await screen.findByText(/Sign in failed. Please check your credentials/i),
    ).toBeInTheDocument();
  });

  test("shows error message when API throws error", async () => {
    const error = new Error("Network error");
    loginUser.mockRejectedValueOnce(error);

    render(
      <BrowserRouter>
        <UserLogin />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(await screen.findByText(/Network error/i)).toBeInTheDocument();
  });

  test("shows loading state while submitting", async () => {
    loginUser.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ status: "success" }), 100),
        ),
    );

    render(
      <BrowserRouter>
        <UserLogin />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(screen.getByText(/Signing in/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
