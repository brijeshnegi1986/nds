/**
 * Adjust an image before it's used (NegiFlow decision 8.12): framed to a
 * channel's shapes, dragged and zoomed, then cropped to the shape's size.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ImageAdjust, cropImage, type ImageShape } from "../src/index.js";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const SHAPES: ImageShape[] = [
  { id: "portrait", label: "Portrait", ratio: "4:5", width: 1080, height: 1350 },
  { id: "square", label: "Square", ratio: "1:1", width: 1080, height: 1080 },
];

let container: HTMLDivElement;
let root: Root;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
});

function render(props: Partial<Parameters<typeof ImageAdjust>[0]> = {}) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  const onSave = vi.fn();
  const onCancel = vi.fn();
  act(() =>
    root.render(<ImageAdjust open src="blob:photo" shapes={SHAPES} onSave={onSave} onCancel={onCancel} {...props} />),
  );
  return { onSave, onCancel };
}

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')!;
const button = (name: string) => [...dialog().querySelectorAll("button")].find((b) => b.textContent === name)!;

describe("ImageAdjust", () => {
  it("is a dialog that says the size it saves at", () => {
    render();
    expect(dialog().querySelector("h2")!.textContent).toBe("Adjust image");
    expect(dialog().textContent).toContain("Saved at 1080 × 1350 px");
  });

  it("offers each shape, the first chosen, and says the size of the one chosen", () => {
    render();
    const shapes = [...dialog().querySelectorAll<HTMLButtonElement>('[role="group"][aria-label="Shape"] button')];
    expect(shapes.map((b) => [b.textContent, b.getAttribute("aria-pressed")])).toEqual([
      ["Portrait 4:5", "true"],
      ["Square 1:1", "false"],
    ]);
    act(() => shapes[1].click());
    expect(shapes[1].getAttribute("aria-pressed")).toBe("true");
    expect(dialog().textContent).toContain("Saved at 1080 × 1080 px");
  });

  it("has no shape choice with one shape", () => {
    render({ shapes: [SHAPES[1]] });
    expect(dialog().querySelector('[role="group"][aria-label="Shape"]')).toBeNull();
  });

  it("zooms with a labelled slider, from 1x to 3x", () => {
    render();
    const zoom = dialog().querySelector<HTMLInputElement>('input[type="range"]')!;
    expect(zoom.getAttribute("aria-label")).toBe("Zoom");
    expect([zoom.min, zoom.max, zoom.value]).toEqual(["1", "3", "1"]);
  });

  it("waits for the image before it can save, and cancels", () => {
    const { onCancel, onSave } = render();
    expect(button("Save image").disabled).toBe(true);
    act(() => button("Cancel").click());
    expect(onCancel).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("says it's saving while the caller works", () => {
    render({ saving: true });
    expect(button("Saving…").disabled).toBe(true);
  });
});

describe("cropImage", () => {
  it("draws the chosen area at the shape's size and returns a JPEG", async () => {
    const drawImage = vi.fn();
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue({ drawImage, fillStyle: "", fillRect: vi.fn() } as unknown as CanvasRenderingContext2D);
    const toBlob = vi
      .spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementation(function (this: HTMLCanvasElement, done: BlobCallback, type?: string) {
        done(new Blob(["x"], { type }));
      });
    const image = { naturalWidth: 3000, naturalHeight: 2000 } as HTMLImageElement;
    const blob = await cropImage(image, { x: 100, y: 50, width: 1600, height: 2000 }, SHAPES[0]);
    expect(blob.type).toBe("image/jpeg");
    expect(drawImage).toHaveBeenCalledWith(image, 100, 50, 1600, 2000, 0, 0, 1080, 1350);
    getContext.mockRestore();
    toBlob.mockRestore();
  });
});

describe("ImageAdjust in a server-rendered app", () => {
  it("is a client component, so a server component importing the library never loads the cropper", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync(new URL("../src/image-adjust.tsx", import.meta.url), "utf8");
    expect(source.startsWith('"use client";')).toBe(true);
  });
});
