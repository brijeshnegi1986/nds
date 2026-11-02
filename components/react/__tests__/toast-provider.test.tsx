/**
 * Toasts: most disappear on their own; one that must be read (a failure)
 * stays until it's closed.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ToastProvider, useToast } from "../src/index.js";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.useRealTimers();
});

function Show({ persist }: { persist?: boolean }) {
  const { showToast } = useToast();
  useEffect(() => {
    showToast(persist ? "It didn't work." : "Saved.", persist ? "danger" : "success", undefined, { persist });
  }, [showToast, persist]);
  return null;
}

function render(persist?: boolean) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<ToastProvider><Show persist={persist} /></ToastProvider>));
}

describe("ToastProvider", () => {
  it("lets an ordinary toast disappear on its own", () => {
    render();
    expect(container.textContent).toContain("Saved.");
    act(() => vi.advanceTimersByTime(4000));
    expect(container.textContent).not.toContain("Saved.");
  });

  it("keeps a toast that must be read until it's closed", () => {
    render(true);
    act(() => vi.advanceTimersByTime(60_000));
    const toast = container.querySelector('[role="alert"]')!;
    expect(toast.textContent).toContain("It didn't work.");
    const close = toast.querySelector<HTMLButtonElement>('button[aria-label="Dismiss"]')!;
    act(() => close.click());
    expect(container.textContent).not.toContain("It didn't work.");
  });

  it("draws each tone as the NDS Toast: status fill, full border, 8px corners, its filled icon (audit M2)", () => {
    function All() {
      const { showToast } = useToast();
      useEffect(() => {
        showToast("Saved.", "success");
        showToast("Failed.", "danger");
        showToast("Careful.", "warning");
        showToast("Heads up.", "info");
        showToast("Noted.", "muted");
      }, [showToast]);
      return null;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<ToastProvider><All /></ToastProvider>));
    const toasts = [...container.querySelectorAll<HTMLElement>('[role="status"], [role="alert"]')];
    const icons = toasts.map((t) => t.querySelector('[data-part="icon"]')!.getAttribute("data-icon"));
    expect(icons).toEqual(["check-circle-filled", "error-filled", "warning-filled", "info-filled", "info"]);
    expect(toasts[0].className).toContain("border-(--color-border-success)");
    expect(toasts[0].className).toContain("bg-(--color-status-success)");
    expect(toasts[0].className).toContain("text-(--color-status-success-subtle)");
    expect(toasts[1].className).toContain("bg-(--color-status-error)");
    expect(toasts[2].className).toContain("text-(--color-content-inverse)");
    expect(toasts[4].className).toContain("bg-(--color-action-tertiary)");
    for (const t of toasts) expect(t.querySelector('[aria-label="Dismiss"]')).not.toBeNull();
    for (const t of toasts) expect(t.className).toContain("rounded-(--radius-md)");
  });
});

describe("ToastProvider: room for an app's bottom bar", () => {
  it("sits 16px up by default, or as far as --nds-toast-offset says", () => {
    render();
    const stack = container.querySelector<HTMLElement>('[aria-live="polite"]')!;
    expect(stack.className).toContain("bottom-[var(--nds-toast-offset,1rem)]");
    expect(stack.className).not.toMatch(/(^| )bottom-4( |$)/);
  });
});
