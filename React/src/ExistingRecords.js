import React from "react";
import "./ExistingRecords.css";

function ExistingRecords({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="empty-records">
        <small>No records yet</small>
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
    <div className="existing-records">
      <div className="records-timeline">
        {records.map((record) => (
          <div key={record.id} className="record-item">
            <div className="record-card">
              <div className="record-header">
                <span className="record-type-badge">{record.record_type}</span>
                <span className="record-date">
                  Record created: {formatDate(record.record_datetime)}
                </span>
              </div>

              <div className="record-field">
                <span className="value-label">Record Type:</span>
                <span className="value-content">{record.record_type}</span>
              </div>

              <div className="record-field">
                <span className="value-label">Short Description:</span>
                <span className="value-content">{record.title}</span>
              </div>

              {record.details && (
                <div className="record-field">
                  <span className="value-label">Detailed Notes:</span>
                  <span className="value-content">{record.details}</span>
                </div>
              )}

              {record.parties && record.parties.length > 0 && (
                <div className="nested-section">
                  <div className="section-title">
                    <i className="bi bi-people"></i>
                    Related Parties
                  </div>
                  <div className="parties-list">
                    {record.parties.map((party, index) => (
                      <div
                        key={`${record.id}-${party.id || index}`}
                        className="party-item"
                      >
                        <div className="party-field">
                          <span className="nested-label">Party:</span>
                          <span className="nested-value">
                            {formatPartyInfo(party)}
                          </span>
                        </div>
                        {party.notes && (
                          <div className="party-field">
                            <span className="nested-label">Notes:</span>
                            <span className="nested-value">{party.notes}</span>
                          </div>
                        )}
                        {party.created_at && (
                          <div className="party-field">
                            <span className="nested-label">Added:</span>
                            <span className="nested-value">
                              {formatDate(party.created_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {record.attachments && record.attachments.length > 0 && (
                <div className="nested-section">
                  <div className="section-title">
                    <i className="bi bi-paperclip"></i>
                    Attachments
                  </div>
                  <div className="attachments-list">
                    {record.attachments.map((attachment, index) => (
                      <div
                        key={`attachment-${record.id}-${
                          attachment.id || index
                        }`}
                        className="attachment-item"
                      >
                        <div className="attachment-field">
                          <span className="nested-label">File:</span>
                          <button
                            className="attachment-link nested-value"
                            onClick={() => openAttachment(attachment)}
                            title={`Click to view ${attachment.file_name}`}
                          >
                            <span className="file-icon">
                              {getFileIcon(attachment.file_type)}
                            </span>
                            {attachment.file_name}
                          </button>
                        </div>
                        <div className="attachment-field">
                          <span className="nested-label">Type:</span>
                          <span className="nested-value">
                            {attachment.file_type}
                          </span>
                        </div>
                        {attachment.uploaded_at && (
                          <div className="attachment-field">
                            <span className="nested-label">Uploaded:</span>
                            <span className="nested-value">
                              {formatDate(attachment.uploaded_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExistingRecords;
