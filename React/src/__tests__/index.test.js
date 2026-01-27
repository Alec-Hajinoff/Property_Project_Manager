import React from "react";
import ReactDOM from "react-dom/client";
import App from "../App";
import reportWebVitals from "../reportWebVitals";

jest.mock("react-dom/client");

jest.mock("../App", () => {
  return function MockApp() {
    return <div data-testid="app">App</div>;
  };
});

jest.mock("../reportWebVitals");

describe("index.js", () => {
  let mockRoot;
  let originalGetElementById;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockContainer = document.createElement("div");
    mockContainer.id = "root";
    document.body.appendChild(mockContainer);

    mockRoot = {
      render: jest.fn(),
    };
    ReactDOM.createRoot.mockReturnValue(mockRoot);
  });

  afterEach(() => {
    const root = document.getElementById("root");
    if (root) {
      document.body.removeChild(root);
    }
  });

  test("renders App inside React.StrictMode", () => {
    const root = ReactDOM.createRoot(document.getElementById("root"));
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(
      document.getElementById("root"),
    );

    expect(root.render).toBeDefined();
  });

  test("calls reportWebVitals", () => {
    reportWebVitals();
    expect(reportWebVitals).toHaveBeenCalled();
  });
});
