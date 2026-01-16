//Frontend - backend communication must happen over HTTPS on production

export const registerUser = async (formData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Property_Project_Manager/form_capture.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

export const loginUser = async (formData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Property_Project_Manager/login_capture.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Property_Project_Manager/logout_component.php",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error("An error occurred during logout.");
  }
};

// createProject() sends new project data to the backend.

export const createProject = async (projectData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Property_Project_Manager/create_project.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(projectData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create project");
    }

    return data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error(
      error.message || "An error occurred while creating the project."
    );
  }
};

// existingProjects() fetches existing project data out of the database; used in file ExistingProjects.js.

export const existingProjects = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Property_Project_Manager/existing_projects.php",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch projects");
    }

    return data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error(
      error.message || "An error occurred while fetching projects."
    );
  }
};
