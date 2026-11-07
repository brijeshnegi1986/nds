/** PostPreview: a social post as it will look on its channel. */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PostPreview, SidePanel } from "../src/index.js";

const dom = (node: React.ReactElement) =>
  new DOMParser().parseFromString(renderToStaticMarkup(node), "text/html").body.firstElementChild as HTMLElement;

describe("PostPreview", () => {
  it("shows who posts it, when, the text and the image, like the channel does", () => {
    const el = dom(
      <PostPreview platform="facebook" name="NegiFlow" meta="Just now · Facebook" image="https://cdn.example/p.jpg" imageAlt="Fresh rye">
        <p>Fresh rye is back.</p>
      </PostPreview>,
    );
    expect(el.getAttribute("data-platform")).toBe("facebook");
    expect(el.textContent).toContain("NegiFlow");
    expect(el.textContent).toContain("Just now · Facebook");
    expect(el.textContent).toContain("Fresh rye is back.");
    expect(el.querySelector("img")!.getAttribute("alt")).toBe("Fresh rye");
    // The avatar is the name's first letter without a picture.
    expect(el.querySelector("[data-avatar]")!.textContent).toBe("N");
  });

  it("puts the image on top and the text under it, on every channel", () => {
    const order = (platform: string) => {
      const el = dom(
        <PostPreview platform={platform} name="NegiFlow" image="https://cdn.example/p.jpg">
          <p data-body>Text</p>
        </PostPreview>,
      );
      const body = el.querySelector("[data-body]")!;
      const img = el.querySelector("img")!;
      return body.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING ? "text first" : "image first";
    };
    expect(order("facebook")).toBe("image first");
    expect(order("linkedin")).toBe("image first");
    expect(order("instagram")).toBe("image first");
    expect(order("threads")).toBe("image first");
    expect(order("pinterest")).toBe("image first");
  });

  it("shows Threads' icons under the text: like, reply, repost and share, as decoration", () => {
    const el = dom(<PostPreview platform="threads" name="negiflow"><p data-body>Fresh rye is back.</p></PostPreview>);
    const bar = el.querySelector("[data-reactions]")!;
    expect(bar.getAttribute("aria-hidden")).toBe("true");
    expect(bar.querySelectorAll("svg")).toHaveLength(4);
    // Icons only, no Facebook-style words.
    expect(bar.textContent).toBe("");
    expect(el.querySelector("[data-body]")!.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows the channel's reactions as decoration, hidden from screen readers", () => {
    const el = dom(<PostPreview platform="linkedin" name="NegiFlow"><p>x</p></PostPreview>);
    const bar = el.querySelector("[data-reactions]")!;
    expect(bar.getAttribute("aria-hidden")).toBe("true");
    expect(bar.textContent).toContain("Repost");
  });

  it("shows a Pin: a tall image, the Pin's title in bold, the text, and no reactions bar", () => {
    const el = dom(
      <PostPreview platform="pinterest" name="harbourlane" title="Keep a starter alive" image="https://cdn.example/p.jpg">
        <p data-body>Feed it daily.</p>
      </PostPreview>,
    );
    expect(el.querySelector("img")!.className).toContain("aspect-[2/3]");
    const title = el.querySelector("[data-title]")!;
    expect(title.textContent).toBe("Keep a starter alive");
    expect(title.compareDocumentPosition(el.querySelector("[data-body]")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(el.querySelector("[data-reactions]")).toBeNull();
  });

  it("shows a Google Business Profile update: the photo, then the text, with no reactions bar", () => {
    const el = dom(
      <PostPreview platform="google_business" name="Harbour Lane Bakery" image="https://cdn.example/p.jpg">
        <p data-body>Winter menu from Monday.</p>
      </PostPreview>,
    );
    expect(el.getAttribute("data-platform")).toBe("google_business");
    expect(el.querySelector("img")!.compareDocumentPosition(el.querySelector("[data-body]")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Google's updates have no likes or comments.
    expect(el.querySelector("[data-reactions]")).toBeNull();
  });

  it("renders the title as a heading when the platform is website", () => {
    const el = dom(
      <PostPreview platform="website" name="Harbour Lane Bakery" title="Keep a starter alive">
        {"Feed it daily."}
      </PostPreview>,
    );
    expect(el.getAttribute("data-platform")).toBe("website");
    const h = el.querySelector("h3")!;
    expect(h.textContent).toBe("Keep a starter alive");
    expect(el.querySelector("[data-title]")).toBeNull();
  });

  it("shows no reactions bar for a website post", () => {
    const el = dom(
      <PostPreview platform="website" name="Harbour Lane Bakery" title="T" image="https://cdn.example/h.jpg">
        {"Body."}
      </PostPreview>,
    );
    expect(el.querySelector("[data-reactions]")).toBeNull();
    expect(el.querySelector("img")!.getAttribute("src")).toBe("https://cdn.example/h.jpg");
  });

  it('renders "## How it works" as a heading, not as literal hashes', () => {
    const el = dom(
      <PostPreview platform="website" name="Harbour Lane Bakery" title="T">
        {"Intro paragraph.\n\n## How it works\nMix and wait."}
      </PostPreview>,
    );
    const h = el.querySelector("h4")!;
    expect(h.textContent).toBe("How it works");
    expect(el.textContent).not.toContain("##");
    expect(el.textContent).toContain("Intro paragraph.");
    expect(el.textContent).toContain("Mix and wait.");
  });

  it("renders a <script> tag in the body as visible text, not as markup", () => {
    const el = dom(
      <PostPreview platform="website" name="Harbour Lane Bakery" title="T">
        {"Hello <script>alert(1)</script>\n## <b>bold</b> heading"}
      </PostPreview>,
    );
    expect(el.querySelector("script")).toBeNull();
    expect(el.querySelector("b")).toBeNull();
    expect(el.textContent).toContain("<script>alert(1)</script>");
    expect(el.querySelector("h4")!.textContent).toBe("<b>bold</b> heading");
  });

  it("shows the image placeholder for a website post with no image", () => {
    const el = dom(
      <PostPreview platform="website" name="Harbour Lane Bakery" title="T" imagePlaceholder={<span data-ph>Add a hero image</span>}>
        {"Body."}
      </PostPreview>,
    );
    expect(el.querySelector("[data-ph]")!.textContent).toBe("Add a hero image");
    expect(el.querySelector("img")).toBeNull();
  });

  it("keeps a website body with no ## lines intact and emits no subheadings", () => {
    const el = dom(
      <PostPreview platform="website" name="Harbour Lane Bakery" title="T">
        {"First paragraph.\n\nSecond paragraph."}
      </PostPreview>,
    );
    expect(el.querySelector("h4")).toBeNull();
    expect(el.textContent).toContain("First paragraph.");
    expect(el.textContent).toContain("Second paragraph.");
  });

  it("recognises ## headings in a website body with \\r\\n line endings, with no stray \\r", () => {
    // Check the markup string: an HTML parser would normalise a \r away and hide a regression.
    const html = renderToStaticMarkup(
      <PostPreview platform="website" name="Harbour Lane Bakery" title="T">
        {"Intro.\r\nMore.\r\n## How it works\r\nBody."}
      </PostPreview>,
    );
    expect(html).not.toContain("\r");
    const el = new DOMParser().parseFromString(html, "text/html").body;
    expect(el.querySelector("h4")!.textContent).toBe("How it works");
    expect(el.textContent).toContain("Intro.");
    expect(el.textContent).toContain("More.");
    expect(el.textContent).toContain("Body.");
  });

  it("does not turn an empty ## line into an empty heading", () => {
    const el = dom(
      <PostPreview platform="website" name="Harbour Lane Bakery" title="T">
        {"Intro.\n## \nMore."}
      </PostPreview>,
    );
    expect(el.querySelector("h4")).toBeNull();
    // The line stays as text rather than being dropped.
    expect(el.textContent).toContain("##");
    expect(el.textContent).toContain("Intro.");
    expect(el.textContent).toContain("More.");
  });

  it("can show the channel's logo where the letter avatar would be", () => {
    const el = dom(
      <PostPreview platform="facebook" name="Negiflow (Page)" icon={<span data-icon-facebook />}>
        <p>x</p>
      </PostPreview>,
    );
    expect(el.querySelector("[data-icon-facebook]")).not.toBeNull();
    expect(el.querySelector("[data-avatar]")).toBeNull();
  });

  it("shows a placeholder where Instagram's image goes until there is one", () => {
    const el = dom(
      <PostPreview platform="instagram" name="negiflow" imagePlaceholder="Add an image to post on Instagram">
        <p>x</p>
      </PostPreview>,
    );
    expect(el.querySelector("img")).toBeNull();
    expect(el.textContent).toContain("Add an image to post on Instagram");
  });
});

describe("SidePanel docked without collapse", () => {
  it("is always out, docked full height from xl, and says where it docks", () => {
    const el = dom(<SidePanel label="Review and publish" dock="right">x</SidePanel>);
    expect(el.tagName).toBe("ASIDE");
    expect(el.getAttribute("data-dock")).toBe("right");
    expect(el.getAttribute("data-state")).toBe("expanded");
    expect(el.className).toMatch(/xl:fixed\b.*xl:top-16\b.*xl:bottom-0\b/);
    expect(el.className).toContain("xl:right-0");
    expect(el.className).toContain("overflow-y-auto");
    expect(el.querySelector("button")).toBeNull();
  });
});
