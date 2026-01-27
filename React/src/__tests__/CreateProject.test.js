import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateProject from "../CreateProject";
import { createProject } from "../ApiService";

jest.mock("../ApiService", () => ({
  createProject: jest.fn(),
}));

describe("CreateProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows validation error when project address is empty", () => {
    render(<CreateProject />);

    const toggleBtn = screen.getByRole("button", { name: /show form/i });
    fireEvent.click(toggleBtn);

    const saveBtn = screen.getByRole("button", { name: /save project/i });
    fireEvent.click(saveBtn);

    expect(
      screen.getByText(/Project address is required/i),
    ).toBeInTheDocument();
  });

  test("submits form, calls createProject with correct payload, hides form and resets inputs", async () => {
    createProject.mockResolvedValueOnce({});
    render(<CreateProject />);

    const toggleBtn = screen.getByRole("button", { name: /show form/i });
    fireEvent.click(toggleBtn);

    const addressInput = screen.getByLabelText(/Project Address \*/i);
    fireEvent.change(addressInput, { target: { value: "123 Main St" } });

    const activeRadio = screen.getByLabelText("Active");
    fireEvent.click(activeRadio);

    const saveBtn = screen.getByRole("button", { name: /save project/i });
    fireEvent.click(saveBtn);

    await waitFor(() =>
      expect(createProject).toHaveBeenCalledWith({
        project_address: "123 Main St",
        status: "Active",
      }),
    );

    expect(
      screen.getByRole("button", { name: /show form/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show form/i }));
    expect(screen.getByLabelText(/Project Address \*/i)).toHaveValue("");
    expect(screen.getByLabelText("Enquiry")).toBeChecked();
  });
});
