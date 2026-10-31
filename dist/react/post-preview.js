import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** The channel's own reactions under a post: decoration only. */
const REACTIONS = {
    facebook: ["Like", "Comment", "Share"],
    linkedin: ["Like", "Comment", "Repost", "Send"],
};
function Glyph({ d }) {
    return (_jsx("svg", { viewBox: "0 0 24 24", className: "size-5", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
const HEART = "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z";
const BUBBLE = "M4 12a8 8 0 1 1 3.3 6.5L4 20l1.2-3.4A8 8 0 0 1 4 12z";
const SEND = "M21 4 3 11l7 3 3 7 8-17zM10 14l11-10";
const REPOST = "M7 7h10l-3-3M17 17H7l3 3M17 7v4M7 17v-4";
/**
 * A social post as it will look on its channel (Facebook, Instagram,
 * LinkedIn, Threads, Pinterest): who posts it with their avatar, when, the image on top with
 * the text under it, and the channel's reactions. The reactions are
 * decoration, hidden from screen readers.
 *
 * `children` is the post's text, or an editor for it. Without `avatar` the
 * avatar is the name's first letter. `imagePlaceholder` fills the image's
 * place until there is one (Instagram and Pinterest need one). A Pin
 * shows its `title` in bold under a tall 2:3 image, and has no reactions bar.
 */
export function PostPreview({ platform, name, meta, avatar, icon, image, imageAlt = "", imagePlaceholder, title, className = "", children, }) {
    const instagram = platform === "instagram";
    const threads = platform === "threads";
    const pinterest = platform === "pinterest";
    // A Google Business Profile update: the photo, then the text; no likes or comments.
    const google = platform === "google_business";
    const shape = instagram ? "aspect-square" : pinterest ? "aspect-[2/3]" : null;
    const picture = image ? (_jsx("img", { src: image, alt: imageAlt, className: `w-full bg-(--color-surface-raised) object-cover ${shape ?? "max-h-96"}` })) : imagePlaceholder ? (_jsx("div", { className: `flex items-center justify-center bg-(--color-surface-raised) p-6 text-center text-sm text-(--color-content-secondary) ${shape ?? "min-h-28"}`, children: imagePlaceholder })) : null;
    const body = _jsx("div", { className: "px-4 text-sm leading-relaxed whitespace-pre-wrap text-(--color-content-primary)", children: children });
    return (_jsxs("article", { "data-platform": platform, className: `flex flex-col gap-3 overflow-hidden rounded-(--radius-lg) border border-(--color-border-subtle) bg-(--color-surface-default) pt-4 pb-3 ${className}`.trim(), children: [_jsxs("header", { className: "flex items-center gap-3 px-4", children: [icon ? (_jsx("span", { "aria-hidden": true, className: "flex size-10 shrink-0 items-center justify-center", children: icon })) : avatar ? (_jsx("img", { src: avatar, alt: "", className: "size-10 shrink-0 rounded-full object-cover" })) : (_jsx("span", { "data-avatar": true, "aria-hidden": true, className: "flex size-10 shrink-0 items-center justify-center rounded-full bg-(--color-action-disabled) text-sm font-semibold text-(--color-content-primary)", children: name.trim().charAt(0).toUpperCase() })), _jsxs("span", { className: "flex min-w-0 flex-col", children: [_jsx("span", { className: "truncate text-sm font-semibold text-(--color-content-primary)", children: name }), meta && _jsx("span", { className: "truncate text-xs text-(--color-content-secondary)", children: meta })] })] }), picture, instagram ? (_jsxs(_Fragment, { children: [_jsxs("div", { "data-reactions": true, "aria-hidden": "true", className: "flex items-center gap-4 px-4 text-(--color-content-primary)", children: [_jsx(Glyph, { d: HEART }), _jsx(Glyph, { d: BUBBLE }), _jsx(Glyph, { d: SEND })] }), body] })) : pinterest ? (_jsxs(_Fragment, { children: [title && (_jsx("div", { "data-title": true, className: "px-4 text-base font-semibold text-(--color-content-primary)", children: title })), body] })) : google ? (body) : threads ? (_jsxs(_Fragment, { children: [body, _jsxs("div", { "data-reactions": true, "aria-hidden": "true", className: "flex items-center gap-4 px-4 text-(--color-content-primary)", children: [_jsx(Glyph, { d: HEART }), _jsx(Glyph, { d: BUBBLE }), _jsx(Glyph, { d: REPOST }), _jsx(Glyph, { d: SEND })] })] })) : (_jsxs(_Fragment, { children: [body, _jsx("div", { "data-reactions": true, "aria-hidden": "true", className: "mx-4 flex items-center justify-around border-t border-(--color-border-subtle) pt-2 text-xs font-medium text-(--color-content-secondary)", children: (REACTIONS[platform] ?? REACTIONS.facebook).map((label) => (_jsx("span", { children: label }, label))) })] }))] }));
}
