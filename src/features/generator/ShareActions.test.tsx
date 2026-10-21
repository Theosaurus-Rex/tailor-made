import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cardFor } from "@/domain/card";
import { challengeAsText } from "@/domain/card-text";
import { generate } from "@/domain/generate";
import { shareLinkFor } from "@/links/share-link";

import { ShareActions } from "./ShareActions";

const challengeFor = (seed: string) =>
  generate({ seed, difficulty: "medium", modifiers: [], dataVersion: 1 });

const first = challengeFor("k7m2qx9a");
const second = challengeFor("p3n8vd4w");
const linkOf = (challenge: typeof first) => window.location.origin + shareLinkFor(challenge);

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, "clipboard", { value, configurable: true });
}

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  setClipboard({ writeText });
});

afterEach(() => setClipboard(undefined));

describe("ShareActions", () => {
  it("copies the full share link", async () => {
    render(<ShareActions challenge={first} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    expect(await screen.findByRole("button", { name: "Link copied" })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(linkOf(first));
    expect(screen.getByRole("status")).toHaveTextContent(/^Link copied\./);
  });

  it("copies the card as text and previews it", async () => {
    render(<ShareActions challenge={first} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy as text" }));
    const expected = challengeAsText(cardFor(first), linkOf(first));
    expect(await screen.findByRole("button", { name: "Text copied" })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(expected);
    expect(screen.getByRole("status")).toHaveTextContent(/^Card copied as plain text/);
    expect(screen.getByRole("textbox")).toHaveValue(expected);
  });

  it("shows the link in a selectable box when writing is refused", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    render(<ShareActions challenge={first} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    expect(await screen.findByRole("button", { name: "Couldn’t copy" })).toBeInTheDocument();
    const box = screen.getByRole("textbox", { name: "Copy the link by hand" });
    expect(box).toHaveValue(linkOf(first));
    expect(box).toHaveAttribute("readonly");
    expect(screen.getByRole("status")).toHaveTextContent(/Select the link below/);
  });

  it("shows the text in a box when there is no clipboard", async () => {
    setClipboard(undefined);
    render(<ShareActions challenge={first} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy as text" }));
    const box = await screen.findByRole("textbox", { name: "Copy the text by hand" });
    expect(box).toHaveValue(challengeAsText(cardFor(first), linkOf(first)));
    expect(screen.getByRole("status")).toHaveTextContent(/Select the text below/);
  });

  it("clears the confirmation when the challenge changes", async () => {
    const { rerender } = render(<ShareActions challenge={first} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    await screen.findByRole("button", { name: "Link copied" });
    rerender(<ShareActions challenge={second} />);
    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    await screen.findByRole("button", { name: "Link copied" });
    expect(writeText).toHaveBeenLastCalledWith(linkOf(second));
  });
});
