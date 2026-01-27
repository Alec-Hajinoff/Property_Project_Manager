import {
  registerUser,
  loginUser,
  logoutUser,
  createProject,
  existingProjects,
  createRecord,
} from "../ApiService";

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("ApiService", () => {
  describe("registerUser", () => {
    it("sends POST request and returns data", async () => {
      const mockResponse = { success: true };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await registerUser({ name: "Alec" });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Property_Project_Manager/form_capture.php",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: "Alec" }),
        }),
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe("loginUser", () => {
    it("sends POST request and returns data", async () => {
      const mockResponse = { success: true };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await loginUser({ email: "test@test.com" });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Property_Project_Manager/login_capture.php",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: "test@test.com" }),
        }),
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe("logoutUser", () => {
    it("sends POST request and resolves on success", async () => {
      global.fetch.mockResolvedValue({ ok: true });

      await expect(logoutUser()).resolves.not.toThrow();

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Property_Project_Manager/logout_component.php",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        }),
      );
    });

    it("throws on failure", async () => {
      global.fetch.mockResolvedValue({ ok: false });

      await expect(logoutUser()).rejects.toThrow(
        "An error occurred during logout.",
      );
    });
  });

  describe("createProject", () => {
    it("sends POST request and returns data", async () => {
      const mockResponse = { success: true };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createProject({ title: "New Project" });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Property_Project_Manager/create_project.php",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: "New Project" }),
        }),
      );

      expect(result).toEqual(mockResponse);
    });

    it("throws when backend returns error", async () => {
      const mockResponse = { success: false, message: "Failed" };
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(createProject({})).rejects.toThrow("Failed");
    });
  });

  describe("existingProjects", () => {
    it("fetches projects successfully", async () => {
      const mockResponse = { success: true, projects: [] };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await existingProjects();

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Property_Project_Manager/existing_projects.php",
        expect.objectContaining({
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
      );

      expect(result).toEqual(mockResponse);
    });

    it("throws when backend returns failure", async () => {
      const mockResponse = { success: false, message: "Error" };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(existingProjects()).rejects.toThrow("Error");
    });
  });

  describe("createRecord", () => {
    it("sends POST request with FormData and returns data", async () => {
      const mockResponse = { success: true };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const formData = new FormData();
      formData.append("file", "test");

      const result = await createRecord(formData);

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Property_Project_Manager/create_record.php",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          body: formData,
        }),
      );

      expect(result).toEqual(mockResponse);
    });

    it("throws when backend returns failure", async () => {
      const mockResponse = { success: false, message: "Failed" };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(createRecord(new FormData())).rejects.toThrow("Failed");
    });
  });
});
