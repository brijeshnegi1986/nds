/** ActionMenu: a row's "⋯" menu of actions. */
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ActionMenu } from "../src/index.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

function mount(calls: string[], disabled = false) {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() =>
    root.render(
      <ActionMenu
        label="Actions for Growth"
        items={[
          { label: "Edit", onSelect: () => calls.push("edit") },
          { label: "Archive", onSelect: () => calls.push("archive"), disabled, tone: "danger" },
        ]}
      />,
    ),
  );
  return host.querySelector<HTMLButtonElement>("button[aria-haspopup='menu']")!;
}

describe("ActionMenu", () => {
  it("is a named ⋯ button that opens a menu of actions", () => {
    const button = mount([]);
    expect(button.getAttribute("aria-label")).toBe("Actions for Growth");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(host.querySelector("[role='menu']")).toBeNull();
    act(() => button.click());
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const items = [...host.querySelectorAll("[role='menuitem']")].map((i) => i.textContent);
    expect(items).toEqual(["Edit", "Archive"]);
    expect(document.activeElement?.textContent).toBe("Edit");
  });

  it("runs an action and closes, giving focus back to the button", () => {
    const calls: string[] = [];
    const button = mount(calls);
    act(() => button.click());
    act(() => host.querySelector<HTMLButtonElement>("[role='menuitem']")!.click());
    expect(calls).toEqual(["edit"]);
    expect(host.querySelector("[role='menu']")).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it("moves with the arrow keys and closes on Escape", () => {
    const button = mount([]);
    act(() => button.click());
    const menu = host.querySelector("[role='menu']")!;
    act(() => { menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })); });
    expect(document.activeElement?.textContent).toBe("Archive");
    act(() => { menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); });
    expect(host.querySelector("[role='menu']")).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it("can't run a disabled action", () => {
    const calls: string[] = [];
    const button = mount(calls, true);
    act(() => button.click());
    const archive = [...host.querySelectorAll<HTMLButtonElement>("[role='menuitem']")][1];
    expect(archive.disabled).toBe(true);
  });

  it("closes when you click elsewhere", () => {
    const button = mount([]);
    act(() => button.click());
    act(() => { document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); });
    expect(host.querySelector("[role='menu']")).toBeNull();
  });

  it("can be an Add button: a 44px + that opens its menu to the right, items with icons", () => {
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    const calls: string[] = [];
    act(() =>
      root.render(
        <ActionMenu
          kind="add"
          label="Add a channel"
          items={[{ label: "Connect Threads", icon: <span data-icon-threads />, onSelect: () => calls.push("threads") }]}
        />,
      ),
    );
    const button = host.querySelector<HTMLButtonElement>("button[aria-haspopup='menu']")!;
    expect(button.getAttribute("aria-label")).toBe("Add a channel");
    expect(button.className.split(" ")).toContain("size-11");
    expect(button.querySelector("[data-part='plus']")).not.toBeNull();
    act(() => button.click());
    const menu = host.querySelector<HTMLElement>("[role='menu']")!;
    expect(menu.className.split(" ")).toContain("left-0");
    const item = menu.querySelector<HTMLButtonElement>("[role='menuitem']")!;
    expect(item.querySelector("[data-icon-threads]")).not.toBeNull();
    // One line each: a small trigger mustn't squeeze the menu so names wrap.
    expect(item.className.split(" ")).toContain("whitespace-nowrap");
    act(() => item.click());
    expect(calls).toEqual(["threads"]);
  });

  it("can be a channel kept elsewhere: its faded logo, a badge, and a line saying where it is", () => {
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    const calls: string[] = [];
    act(() =>
      root.render(
        <ActionMenu
          kind="channel"
          label="LinkedIn, in your Jesh Negi profile"
          icon={<span data-icon-linkedin />}
          badge="J"
          heading="LinkedIn is in your Jesh Negi profile."
          items={[{ label: "Write as Jesh Negi", onSelect: () => calls.push("write-as") }]}
        />,
      ),
    );
    const button = host.querySelector<HTMLButtonElement>("button[aria-haspopup='menu']")!;
    expect(button.getAttribute("aria-label")).toBe("LinkedIn, in your Jesh Negi profile");
    expect(button.className.split(" ")).toContain("size-11");
    // Connected, so a solid edge, not the dashed one of something to add.
    expect(button.className).not.toContain("border-dashed");
    expect(button.querySelector("[data-part='logo']")!.className).toContain("opacity-50");
    expect(button.querySelector("[data-icon-linkedin]")).not.toBeNull();
    expect(button.querySelector("[data-part='badge']")!.textContent).toBe("J");
    expect(button.querySelector("[data-part='plus']")).toBeNull();
    act(() => button.click());
    const menu = host.querySelector<HTMLElement>("[role='menu']")!;
    expect(menu.className.split(" ")).toContain("left-0");
    expect(menu.querySelector("[data-part='heading']")!.textContent).toBe("LinkedIn is in your Jesh Negi profile.");
    act(() => menu.querySelector<HTMLButtonElement>("[role='menuitem']")!.click());
    expect(calls).toEqual(["write-as"]);
  });

  it("can be a Secondary button with its own words, opening its menu under its right edge", () => {
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    const calls: string[] = [];
    act(() =>
      root.render(
        <ActionMenu
          kind="button"
          text="Connect a channel"
          label="Connect a channel to Stakemate"
          items={[{ label: "LinkedIn", icon: <span data-icon-linkedin />, onSelect: () => calls.push("linkedin") }]}
        />,
      ),
    );
    const button = host.querySelector<HTMLButtonElement>("button[aria-haspopup='menu']")!;
    expect(button.textContent).toContain("Connect a channel");
    expect(button.getAttribute("aria-label")).toBe("Connect a channel to Stakemate");
    // The black Secondary button, small, not a round icon.
    expect(button.className).toContain("bg-(--color-action-secondary)");
    expect(button.className.split(" ")).not.toContain("size-8");
    expect(button.querySelector("[data-part='chevron']")).not.toBeNull();
    act(() => button.click());
    const menu = host.querySelector<HTMLElement>("[role='menu']")!;
    expect(menu.className.split(" ")).toContain("right-0");
    act(() => menu.querySelector<HTMLButtonElement>("[role='menuitem']")!.click());
    expect(calls).toEqual(["linkedin"]);
  });

  it("can be the outlined Tertiary button, for a screen whose main action is elsewhere", () => {
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    act(() =>
      root.render(
        <ActionMenu kind="button" buttonVariant="tertiary" text="Connect a channel" label="Connect a channel" items={[]} />,
      ),
    );
    const button = host.querySelector<HTMLButtonElement>("button[aria-haspopup='menu']")!;
    expect(button.className).toContain("bg-(--color-action-tertiary)");
    expect(button.className).not.toContain("bg-(--color-action-secondary)");
  });
});
