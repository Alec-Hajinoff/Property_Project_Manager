//Frontend - backend communication must happen over HTTPS on production

export const registerUser = async (formData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Readings_From_Sensors/form_capture.php",
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
      "http://localhost:8001/Readings_From_Sensors/login_capture.php",
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

// pullReadingsFunction() is the API call to fetch the sensor readings from the backend.

export const pullReadingsFunction = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Readings_From_Sensors/pull_readings.php",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in pullReadingsFunction:", error);
    throw new Error(`Failed to fetch agreement: ${error.message}`);
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Readings_From_Sensors/logout_component.php",
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

// pullHistory() fetches all historic readings so the dashboard table can render them.

export const pullHistory = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Readings_From_Sensors/pull_history.php",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to contact historic readings endpoint");
    }

    const payload = await response.json();

    if (!payload.success) {
      throw new Error(payload.message || "Historic readings request failed");
    }

    return payload;
  } catch (error) {
    console.error("Error in pullHistory:", error);
    return { success: false, message: error.message, data: [] };
  }
};

// The below three functions deal with alerts.

export const setAlertThresholds = async (thresholdData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Readings_From_Sensors/set_alerts.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(thresholdData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to set alert thresholds");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error setting alerts:", error);
    throw new Error("Failed to set alert thresholds");
  }
};

export const getAlertThresholds = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Readings_From_Sensors/get_alerts.php",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch alert thresholds");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw new Error("Failed to fetch alert thresholds");
  }
};

export const deleteAlertThresholds = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Readings_From_Sensors/delete_alerts.php",
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete alert thresholds");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting alerts:", error);
    throw new Error("Failed to delete alert thresholds");
  }
};
