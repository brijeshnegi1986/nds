/** SidePanel: a summary beside the main content, on the raised grey. */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SidePanel } from "../src/index.js";

const aside = (node: React.ReactElement) =>
  new DOMParser().parseFromString(renderToStaticMarkup(node), "text/html").querySelector("aside")!;

describe("SidePanel", () => {
  it("is an aside on the raised grey, with no edge or shadow", () => {
    const el = aside(<SidePanel label="Your brand">x</SidePanel>);
    expect(el.getAttribute("aria-label")).toBe("Your brand");
    expect(el.className).toContain("bg-(--color-surface-raised)");
    expect(el.className).not.toMatch(/\bborder\b|shadow/);
  });

  it("can be named by its own heading instead", () => {
    const el = aside(
      <SidePanel labelledBy="trial-title">
        <h2 id="trial-title">Your free trial</h2>
      </SidePanel>,
    );
    expect(el.getAttribute("aria-labelledby")).toBe("trial-title");
    expect(el.hasAttribute("aria-label")).toBe(false);
  });
});

describe("SidePanel that can be pushed in and pulled out", () => {
  const handle = (el: Element) => el.querySelector("button[aria-expanded]") as HTMLButtonElement;

  it("pulled out: the content, with a handle that pushes it in", () => {
    const el = aside(
      <SidePanel label="Preview" collapse={{ open: true, onToggle: () => {}, side: "right", controls: "p1" }}>
        <p>Your post</p>
      </SidePanel>,
    );
    expect(el.textContent).toContain("Your post");
    const button = handle(el);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.getAttribute("aria-label")).toBe("Hide Preview");
    expect(button.getAttribute("aria-controls")).toBe("p1");
    expect(button.className).toMatch(/\bsize-10\b/);
  });

  it("pushed in: a slim strip with only the handle and its name", () => {
    const el = aside(
      <SidePanel label="Preview" collapse={{ open: false, onToggle: () => {}, side: "right", controls: "p1" }}>
        <p>Your post</p>
      </SidePanel>,
    );
    expect(el.textContent).not.toContain("Your post");
    const button = handle(el);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-label")).toBe("Show Preview");
    expect(el.className).toContain("xl:w-12");
    expect(el.getAttribute("data-state")).toBe("collapsed");
    // From xl a full-height strip at the window's edge, under the page header.
    expect(el.className).toMatch(/xl:fixed\b.*xl:top-16\b.*xl:bottom-0\b/);
  });

  it("calls onToggle from the handle", async () => {
    const { createRoot } = await import("react-dom/client");
    const { act } = await import("react");
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    let toggled = 0;
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    act(() => root.render(<SidePanel label="Ready to post" collapse={{ open: true, onToggle: () => toggled++, side: "left" }}>x</SidePanel>));
    act(() => handle(host).click());
    expect(toggled).toBe(1);
    act(() => root.unmount());
    host.remove();
  });

  it("without collapse, is the plain panel it always was", () => {
    const el = aside(<SidePanel label="Your brand">x</SidePanel>);
    expect(el.querySelector("button")).toBeNull();
    expect(el.hasAttribute("data-state")).toBe(false);
  });

  it("names itself by its own header when labelledBy is given", () => {
    const el = aside(
      <SidePanel label="Ready to post" labelledBy="tray-title" collapse={{ open: true, onToggle: () => {}, side: "left" }}>x</SidePanel>,
    );
    expect(el.getAttribute("aria-labelledby")).toBe("tray-title");
    expect(el.querySelector("h2")!.id).toBe("tray-title");
  });
});

describe("SidePanel pulled out: a proper side panel", () => {
  type Rendered = { host: HTMLDivElement; unmount: () => void; rerender: (open: boolean) => void };
  let toggled = 0;

  function setWide(wide: boolean) {
    window.matchMedia = ((query: string) => ({
      matches: query.includes("max-width") ? !wide : wide,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })) as unknown as typeof window.matchMedia;
  }

  async function mount(open: boolean, side: "left" | "right" = "right"): Promise<Rendered> {
    const { createRoot } = await import("react-dom/client");
    const { act } = await import("react");
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    toggled = 0;
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const render = (o: boolean) =>
      act(() => root.render(<SidePanel label="Your post" collapse={{ open: o, onToggle: () => toggled++, side }}>x</SidePanel>));
    render(open);
    return {
      host,
      rerender: render,
      unmount: () => {
        act(() => root.unmount());
        host.remove();
      },
    };
  }

  it("from xl, runs from under the header to the bottom of the window, with its own scroll", () => {
    const right = aside(<SidePanel label="Your post" collapse={{ open: true, onToggle: () => {}, side: "right" }}>x</SidePanel>);
    expect(right.className).toMatch(/(^| )fixed\b/);
    expect(right.className).toMatch(/xl:top-16\b/);
    expect(right.className).toMatch(/xl:bottom-0\b/);
    expect(right.className).toMatch(/xl:w-96\b/);
    expect(right.className).toMatch(/\bright-0\b/);
    expect(right.className).toContain("overflow-y-auto");
    // It says where it docks, so the page can keep that room free.
    expect(right.getAttribute("data-dock")).toBe("right");
    expect(right.getAttribute("data-size")).toBe("md");
    // On the left it docks against the app's sidebar.
    const left = aside(<SidePanel label="Ready to post" collapse={{ open: true, onToggle: () => {}, side: "left" }}>x</SidePanel>);
    expect(left.className).toContain("xl:left-[var(--app-sidebar-width,0px)]");
  });

  it("below xl, slides over the page with a scrim that closes it", async () => {
    setWide(false);
    const { act } = await import("react");
    const r = await mount(true);
    const scrim = r.host.querySelector<HTMLElement>("[data-side-panel-scrim]")!;
    expect(scrim.className).toContain("xl:hidden");
    act(() => scrim.click());
    expect(toggled).toBe(1);
    r.unmount();
  });

  it("below xl, Escape closes it; docked from xl, Escape leaves it", async () => {
    const { act } = await import("react");
    setWide(false);
    let r = await mount(true);
    act(() => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); });
    expect(toggled).toBe(1);
    r.unmount();
    setWide(true);
    r = await mount(true);
    act(() => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); });
    expect(toggled).toBe(0);
    r.unmount();
  });

  it("below xl, opening moves focus into it, and closing brings it back to the handle", async () => {
    setWide(false);
    const r = await mount(false);
    r.rerender(true);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Hide Your post");
    r.rerender(false);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Show Your post");
    r.unmount();
  });

  it("comes in a narrow size, 256px, for a tray beside a wide grid", () => {
    const el = aside(<SidePanel label="Ready to post" collapse={{ open: true, onToggle: () => {}, side: "left", size: "sm" }}>x</SidePanel>);
    expect(el.className).toMatch(/xl:w-64\b/);
    expect(el.getAttribute("data-size")).toBe("sm");
    const closed = aside(<SidePanel label="Ready to post" collapse={{ open: false, onToggle: () => {}, side: "left", size: "sm" }}>x</SidePanel>);
    expect(closed.getAttribute("data-dock")).toBe("left");
  });

  it("comes in a wide size, 480px, for post previews at feed width", () => {
    const el = aside(<SidePanel label="Post preview" collapse={{ open: true, onToggle: () => {}, side: "right", size: "lg" }}>x</SidePanel>);
    expect(el.className).toMatch(/xl:w-\[30rem\]/);
    expect(el.className).toMatch(/w-\[min\(30rem,calc\(100vw-2rem\)\)\]/);
    expect(el.getAttribute("data-size")).toBe("lg");
  });
});
