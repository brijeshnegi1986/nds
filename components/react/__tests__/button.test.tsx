/**
 * The NDS Button (Figma "Button", 105:885): SM 40px / MD 48px / LG 56px,
 * a semibold label, and the Primary, Secondary, Tertiary, Plain, Ghost and
 * Destructive variants, plus a Loading state.
 */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../src/index.js";

function classesOf(element: React.ReactElement): string[] {
  const html = renderToStaticMarkup(element);
  return (html.match(/class="([^"]*)"/)?.[1] ?? "").split(/\s+/);
}

describe("Button", () => {
  it.each([
    ["xsm", "h-9", "px-3"],
    ["sm", "h-10", "px-3"],
    ["md", "h-12", "px-4"],
    ["lg", "h-14", "px-6"],
  ] as const)("is the design's %s size: %s, %s", (size, height, padding) => {
    const classes = classesOf(<Button size={size}>Go</Button>);
    expect(classes).toContain(height);
    expect(classes).toContain(padding);
  });

  it("defaults to the MD size", () => {
    expect(classesOf(<Button>Go</Button>)).toContain("h-12");
  });

  it("uses the design's label: semibold with its letter spacing, 8px from an icon", () => {
    const classes = classesOf(<Button>Go</Button>);
    expect(classes).toEqual(expect.arrayContaining(["font-semibold", "tracking-[0.056px]", "gap-2"]));
  });

  it("draws Plain as link-coloured text with no fill or border: the app's link colour when it sets --color-text-link", () => {
    const classes = classesOf(<Button variant="plain">Go</Button>);
    expect(classes).toContain("text-[var(--color-text-link,var(--color-content-link))]");
    expect(classes.some((c) => c.startsWith("bg-("))).toBe(false);
    expect(classes).not.toContain("border");
  });

  it("draws Ghost as an orange outline on white", () => {
    const classes = classesOf(<Button variant="ghost">Go</Button>);
    expect(classes).toEqual(
      expect.arrayContaining(["border", "border-(--color-border-primary)", "bg-(--color-surface-default)", "text-(--color-content-link)"]),
    );
  });

  it("draws Destructive outlined: a red edge and red text on the subtle fill, tinting red on hover and press", () => {
    const classes = classesOf(<Button variant="destructive">Delete</Button>);
    expect(classes).toEqual(
      expect.arrayContaining([
        "border-(--color-border-error)",
        "bg-(--color-action-destructive-subtle)",
        "text-(--color-content-destructive)",
        "hover:bg-(--color-action-destructive-subtle-hover)",
        "active:bg-(--color-action-destructive-subtle-pressed)",
      ]),
    );
    expect(classes).not.toContain("bg-(--color-action-destructive)");
  });

  it("shows the Loading state: a spinner, busy and disabled", () => {
    const html = renderToStaticMarkup(<Button loading>Saving...</Button>);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("disabled");
    expect(html).toContain("progress_activity");
    expect(html).toContain("Saving...");
  });

  it("draws the Loading spinner at icon-size/xsm on an XSM button", () => {
    const html = renderToStaticMarkup(
      <Button size="xsm" loading>
        Saving...
      </Button>,
    );
    expect(html).toContain("size-4");
  });
});

describe("buttonClassName", () => {
  it("gives a link the same look as the Button it stands in for", async () => {
    const { buttonClassName } = await import("../src/index.js");
    const html = renderToStaticMarkup(
      <Button variant="primary" size="sm">
        Add
      </Button>,
    );
    const buttonClass = new DOMParser().parseFromString(html, "text/html").querySelector("button")!.className;
    for (const cls of buttonClassName("primary", "sm").split(" ")) expect(buttonClass.split(" ")).toContain(cls);
    expect(buttonClassName("secondary", "sm")).toContain("h-10");
  });

  it("gives the Plain button a light fill on hover and press, and no fill when disabled (audit L11)", async () => {
    const { buttonClassName } = await import("../src/index.js");
    const plain = buttonClassName("plain", "md");
    expect(plain).toContain("hover:bg-(--color-action-tertiary-hover)");
    expect(plain).toContain("active:bg-(--color-action-tertiary-pressed)");
    expect(plain).not.toContain("disabled:bg-");
    expect(plain).toContain("disabled:text-(--color-content-disabled)");
  });
});
