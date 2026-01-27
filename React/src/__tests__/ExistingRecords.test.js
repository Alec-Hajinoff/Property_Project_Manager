import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExistingRecords from "../ExistingRecords";

describe("ExistingRecords", () => {
  const sampleRecord = {
    id: 1,
    record_type: "Inspection",
    record_datetime: "2021-06-15T12:00:00Z",
    title: "Initial inspection",
    details: "Some detailed notes",
    parties: [
      {
        id: 10,
        name: "Alice",
        type: "Contractor",
        notes: "Primary contact",
        created_at: "2021-06-16T00:00:00Z",
      },
    ],
    attachments: [
      {
        id: 100,
        file_name: "report.pdf",
        file_type: "pdf",
        uploaded_at: "2021-06-16T01:00:00Z",
      },
    ],
  };

  test("renders empty message when there are no records", () => {
    render(<ExistingRecords records={[]} />);
    expect(screen.getByText(/No records yet/i)).toBeInTheDocument();
  });

  test("renders record fields, parties and attachments (without opening attachment)", async () => {
    render(<ExistingRecords records={[sampleRecord]} />);

    const badge = screen.getByText(/Inspection/i, {
      selector: ".record-type-badge",
    });
    expect(badge).toBeInTheDocument();

    expect(screen.getByText(/Initial inspection/i)).toBeInTheDocument();

    const expectedRecordDate = new Date(
      sampleRecord.record_datetime,
    ).toLocaleDateString();
    expect(
      screen.getByText(new RegExp(expectedRecordDate)),
    ).toBeInTheDocument();

    expect(screen.getByText(/Alice \(Contractor\)/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /report\.pdf/i }),
    ).toBeInTheDocument();
  });

  test("clicking attachment with file_data opens a blob URL and revokes it", async () => {
    const recordWithData = JSON.parse(JSON.stringify(sampleRecord));
    recordWithData.attachments[0].file_data = btoa("abc");

    const mockCreateObjectURL = jest
      .fn()
      .mockReturnValue("blob:http://test/blobid");
    const mockRevokeObjectURL = jest.fn();
    const mockWindowOpen = jest.fn().mockReturnValue({});

    global.atob =
      global.atob || ((s) => Buffer.from(s, "base64").toString("binary"));
    global.URL = global.URL || {};
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    window.open = mockWindowOpen;

    jest.useFakeTimers();

    render(<ExistingRecords records={[recordWithData]} />);

    const attachBtn = screen.getByRole("button", { name: /report\.pdf/i });
    fireEvent.click(attachBtn);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockWindowOpen).toHaveBeenCalledWith(
        "blob:http://test/blobid",
        "_blank",
      );
    });

    jest.runAllTimers();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:http://test/blobid");

    jest.useRealTimers();
  });
});
