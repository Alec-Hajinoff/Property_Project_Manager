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
