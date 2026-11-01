/** Alert (Figma 426:540): status fill, a 4px indicator stripe, a 20px icon,
 * an optional 14/20 medium title in the status colour, a 14/20 body. */
import { describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { Alert } from "../src/index.js";

function alert(node: React.ReactElement): HTMLElement {
  const html = renderToStaticMarkup(node);
  return new DOMParser().parseFromString(html, "text/html").body.firstElementChild as HTMLElement;
}

describe("Alert (audit M9)", () => {
  it("announces an error, with the stripe, icon and status fill", () => {
    const el = alert(<Alert tone="error">Your profile couldn&apos;t be saved.</Alert>);
    expect(el.getAttribute("role")).toBe("alert");
    expect(el.className).toContain("bg-(--color-status-error-subtle)");
    expect(el.className).toContain("rounded-(--radius-md)");
    expect(el.querySelector('[data-part="indicator"]')!.className).toContain("bg-(--color-status-error)");
    expect(el.querySelector('[data-part="icon"]')).not.toBeNull();
    expect(el.textContent).toBe("Your profile couldn't be saved.");
  });

  it("is a polite status for the other tones, with an optional title", () => {
    const el = alert(
      <Alert tone="warning" title="Paused for a safety check">
        We&apos;ll look at it shortly.
      </Alert>,
    );
    expect(el.getAttribute("role")).toBe("status");
    expect(el.querySelector('[data-part="title"]')!.textContent).toBe("Paused for a safety check");
    expect(el.querySelector('[data-part="title"]')!.className).toContain("text-(--color-status-warning)");
  });

  it("can drop the live role, e.g. for a confirmation step", () => {
    const el = alert(<Alert tone="error" title="Delete this draft?" role={null}>Gone for good.</Alert>);
    expect(el.hasAttribute("role")).toBe(false);
  });

  it("gives each tone its own filled icon", () => {
    const icon = (tone: "info" | "success" | "warning" | "error" | "neutral") =>
      alert(<Alert tone={tone}>Message</Alert>).querySelector('[data-part="icon"]')!.getAttribute("data-icon");
    expect(icon("info")).toBe("info");
    expect(icon("neutral")).toBe("info");
    expect(icon("success")).toBe("check-circle-filled");
    expect(icon("warning")).toBe("warning-filled");
    expect(icon("error")).toBe("error-filled");
  });
});

describe("Alert: dismissible (V4)", () => {
  it("ends with a Got it text button when it can be dismissed", () => {
    let dismissed = 0;
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() =>
      root.render(
        <Alert tone="info" onDismiss={() => dismissed++}>
          3 drafts are waiting for review.
        </Alert>,
      ),
    );
    const button = host.querySelector("button")!;
    expect(button.textContent).toBe("Got it");
    expect(button.getAttribute("type")).toBe("button");
    // A text button, not a big round close icon.
    expect(button.className).not.toContain("rounded-full");
    act(() => button.click());
    expect(dismissed).toBe(1);
    act(() => root.unmount());
    host.remove();
  });

  it("takes its own words for the dismiss", () => {
    const html = renderToStaticMarkup(<Alert onDismiss={() => {}} dismissLabel="Hide">x</Alert>);
    expect(html).toContain(">Hide</button>");
  });

  it("has no button when it can't be dismissed", () => {
    expect(renderToStaticMarkup(<Alert>x</Alert>)).not.toContain("<button");
  });
});
