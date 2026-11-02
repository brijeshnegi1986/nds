/** SearchField (Figma 836:1549), Select toolbar sizes, and ImageUpload
 * (Figma 900:161). */
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { ImageUpload, SearchField, Select, formatFileSize } from "../src/index.js";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
function mount(node: React.ReactElement) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(node));
}
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

function setInput(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("SearchField", () => {
  it("is a 40px pill with the search icon, 16px text on phones and 14px from sm up", () => {
    const html = renderToStaticMarkup(<SearchField value="" onChange={() => {}} aria-label="Search clients" />);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const box = doc.body.firstElementChild as HTMLElement;
    expect(box.className.split(" ")).toEqual(expect.arrayContaining(["h-10", "rounded-full", "border-(--color-border-input)"]));
    const input = doc.querySelector("input")!;
    expect(input.getAttribute("type")).toBe("search");
    expect(input.getAttribute("aria-label")).toBe("Search clients");
    expect(input.className.split(" ")).toEqual(expect.arrayContaining(["text-base", "sm:text-sm"]));
    expect(doc.querySelector('button[aria-label="Clear search"]')).toBeNull();
  });

  it("clears with the button or Escape", () => {
    function Host() {
      const [q, setQ] = useState("bakery");
      return <SearchField value={q} onChange={setQ} aria-label="Search" />;
    }
    mount(<Host />);
    const input = container.querySelector("input")!;
    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="Clear search"]')!.click());
    expect(input.value).toBe("");
    setInput(input, "maya");
    expect(input.value).toBe("maya");
    act(() => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(input.value).toBe("");
  });
});

describe("Select toolbar sizes", () => {
  const options = [{ value: "all", label: "All" }];
  it("is 40px at sm and 36px at compact, with an optional prefix inside the field", () => {
    const sm = renderToStaticMarkup(<Select value="all" onChange={() => {}} options={options} size="sm" prefix="Type" aria-label="Type" />);
    const compact = renderToStaticMarkup(<Select value="all" onChange={() => {}} options={options} size="compact" aria-label="Type" />);
    expect(sm).toContain("h-10");
    expect(compact).toContain("h-9");
    const doc = new DOMParser().parseFromString(sm, "text/html");
    expect(doc.querySelector('[role="combobox"]')!.textContent).toContain("Type: All");
  });
});

describe("ImageUpload", () => {
  it("formats sizes as people read them", () => {
    expect(formatFileSize(2.4 * 1024 * 1024)).toBe("2.4 MB");
    expect(formatFileSize(8 * 1024 * 1024)).toBe("8 MB");
    expect(formatFileSize(640 * 1024)).toBe("640 KB");
  });

  it("starts as a labelled drop area with the file rules", () => {
    mount(<ImageUpload state={{ status: "idle" }} onFile={() => {}} />);
    const area = container.querySelector("label")!;
    expect(area.getAttribute("data-state")).toBe("default");
    expect(area.textContent).toContain("Drag an image here, or browse");
    expect(area.textContent).toContain("JPG, PNG or WebP, up to 8 MB");
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(input.getAttribute("accept")).toBe("image/jpeg,image/png,image/webp");
    expect(input.getAttribute("aria-label")).toBe("Add an image");
  });

  it("colours browse as the app's links when it sets --color-text-link, the link colour otherwise", () => {
    mount(<ImageUpload state={{ status: "idle" }} onFile={() => {}} />);
    const browse = [...container.querySelectorAll("span")].find((el) => el.textContent === "browse")!;
    expect(browse.className).toContain("text-[var(--color-text-link,var(--color-content-link))]");
    expect(browse.className).toContain("underline");
  });

  it("hands a dropped image to onFile, and refuses one that's too big or the wrong type", () => {
    const onFile = vi.fn();
    mount(<ImageUpload state={{ status: "idle" }} onFile={onFile} maxBytes={1024 * 1024} />);
    const drop = (file: File) => {
      const area = container.querySelector<HTMLElement>("[data-state]")!;
      const event = new Event("drop", { bubbles: true, cancelable: true }) as Event & { dataTransfer: unknown };
      Object.defineProperty(event, "dataTransfer", { value: { files: [file], dropEffect: "none" } });
      act(() => {
        area.dispatchEvent(event);
      });
    };
    drop(new File(["x"], "menu.png", { type: "image/png" }));
    expect(onFile).toHaveBeenCalledTimes(1);

    const big = new File([new Uint8Array(2 * 1024 * 1024)], "huge.jpg", { type: "image/jpeg" });
    drop(big);
    expect(onFile).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-state="error"]')!.textContent).toContain("It's 2 MB and the limit is 1 MB.");

    drop(new File(["x"], "notes.pdf", { type: "application/pdf" }));
    expect(container.querySelector('[data-state="error"]')!.textContent).toContain("That file type isn't supported");
  });

  it("shows progress while uploading, and a preview with Change and Remove once done", () => {
    const onRemove = vi.fn();
    const { rerender } = (() => {
      mount(<ImageUpload state={{ status: "uploading", fileName: "menu.jpg", fileSize: 2.4 * 1024 * 1024, progress: 64 }} onFile={() => {}} />);
      return { rerender: (n: React.ReactElement) => act(() => root.render(n)) };
    })();
    const bar = container.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute("aria-valuenow")).toBe("64");
    expect(container.textContent).toContain("Uploading 64%");
    expect(container.textContent).toContain("2.4 MB");

    rerender(<ImageUpload state={{ status: "uploaded", fileName: "menu.jpg", previewUrl: "https://example.com/m.jpg" }} onFile={() => {}} onRemove={onRemove} />);
    expect(container.querySelector("img")!.getAttribute("src")).toBe("https://example.com/m.jpg");
    expect(container.textContent).toContain("Change image");
    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="Remove image"]')!.click());
    expect(onRemove).toHaveBeenCalled();
  });

  it("explains why it's off when disabled, with no file input", () => {
    const html = renderToStaticMarkup(
      <ImageUpload state={{ status: "idle" }} onFile={() => {}} disabled disabledMessage="Image storage is switched on for paid plans." />,
    );
    expect(html).toContain("Image uploads are off");
    expect(html).toContain("switched on for");
    expect(html).not.toContain('type="file"');
  });
});
