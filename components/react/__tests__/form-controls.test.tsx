/**
 * Field (Figma "Input" 105:1671): label 14/20 medium, hint and error 14/20,
 * the required marker in the error colour, all linked to the control.
 */
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { Field, TextArea, TextInput } from "../src/index.js";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

function mount(error: string | null = null) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() =>
    root.render(
      <Field label="Business name" required hint="As people know it." error={error}>
        {({ inputId, describedBy, invalid }) => (
          <TextInput id={inputId} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </Field>,
    ),
  );
}

const SMALL = "text-(length:--type-font-size-body-small)";

describe("Field (audit H7)", () => {
  it("sets the label, hint and error at the NDS 14/20 size", () => {
    mount("Add the business's name.");
    expect(container.querySelector("label")!.className).toContain(SMALL);
    expect(container.querySelector('[id$="-hint"]')!.className).toContain(SMALL);
    expect(container.querySelector('[role="alert"]')!.className).toContain(SMALL);
  });

  it("marks a required field with an asterisk in the error colour, and says so to screen readers", () => {
    mount();
    const star = container.querySelector("label span[aria-hidden]")!;
    expect(star.textContent).toBe(" *");
    expect(star.className).toContain("text-(--color-status-error)");
    expect(container.querySelector("label")!.textContent).toContain("(required)");
  });
});

describe("TextInput sizes", () => {
  it("is 48px by default and 40px at size sm, for dense tools like admin", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const html = (node: React.ReactElement) =>
      new DOMParser().parseFromString(renderToStaticMarkup(node), "text/html").querySelector("input")!;
    expect(html(<TextInput aria-label="Name" />).className).toMatch(/\bh-12\b/);
    const small = html(<TextInput aria-label="Name" size="sm" />);
    expect(small.className).toMatch(/\bh-10\b/);
    expect(small.className).not.toMatch(/\bh-12\b/);
    // Not the HTML size attribute; styles.css sizes it by data-size.
    expect(small.hasAttribute("size")).toBe(false);
    expect(small.getAttribute("data-size")).toBe("sm");
  });
});

describe("TextArea corner (V4)", () => {
  it("rounds a text area 24px, the same corner as the 48px pill inputs", () => {
    const html = renderToStaticMarkup(<TextArea aria-label="What you do" />);
    expect(html).toContain("rounded-[24px]");
    expect(html).not.toContain("rounded-md");
  });
});
