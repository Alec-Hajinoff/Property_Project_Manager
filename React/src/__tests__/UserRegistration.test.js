import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserRegistration from "../UserRegistration";
import { registerUser } from "../ApiService";

jest.mock("../ApiService", () => ({
  registerUser: jest.fn(),
}));

describe("UserRegistration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders name, email, and password input fields", () => {
    render(
      <BrowserRouter>
        <UserRegistration />
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test("renders Register Account button and password hint", () => {
    render(
      <BrowserRouter>
        <UserRegistration />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("button", { name: /Register Account/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Minimum 8 characters/i)).toBeInTheDocument();
  });

  test("updates form state on input change", () => {
    render(
      <BrowserRouter>
        <UserRegistration />
      </BrowserRouter>,
    );

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("shows validation error when password is less than 8 characters", () => {
    render(
      <BrowserRouter>
        <UserRegistration />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "short" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register Account/i }));

    expect(
      screen.getByText(/Password must be at least 8 characters long/i),
    ).toBeInTheDocument();
  });

  test("submits form and navigates on successful registration", async () => {
    registerUser.mockResolvedValueOnce({ success: true });

    render(
      <BrowserRouter>
        <UserRegistration />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register Account/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
    });
  });

  test("shows error message when registration fails", async () => {
    registerUser.mockResolvedValueOnce({ success: false });

    render(
      <BrowserRouter>
        <UserRegistration />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register Account/i }));

    expect(
      await screen.findByText(/Registration failed. Please try again/i),
    ).toBeInTheDocument();
  });

  test("shows error message when API throws error", async () => {
    const error = new Error("Email already exists");
    registerUser.mockRejectedValueOnce(error);

    render(
      <BrowserRouter>
        <UserRegistration />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register Account/i }));

    expect(
      await screen.findByText(/Email already exists/i),
    ).toBeInTheDocument();
  });

  test("shows loading state while submitting", async () => {
    registerUser.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100),
        ),
    );

    render(
      <BrowserRouter>
        <UserRegistration />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register Account/i }));

    expect(screen.getByText(/Registering/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});