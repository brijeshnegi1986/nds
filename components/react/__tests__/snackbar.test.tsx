/** Snackbar (Figma 865:1594): raised surface, 14/20 text, an optional Plain
 * SM action after a divider or, for two lines, below the text. */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Snackbar } from "../src/index.js";

function snackbar(node: React.ReactElement): HTMLElement {
  const html = renderToStaticMarkup(node);
  return new DOMParser().parseFromString(html, "text/html").body.firstElementChild as HTMLElement;
}

describe("Snackbar", () => {
  it("is a polite status on the raised surface with the sm elevation", () => {
    const el = snackbar(<Snackbar>Post moved to the calendar.</Snackbar>);
    expect(el.getAttribute("role")).toBe("status");
    expect(el.className.split(" ")).toEqual(
      expect.arrayContaining(["bg-(--color-surface-raised)", "border-(--color-border-subtle)", "rounded-(--radius-md)"]),
    );
    expect(el.querySelector("button")).toBeNull();
    expect(el.querySelector('[data-part="divider"]')).toBeNull();
  });

  it("puts a single-line action after a divider, as a Plain button", () => {
    const el = snackbar(<Snackbar action={{ label: "Retry", onClick: () => {} }}>Can&apos;t send photo.</Snackbar>);
    expect(el.querySelector('[data-part="divider"]')).not.toBeNull();
    const button = el.querySelector("button")!;
    expect(button.textContent).toBe("Retry");
    expect(button.className).toContain("text-[var(--color-text-link,var(--color-content-link))]");
  });

  it("stacks a multi-line action below the text, at the right", () => {
    const el = snackbar(
      <Snackbar layout="multi-line" action={{ label: "Add a new label", onClick: () => {} }}>
        This item already has the label “Personal”. You can add a new label.
      </Snackbar>,
    );
    expect(el.className.split(" ")).toEqual(expect.arrayContaining(["flex-col", "items-end"]));
    expect(el.querySelector('[data-part="divider"]')).toBeNull();
  });
});
