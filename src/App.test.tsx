import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { App } from "@/App";

const ROUTES = [
  ["/", "Generator"],
  ["/daily", "Daily challenge"],
  ["/c", "Shared challenge"],
  ["/about", "About"],
  ["/nope", "Page not found"],
] as const;

describe("App routes", () => {
  it.each(ROUTES)("%s renders the %s heading", (path, heading) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
  });
});
