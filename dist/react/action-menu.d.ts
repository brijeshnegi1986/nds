import { type ReactNode } from "react";
export type ActionMenuItem = {
    label: string;
    onSelect: () => void;
    disabled?: boolean;
    /** "danger" for a destructive action (red text). */
    tone?: "default" | "danger";
    /** A 20px icon before the label (a channel's logo). */
    icon?: ReactNode;
};
/**
 * A row's "⋯" menu of actions (an admin table's Edit, Set up, Archive): one
 * 32px icon button that opens a short list, so a row shows one control
 * instead of four. Named by `label` ("Actions for Growth"). Opening focuses
 * the first action; the arrow keys move, Escape or a click elsewhere closes,
 * and focus goes back to the button. Running an action closes the menu.
 *
 * `kind="add"` makes it an Add button instead: a 44px dashed round "+" (a
 * row of channel toggles' "+ Add channel"), whose menu opens to the right.
 *
 * `kind="channel"` is a channel connected somewhere else (another posting
 * profile): its logo (`icon`), faded, in a 44px round with a solid edge and
 * a small `badge` (the profile's initial) where the "+" would be; the menu
 * opens to the right, under a line saying where the channel is (`heading`).
 *
 * `kind="button"` is the black Secondary button (SM) with its own words
 * (`text`, "Connect a channel") and a chevron; its menu opens under its
 * right edge. `label` can say more for screen readers ("Connect a channel
 * to Stakemate").
 */
export declare function ActionMenu({ label, items, kind, icon, badge, heading, text, className, }: {
    label: string;
    items: ActionMenuItem[];
    kind?: "more" | "add" | "channel" | "button";
    /** kind="channel": the channel's logo, about 22px. */
    icon?: ReactNode;
    /** kind="channel": one or two characters, such as the profile's initial. */
    badge?: string;
    /** A line above the actions, saying what they're about. */
    heading?: ReactNode;
    /** kind="button": the button's words. */
    text?: string;
    className?: string;
}): import("react").JSX.Element;
