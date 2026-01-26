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
      <div className="loading-container">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-alert" role="alert">
          {error}
        </div>
        <button className="btn-refresh" onClick={() => loadProjects()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h3 className="projects-title">Your existing projects</h3>
        <button
          className="btn-refresh"
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
        <div className="no-projects-card">
          <p className="no-projects-text">There are currently no projects</p>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map((project, index) => {
            const isExpanded = expandedProjects.has(index);

            return (
              <div key={index} className="project-card">
                <div
                  className="project-card-header"
                  onClick={() => toggleProjectExpansion(index)}
                >
                  <div className="project-title">
                    {project.project_address}
                    <span className="project-badge">{project.status}</span>
                  </div>
                  <button
                    className="btn-show-details"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProjectExpansion(index);
                    }}
                    aria-expanded={isExpanded}
                    aria-controls={`project-details-${index}`}
                  >
                    {isExpanded ? "Hide details" : "Show details"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="project-details">
                    <div className="project-meta">
                      <div className="meta-item">
                        <i className="bi bi-calendar"></i>
                        <span>
                          Project created:{" "}
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="meta-item">
                        <i className="bi bi-building"></i>
                        <span>Project ID: {project.id}</span>
                      </div>
                    </div>

                    <Records
                      projectId={project.id}
                      builderId={project.builder_id}
                    />

                    {project.records && project.records.length > 0 && (
                      <div className="timeline-container">
                        <h3 className="timeline-title">
                          <i className="bi bi-clock-history"></i>
                          Project Timeline
                        </h3>
                        <div className="timeline">
                          <ExistingRecords records={project.records || []} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExistingProjects;
