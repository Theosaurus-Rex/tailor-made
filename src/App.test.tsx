import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { App } from "./App";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

const ROUTES = [
  ["/", "Generator"],
  ["/daily", "Daily challenge"],
  ["/c", "We couldn’t read this link"],
  ["/about", "Tailor-Made"],
  ["/nope", "Page not found"],
] as const;

describe("App routes", () => {
  it.each(ROUTES)("%s renders the %s heading", (path, heading) => {
    renderAt(path);
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
  });
});

describe("app shell", () => {
  it("links to the generator, daily and about pages", () => {
    renderAt("/");
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Generate" })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: "Daily" })).toHaveAttribute("href", "/daily");
    expect(within(nav).getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  it("marks only the current page link", () => {
    renderAt("/daily");
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Daily" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: "Generate" })).not.toHaveAttribute("aria-current");
    expect(within(nav).getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
  });

  it.each(["/", "/daily", "/c", "/about", "/nope"])(
    "shows the unofficial note and a main area on %s",
    (path) => {
      renderAt(path);
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toHaveTextContent(/unofficial fan project/);
    },
  );
});

describe("not found page", () => {
  it("shows its heading and a link back to the generator", () => {
    renderAt("/dressess");
    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByText(/nothing at \/dressess/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Go to the generator" }));
    expect(screen.getByRole("heading", { level: 1, name: "Generator" })).toBeInTheDocument();
  });
});
