import React from "react";
import "./ExistingRecords.css";

function ExistingRecords({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-3">
        <small className="text-muted">No records yet</small>
      </div>
    );
  }

  const formatPartyInfo = (party) => {
    return `${party.name} (${party.type})`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "";
    }
  };

  const openAttachment = (attachment) => {
    if (!attachment.file_data) return;

    const mimeTypes = {
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      pdf: "application/pdf",
      txt: "text/plain",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    const fileExtension = attachment.file_type.toLowerCase();
    const mimeType = mimeTypes[fileExtension] || "application/octet-stream";

    const binaryData = atob(attachment.file_data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    const newWindow = window.open(blobUrl, "_blank");
    if (!newWindow) {
      alert("Please allow pop-ups to view attachments");
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  const getFileIcon = (fileType) => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "📄";
    if (
      type.includes("jpeg") ||
      type.includes("jpg") ||
      type.includes("png") ||
      type.includes("gif")
    )
      return "🖼️";
    if (type.includes("doc") || type.includes("docx")) return "📝";
    if (type.includes("txt")) return "📋";
    return "📎";
  };

  return (
    <div className="existing-records mt-3">
      <h6 className="mb-2">Project Timeline</h6>
      <div className="records-timeline">
        {records.map((record) => (
          <div key={record.id} className="record-item mb-2">
            <div className="card">
              <div className="card-body p-2">
                <div className="d-flex justify-content-between align-items-start">
                  <div style={{ flex: 1 }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-info">
                        {record.record_type}
                      </span>
                      <small className="text-muted">
                        {formatDate(record.record_datetime)}
                      </small>
                    </div>
                    <h6 className="mb-1">{record.title}</h6>
                    {record.details && (
                      <p className="mb-2 small text-muted">{record.details}</p>
                    )}

                    {record.attachments && record.attachments.length > 0 && (
                      <div className="attachments-section mt-2">
                        <div className="d-flex align-items-center mb-1">
                          <small className="text-muted fw-medium">
                            Attachments:
                          </small>
                        </div>
                        <div className="attachments-list">
                          {record.attachments.map((attachment, index) => (
                            <div
                              key={`attachment-${record.id}-${
                                attachment.id || index
                              }`}
                              className="attachment-item d-flex align-items-center mb-1"
                            >
                              <button
                                className="btn btn-link btn-sm p-0 text-decoration-none text-start"
                                onClick={() => openAttachment(attachment)}
                                title={`Click to view ${attachment.file_name}`}
                                style={{ cursor: "pointer" }}
                              >
                                <span className="me-1">
                                  {getFileIcon(attachment.file_type)}
                                </span>
                                <small className="text-primary">
                                  {attachment.file_name}
                                </small>
                                <small className="text-muted ms-2">
                                  ({attachment.file_type})
                                </small>
                                {attachment.uploaded_at && (
                                  <small className="text-muted ms-2">
                                    • {formatDate(attachment.uploaded_at)}
                                  </small>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.parties && record.parties.length > 0 && (
                      <div className="parties-section mt-2">
                        <div className="parties-list">
                          {record.parties.map((party, index) => (
                            <div
                              key={`${record.id}-${party.id || index}`}
                              className="party-item mb-1"
                            >
                              <div className="d-flex align-items-start">
                                <div className="flex-grow-1">
                                  <small className="text-primary fw-medium">
                                    {formatPartyInfo(party)}
                                  </small>
                                  {party.notes && (
                                    <div className="party-notes">
                                      <small className="text-muted d-block">
                                        {party.notes}
                                      </small>
                                    </div>
                                  )}
                                  <div className="party-meta d-flex gap-2">
                                    {party.created_at && (
                                      <small className="text-muted">
                                        Party created:{" "}
                                        {formatDate(party.created_at)}
                                      </small>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {index < record.parties.length - 1 && (
                                <hr className="my-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExistingRecords;
