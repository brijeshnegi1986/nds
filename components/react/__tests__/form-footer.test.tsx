/** FormFooter: the one way a settings form saves. Save on the right,
 * Cancel beside it only when there's something to undo. */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FormFooter } from "../src/index.js";

function footer(node: React.ReactElement) {
  const html = renderToStaticMarkup(node);
  return new DOMParser().parseFromString(html, "text/html").body.firstElementChild as HTMLElement;
}

describe("FormFooter", () => {
  it("ends the form with a line and a Save changes submit on the right", () => {
    const el = footer(<FormFooter />);
    expect(el.className).toContain("justify-end");
    expect(el.className).toContain("border-t");
    const buttons = [...el.querySelectorAll("button")];
    expect(buttons.map((b) => b.textContent)).toEqual(["Save changes"]);
    expect(buttons[0].getAttribute("type")).toBe("submit");
  });

  it("puts Cancel before Save when there's something to undo", () => {
    const el = footer(<FormFooter onCancel={() => {}} />);
    const buttons = [...el.querySelectorAll("button")];
    expect(buttons.map((b) => b.textContent)).toEqual(["Cancel", "Save changes"]);
    expect(buttons[0].getAttribute("type")).toBe("button");
  });

  it("takes the form's own words", () => {
    const el = footer(<FormFooter saveLabel="Save new password" />);
    expect(el.querySelector('button[type="submit"]')!.textContent).toBe("Save new password");
  });

  it("is busy while saving, and Cancel waits too", () => {
    const el = footer(<FormFooter saving onCancel={() => {}} />);
    const [cancel, save] = [...el.querySelectorAll("button")];
    expect(save.getAttribute("aria-busy")).toBe("true");
    expect(save.hasAttribute("disabled")).toBe(true);
    expect(cancel.hasAttribute("disabled")).toBe(true);
  });

  it("can drop the line when the form has its own edge", () => {
    expect(footer(<FormFooter divider={false} />).className).not.toContain("border-t");
  });
});
