import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Records from "../Records";
import { createRecord } from "../ApiService";

jest.mock("../ApiService", () => ({
  createRecord: jest.fn(),
}));

describe("Records", () => {
  const defaultProps = {
    projectId: 42,
    builderId: 7,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Add Record button", () => {
    render(<Records {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /Add Record/i }),
    ).toBeInTheDocument();
  });

  test("toggles form visibility on button click", () => {
    render(<Records {...defaultProps} />);

    const toggleBtn = screen.getByRole("button", { name: /Add Record/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Short Description/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(
      screen.queryByLabelText(/Short Description/i),
    ).not.toBeInTheDocument();
  });

  test("shows validation error when title or details are empty", async () => {
    render(<Records {...defaultProps} />);

    const toggleBtn = screen.getByRole("button", { name: /Add Record/i });
    fireEvent.click(toggleBtn);

    const saveBtn = screen.getByRole("button", { name: /Save Record/i });
    fireEvent.click(saveBtn);

    expect(
      await screen.findByText(/Title and details are required/i),
    ).toBeInTheDocument();
  });

  test("submits record with title, details, and record type", async () => {
    createRecord.mockResolvedValueOnce({});

    render(<Records {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Add Record/i }));

    fireEvent.change(screen.getByLabelText(/Short Description/i), {
      target: { value: "Test record title" },
    });

    fireEvent.change(screen.getByLabelText(/Detailed Notes/i), {
      target: { value: "Test record details" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save Record/i }));

    await waitFor(() => {
      expect(createRecord).toHaveBeenCalled();
      const formData = createRecord.mock.calls[0][0];
      expect(formData.get("title")).toBe("Test record title");
      expect(formData.get("details")).toBe("Test record details");
      expect(formData.get("project_id")).toBe("42");
      expect(formData.get("builder_id")).toBe("7");
    });

    expect(await screen.findByText(/Record added/i)).toBeInTheDocument();
  });

  test("toggles party fields when checkbox checked", () => {
    render(<Records {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Add Record/i }));

    expect(screen.queryByLabelText(/Type party name/i)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByLabelText(/Would you like to add a party to this record/i),
    );

    expect(screen.getByLabelText(/Type party name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Choose party type/i)).toBeInTheDocument();
  });

  test("toggles attachment fields when checkbox checked", () => {
    render(<Records {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Add Record/i }));

    expect(screen.queryByLabelText(/Select files/i)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByLabelText(
        /Would you like to attach documents to this record/i,
      ),
    );

    expect(screen.getByLabelText(/Select files/i)).toBeInTheDocument();
  });

  test("handles createRecord API error", async () => {
    const error = new Error("API Error");
    createRecord.mockRejectedValueOnce(error);

    render(<Records {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Add Record/i }));

    fireEvent.change(screen.getByLabelText(/Short Description/i), {
      target: { value: "Test" },
    });

    fireEvent.change(screen.getByLabelText(/Detailed Notes/i), {
      target: { value: "Test details" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save Record/i }));

    expect(await screen.findByText(/API Error/i)).toBeInTheDocument();
  });
});
