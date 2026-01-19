// This files displays in the UI all the current projects stored in the database for this particular builder.

import React, { useState, useEffect, useCallback } from "react";
import "./ExistingProjects.css";
import { existingProjects } from "./ApiService";
import Records from "./Records";
import ExistingRecords from "./ExistingRecords";

function ExistingProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [expandedProjects, setExpandedProjects] = useState(new Set());

  const loadProjects = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError("");

    try {
      const response = await existingProjects();
      setProjects(response.projects || []);

      setExpandedProjects(new Set());
      setHasMore(false);
    } catch (err) {
      setError(err.message || "Failed to load projects");
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const toggleProjectExpansion = (index) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedProjects(newExpanded);
  };

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  if (isLoading) {
    return (
      <div className="row justify-content-center mt-5">
        <div className="col-md-8">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="row justify-content-center mt-5">
        <div className="col-md-8">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button className="btn btn-primary" onClick={() => loadProjects()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-8">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Your Projects</h3>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => loadProjects(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="card">
            <div className="card-body text-center">
              <p className="mb-0">There are currently no projects</p>
            </div>
          </div>
        ) : (
          <div className="projects-list">
            {projects.map((project, index) => {
              const isExpanded = expandedProjects.has(index);

              return (
                <div key={index} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div style={{ flex: 1 }}>
                        <h5 className="card-title mb-0">
                          {project.project_address}
                        </h5>

                        {isExpanded && (
                          <div className="mt-3">
                            <div className="d-flex gap-3">
                              <span className="badge bg-secondary">
                                {project.status}
                              </span>
                              <small className="text-muted">
                                Created:{" "}
                                {new Date(
                                  project.created_at,
                                ).toLocaleDateString()}
                              </small>
                            </div>

                            <Records
                              projectId={project.id}
                              builderId={project.builder_id}
                            />

                            <ExistingRecords records={project.records || []} />
                          </div>
                        )}
                      </div>

                      <button
                        className="btn btn-outline-secondary btn-sm ms-3"
                        onClick={() => toggleProjectExpansion(index)}
                        aria-expanded={isExpanded}
                        aria-controls={`project-details-${index}`}
                      >
                        {isExpanded ? "Hide details" : "Show details"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExistingProjects;
