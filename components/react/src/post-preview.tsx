import type { ReactNode } from "react";

/** The channel's own reactions under a post: decoration only. */
const REACTIONS: Record<string, string[]> = {
  facebook: ["Like", "Comment", "Share"],
  linkedin: ["Like", "Comment", "Repost", "Send"],
};

function Glyph({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
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
export function PostPreview({
  platform,
  name,
  meta,
  avatar,
  icon,
  image,
  imageAlt = "",
  imagePlaceholder,
  title,
  className = "",
  children,
}: {
  platform: string;
  name: string;
  /** Under the name, e.g. "Just now · Facebook". */
  meta?: ReactNode;
  avatar?: string | null;
  /** In place of the avatar: the channel's logo, about 40px. */
  icon?: ReactNode;
  image?: string | null;
  imageAlt?: string;
  imagePlaceholder?: ReactNode;
  /** A Pin's title, shown above the text (Pinterest only). */
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const instagram = platform === "instagram";
  const threads = platform === "threads";
  const pinterest = platform === "pinterest";
  // A Google Business Profile update: the photo, then the text; no likes or comments.
  const google = platform === "google_business";
  const shape = instagram ? "aspect-square" : pinterest ? "aspect-[2/3]" : null;
  const picture = image ? (
    <img src={image} alt={imageAlt} className={`w-full bg-(--color-surface-raised) object-cover ${shape ?? "max-h-96"}`} />
  ) : imagePlaceholder ? (
    <div
      className={`flex items-center justify-center bg-(--color-surface-raised) p-6 text-center text-sm text-(--color-content-secondary) ${
        shape ?? "min-h-28"
      }`}
    >
      {imagePlaceholder}
    </div>
  ) : null;

  const body = <div className="px-4 text-sm leading-relaxed whitespace-pre-wrap text-(--color-content-primary)">{children}</div>;

  return (
    <article
      data-platform={platform}
      className={`flex flex-col gap-3 overflow-hidden rounded-(--radius-lg) border border-(--color-border-subtle) bg-(--color-surface-default) pt-4 pb-3 ${className}`.trim()}
    >
      <header className="flex items-center gap-3 px-4">
        {icon ? (
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center">
            {icon}
          </span>
        ) : avatar ? (
          <img src={avatar} alt="" className="size-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            data-avatar
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--color-action-disabled) text-sm font-semibold text-(--color-content-primary)"
          >
            {name.trim().charAt(0).toUpperCase()}
          </span>
        )}
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-(--color-content-primary)">{name}</span>
          {meta && <span className="truncate text-xs text-(--color-content-secondary)">{meta}</span>}
        </span>
      </header>

      {picture}
      {instagram ? (
        <>
          <div data-reactions aria-hidden="true" className="flex items-center gap-4 px-4 text-(--color-content-primary)">
            <Glyph d={HEART} />
            <Glyph d={BUBBLE} />
            <Glyph d={SEND} />
          </div>
          {body}
        </>
      ) : pinterest ? (
        <>
          {title && (
            <div data-title className="px-4 text-base font-semibold text-(--color-content-primary)">
              {title}
            </div>
          )}
          {body}
        </>
      ) : google ? (
        body
      ) : threads ? (
        <>
          {body}
          <div data-reactions aria-hidden="true" className="flex items-center gap-4 px-4 text-(--color-content-primary)">
            <Glyph d={HEART} />
            <Glyph d={BUBBLE} />
            <Glyph d={REPOST} />
            <Glyph d={SEND} />
          </div>
        </>
      ) : (
        <>
          {body}
          <div
            data-reactions
            aria-hidden="true"
            className="mx-4 flex items-center justify-around border-t border-(--color-border-subtle) pt-2 text-xs font-medium text-(--color-content-secondary)"
          >
            {(REACTIONS[platform] ?? REACTIONS.facebook).map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
