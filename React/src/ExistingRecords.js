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
                        {new Date(record.record_datetime).toLocaleDateString()}
                      </small>
                    </div>
                    <h6 className="mb-1">{record.title}</h6>
                    {record.details && (
                      <p className="mb-0 small text-muted">{record.details}</p>
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
