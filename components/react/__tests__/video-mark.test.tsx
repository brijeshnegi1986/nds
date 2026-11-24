/** VideoMark: the small play mark that tells a video's picture from a photo. */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { VideoMark } from "../src/index.js";

function mark(node: React.ReactElement): HTMLElement {
  const html = renderToStaticMarkup(node);
  return new DOMParser().parseFromString(html, "text/html").body.firstElementChild as HTMLElement;
}

describe("VideoMark", () => {
  it("is an image named Video, so a screen reader says it is a video", () => {
    const el = mark(<VideoMark />);
    expect(el.getAttribute("role")).toBe("img");
    expect(el.getAttribute("aria-label")).toBe("Video");
    expect(el.getAttribute("data-part")).toBe("video-mark");
  });

  it("sits over the bottom-left corner of a relative parent and takes no clicks", () => {
    const el = mark(<VideoMark />);
    for (const cls of ["absolute", "bottom-1", "left-1", "pointer-events-none", "rounded-full", "size-5"]) {
      expect(el.className).toContain(cls);
    }
  });

  it("uses NDS tokens, never the orange action colour", () => {
    const el = mark(<VideoMark />);
    expect(el.className).toContain("bg-(--color-surface-default)");
    expect(el.className).toContain("text-(--color-content-primary)");
    expect(el.className).not.toMatch(/orange|action-primary/);
  });

  it("takes its own size, and hides the play glyph from screen readers", () => {
    const el = mark(<VideoMark className="size-4" />);
    expect(el.className).toContain("size-4");
    expect(el.className).not.toContain("size-5");
    expect(el.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
  });
});
