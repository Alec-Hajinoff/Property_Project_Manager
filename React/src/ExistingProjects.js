import React, { useState, useEffect, useCallback } from "react";
import "./ExistingProjects.css";
import { existingProjects } from "./ApiService";

function ExistingProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Initial load
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleScroll = () => {
    // Placeholder for infinite scroll implementation
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            {projects.map((project, index) => (
              <div key={index} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title">{project.project_address}</h5>
                      <div className="d-flex gap-3 mt-2">
                        <span className="badge bg-secondary">
                          {project.status}
                        </span>
                        <small className="text-muted">
                          Created:{" "}
                          {new Date(project.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Placeholder for infinite scroll loading indicator */}
        {hasMore && projects.length > 0 && (
          <div className="text-center mt-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading more...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExistingProjects;
