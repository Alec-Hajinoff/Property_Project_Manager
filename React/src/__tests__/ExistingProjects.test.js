import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExistingProjects from "../ExistingProjects";
import { existingProjects } from "../ApiService";

jest.mock("../ApiService", () => ({
  existingProjects: jest.fn(),
}));

jest.mock("../Records", () => () => (
  <div data-testid="RecordsMock">RecordsMock</div>
));
jest.mock("../ExistingRecords", () => () => (
  <div data-testid="ExistingRecordsMock">ExistingRecordsMock</div>
));

describe("ExistingProjects", () => {
  const project = {
    id: 42,
    builder_id: 7,
    project_address: "123 Main St",
    status: "Active",
    created_at: "2020-01-01T00:00:00Z",
    records: [{ id: 1, name: "Rec1" }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading, then renders projects list", async () => {
    existingProjects.mockResolvedValueOnce({ projects: [project] });

    render(<ExistingProjects />);

    expect(screen.getByText(/Loading projects.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(project.project_address)).toBeInTheDocument();
    });

    expect(screen.getByText(/Your existing projects/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /refresh/i }),
    ).toBeInTheDocument();
  });

  test("expands project to show details and child components", async () => {
    existingProjects.mockResolvedValueOnce({ projects: [project] });

    render(<ExistingProjects />);

    await waitFor(() => screen.getByText(project.project_address));

    const showButtons = screen.getAllByRole("button", {
      name: /show details|hide details/i,
    });
    const firstShowBtn = showButtons[0];
    fireEvent.click(firstShowBtn);

    expect(await screen.findByText(/Project ID:/i)).toHaveTextContent(
      `Project ID: ${project.id}`,
    );

    expect(screen.getByTestId("RecordsMock")).toBeInTheDocument();
    expect(screen.getByTestId("ExistingRecordsMock")).toBeInTheDocument();
  });

  test("clicking refresh triggers reload (calls existingProjects again)", async () => {
    existingProjects.mockResolvedValue({ projects: [project] });

    render(<ExistingProjects />);

    await waitFor(() => screen.getByText(project.project_address));
    expect(existingProjects).toHaveBeenCalledTimes(1);

    const refreshBtn = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(existingProjects).toHaveBeenCalledTimes(2);
    });
  });
});
