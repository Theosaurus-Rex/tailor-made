import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LATEST_DATA_VERSION } from "@/game/data";

import { AboutScreen } from "./AboutScreen";

describe("AboutScreen", () => {
  it("shows the latest data version", () => {
    render(<AboutScreen />);
    expect(screen.getByText(`v${String(LATEST_DATA_VERSION)}`)).toBeInTheDocument();
  });

  it("shows a build id", () => {
    render(<AboutScreen />);
    const term = screen.getByText("App build");
    expect(term.nextElementSibling?.textContent).toMatch(/\S/);
  });

  it("links to the fan wiki and does not name the other guide site", () => {
    const { container } = render(<AboutScreen />);
    expect(screen.getByRole("link", { name: "dressmakerwiki.site" })).toHaveAttribute(
      "href",
      "https://dressmakerwiki.site",
    );
    expect(container.textContent?.toLowerCase()).not.toContain("cozygameguides");
  });

  it("has a disclaimer section", () => {
    render(<AboutScreen />);
    expect(screen.getByRole("heading", { level: 2, name: "Disclaimer" })).toBeInTheDocument();
    expect(screen.getByText(/unofficial fan project/)).toBeInTheDocument();
  });
});
