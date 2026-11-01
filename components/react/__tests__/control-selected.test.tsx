/** Selected controls take --color-control-selected, so an app can set its
 * own selected colour; without it they stay the primary action colour. */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Checkbox, Radio, RadioTiles, Switch } from "../src/index.js";

const SELECTED = "var(--color-control-selected,var(--color-action-primary))";
const ON = "var(--color-control-on-selected,var(--color-content-on-primary))";
const doc = (html: string) => new DOMParser().parseFromString(html, "text/html");

describe("Selected colour (--color-control-selected)", () => {
  it("fills a ticked checkbox with it", () => {
    const input = doc(renderToStaticMarkup(<Checkbox label="Write as I" checked onChange={() => {}} />)).querySelector("input")!;
    expect(input.className).toContain(`checked:bg-[${SELECTED}]`);
    expect(input.className).toContain(`checked:border-[${SELECTED}]`);
    expect(input.className).not.toContain("checked:bg-(--color-action-primary)");
    // The tick and the part-selected bar, readable on that fill.
    expect(input.parentElement!.innerHTML).toContain(`bg-[${ON}]`);
    expect(input.parentElement!.innerHTML).not.toContain("bg-(--color-content-on-primary)");
  });

  it("rings a chosen radio with it", () => {
    const input = doc(renderToStaticMarkup(<Radio name="r" value="a" label="A" checked onChange={() => {}} />)).querySelector("input")!;
    expect(input.className).toContain(`checked:shadow-[inset_0_0_0_3.5px_${SELECTED}]`);
    expect(input.className).not.toContain("var(--color-action-primary)]");
    expect(input.className).toContain(`checked:bg-[${ON}]`);
  });

  it("fills a switch that's on with it", () => {
    const html = renderToStaticMarkup(<Switch label="Instagram" checked onChange={() => {}} />);
    expect(html).toContain(`bg-[${SELECTED}]`);
    expect(html).not.toContain("bg-(--color-action-primary)");
  });

  it("outlines the chosen tile with it", () => {
    const html = renderToStaticMarkup(
      <RadioTiles legend="Who" name="w" value="a" onChange={() => {}} options={[{ value: "a", title: "A" }, { value: "b", title: "B" }]} />,
    );
    expect(html).toContain(`border-[${SELECTED}]`);
  });
});
