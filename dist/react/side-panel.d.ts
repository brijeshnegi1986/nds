import { type ReactNode } from "react";
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
export declare function SidePanel({ label, labelledBy, className, dock, collapse, children, }: {
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
}): import("react").JSX.Element;
