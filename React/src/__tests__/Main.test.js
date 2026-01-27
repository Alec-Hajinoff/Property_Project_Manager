import React from "react";
import { render, screen } from "@testing-library/react";
import Main from "../Main";

describe("Main", () => {
  test("renders app subtitle text", () => {
    render(<Main />);

    expect(
      screen.getByText(
        /Property Project Manager is a lightweight workflow system/i,
      ),
    ).toBeInTheDocument();
  });

  test("renders all three value points with titles and descriptions", () => {
    render(<Main />);

    expect(screen.getByText(/Clarity & Visibility/i)).toBeInTheDocument();
    expect(screen.getByText(/Defensible Records/i)).toBeInTheDocument();
    expect(screen.getByText(/Reduced Ambiguity/i)).toBeInTheDocument();

    expect(
      screen.getByText(/See the status of all active jobs at a glance/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Every agreement, change, approval, and key event is captured/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Centralise decisions and approvals in one place/i),
    ).toBeInTheDocument();
  });

  test("renders main container and value points container", () => {
    const { container } = render(<Main />);

    const mainContainer = container.querySelector(".main-container");
    expect(mainContainer).toBeInTheDocument();

    const valuePointsContainer = container.querySelector(
      ".value-points-container",
    );
    expect(valuePointsContainer).toBeInTheDocument();

    const valuePoints = container.querySelectorAll(".value-point");
    expect(valuePoints).toHaveLength(3);
  });
});
