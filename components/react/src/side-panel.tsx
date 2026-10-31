"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** A chevron pointing the way the handle moves the panel. */
function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={`size-5 ${direction === "left" ? "rotate-180" : ""}`} fill="none">
      <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Below xl the pulled-out panel is a drawer over the page. */
const DRAWER_QUERY = "(max-width: 1279px)";
function isDrawer(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(DRAWER_QUERY).matches;
}

/** The pushed-in strip's window edge from xl (the left one docks against the sidebar). */
const EDGE = { right: "xl:right-0", left: "xl:left-[var(--app-sidebar-width,0px)]" } as const;

const HANDLE =
  "flex size-10 shrink-0 items-center justify-center rounded-full text-(--color-content-secondary) transition-colors hover:bg-(--color-surface-default) hover:text-(--color-content-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus)";

/**
 * A summary or secondary navigation beside a page's main content (Figma
 * "Side panel", page 35): a profile's steps and who it writes as, the free
 * trial's progress next to the setup checklist, a post's AI review. The
 * sidebar's raised grey with no edge or shadow, so it reads as secondary to
 * the white card being worked on rather than competing with it. Inside it,
 * a current item is white, like the sidebar's active item.
 *
 * Its partner is TipPanel (the aqua tip surface), for help and tips. Pick by
 * what it says: help is a TipPanel, a summary or navigation is a SidePanel.
 *
 * An <aside> named by `label`, or by a heading inside it via `labelledBy`.
 *
 * `collapse` lets people push it in and pull it out (a preview beside a
 * form, a tray beside a calendar). It then shows its own header: `label` as
 * the title and a 40px handle. The page keeps the open/closed state (and
 * may remember it).
 * - From xl it's a proper side panel: fixed to the window's edge from under
 *   the 64px page header to the bottom, 384px wide (256px at size "sm")
 *   with its own scroll, or a 48px strip pushed in. It marks itself with
 *   data-dock and data-size so the page can keep that room free. On the
 *   left it docks against the app's sidebar, whose width the app gives as
 *   --app-sidebar-width.
 * - Below xl, pulled out, it slides over the page as a drawer, full height,
 *   over a scrim; the scrim or Escape pushes it back in. Pushed in, it's a
 *   one-line "Show …" bar where the page puts it.
 * Opening as a drawer moves focus to its handle; pushing it in brings focus
 * back to the Show handle rather than losing it.
 */
export function SidePanel({
  label,
  labelledBy,
  className = "",
  dock,
  collapse,
  children,
}: {
  label?: string;
  labelledBy?: string;
  className?: string;
  /** Docked full height at this window edge from xl, always out (a page's
   * own controls, which shouldn't be pushed away); in the page's flow below
   * xl. The page keeps its room free, as for a collapsible one. */
  dock?: "left" | "right";
  collapse?: {
    open: boolean;
    onToggle: () => void;
    /** Which edge it sits on: the handle points that way to push it in. */
    side: "left" | "right";
    /** The id of the content it hides, for aria-controls. */
    controls?: string;
    /** Its width pulled out from xl: md 384px (default), sm 256px for a
     * tray beside a wide grid, lg 480px for post previews at feed width. */
    size?: "sm" | "md" | "lg";
  };
  children: ReactNode;
}) {
  const open = collapse?.open;
  const onToggle = collapse?.onToggle;
  const hideRef = useRef<HTMLButtonElement>(null);
  const showRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(open);

  // Focus follows the panel: into the drawer when it opens, and back to the
  // Show handle when it's pushed in (its Hide handle is gone with it).
  useEffect(() => {
    if (open === undefined || wasOpen.current === open) return;
    wasOpen.current = open;
    if (open && isDrawer()) hideRef.current?.focus();
    if (!open && (!document.activeElement || document.activeElement === document.body)) showRef.current?.focus();
  }, [open]);

  // Escape pushes the drawer back in; docked beside the page, it stays.
  useEffect(() => {
    if (!open || !onToggle) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isDrawer()) onToggle();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onToggle]);

  if (!collapse) {
    const docked = dock
      ? `overflow-y-auto xl:fixed xl:top-16 xl:bottom-0 xl:z-10 xl:w-96 xl:rounded-none ${EDGE[dock]}`
      : "";
    return (
      <aside
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
        {...(dock ? { "data-dock": dock, "data-size": "md", "data-state": "expanded" } : {})}
        className={`flex flex-col gap-5 rounded-(--radius-lg) bg-(--color-surface-raised) p-6 ${docked} ${className}`.replace(/\s+/g, " ").trim()}
      >
        {children}
      </aside>
    );
  }

  const { side, controls, size = "md" } = collapse;
  // Where it docks and how wide, so the page can keep that room free.
  const dockAttrs = { "data-dock": side, "data-size": size };
  const name = label ?? "";
  // Pushing in moves it toward its own edge; pulling out, away from it.
  const pushIn = side;
  const pullOut = side === "right" ? "left" : "right";

  if (!open) {
    return (
      <aside
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
        data-state="collapsed"
        {...dockAttrs}
        className={`flex items-center gap-2 rounded-(--radius-lg) bg-(--color-surface-raised) p-1.5 xl:fixed xl:top-16 xl:bottom-0 xl:z-10 xl:w-12 xl:flex-col xl:rounded-none xl:py-3 ${EDGE[side]} ${className}`.trim()}
      >
        <button
          ref={showRef}
          type="button"
          aria-expanded={false}
          aria-controls={controls}
          aria-label={`Show ${name}`}
          title={`Show ${name}`}
          onClick={onToggle}
          className={HANDLE}
        >
          <Chevron direction={pullOut} />
        </button>
        <span aria-hidden className="text-sm font-medium text-(--color-content-secondary) xl:[writing-mode:vertical-rl]">
          {name}
        </span>
      </aside>
    );
  }

  return (
    <>
    <div
      data-side-panel-scrim
      aria-hidden
      onClick={onToggle}
      className="fixed inset-0 z-40 bg-(--color-overlay-scrim) xl:hidden"
    />
    <aside
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      data-state="expanded"
      {...dockAttrs}
      className={`fixed inset-y-0 z-50 flex ${size === "lg" ? "w-[min(30rem,calc(100vw-2rem))] xl:w-[30rem]" : `w-[min(24rem,calc(100vw-2rem))] ${size === "sm" ? "xl:w-64" : "xl:w-96"}`} flex-col gap-5 overflow-y-auto bg-(--color-surface-raised) p-6 shadow-[0_var(--elevation-lg)_24px_rgb(0_0_0/0.16)] xl:top-16 xl:bottom-0 xl:z-10 xl:shadow-none ${side === "right" ? "right-0" : "left-0 xl:left-[var(--app-sidebar-width,0px)]"} ${className}`.trim()}
    >
      <div className="-my-2 flex items-center justify-between gap-2">
        <h2 id={labelledBy} className="text-base font-semibold text-(--color-content-primary)">{name}</h2>
        <button
          ref={hideRef}
          type="button"
          aria-expanded
          aria-controls={controls}
          aria-label={`Hide ${name}`}
          title={`Hide ${name}`}
          onClick={onToggle}
          className={`${HANDLE} -mr-2`}
        >
          <Chevron direction={pushIn} />
        </button>
      </div>
      <div id={controls} className="flex flex-col gap-5">
        {children}
      </div>
    </aside>
    </>
  );
}
