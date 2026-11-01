"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { buttonClassName } from "./button.js";

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
export function ActionMenu({
  label,
  items,
  kind = "more",
  icon,
  badge,
  heading,
  text,
  className = "",
}: {
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
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();

  function close(refocus: boolean) {
    setOpen(false);
    if (refocus) button.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLButtonElement>("[role='menuitem']:not(:disabled)")?.focus();
    const outside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open]);

  function onKeyDown(event: React.KeyboardEvent) {
    const all = [...(menu.current?.querySelectorAll<HTMLButtonElement>("[role='menuitem']:not(:disabled)") ?? [])];
    const at = all.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      all[(at + step + all.length) % all.length]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className={`relative inline-block ${className}`.trim()}>
      <button
        ref={button}
        type="button"
        aria-label={label}
        title={kind === "button" ? undefined : label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={kind === "button" ? buttonClassName("secondary", "sm") : `relative flex items-center justify-center rounded-full text-(--color-content-secondary) transition-colors hover:bg-(--color-action-tertiary-hover) hover:text-(--color-content-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus) ${
          kind === "add"
            ? "size-11 border border-dashed border-(--color-border-subtle)"
            : kind === "channel"
              ? "size-11 border border-(--color-border-subtle) bg-(--color-surface-default)"
              : "size-8"
        }`}
      >
        {kind === "button" ? (
          <>
            {text}
            <svg data-part="chevron" aria-hidden viewBox="0 0 20 20" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 8 5 5 5-5" />
            </svg>
          </>
        ) : kind === "channel" ? (
          <>
            <span data-part="logo" aria-hidden className="inline-flex opacity-50">
              {icon}
            </span>
            {badge && (
              <span
                data-part="badge"
                aria-hidden
                className="absolute -right-1 -bottom-1 flex size-4.5 items-center justify-center rounded-full bg-(--color-surface-default) text-[10px] font-semibold text-(--color-content-secondary) ring-1 ring-(--color-border-subtle)"
              >
                {badge}
              </span>
            )}
          </>
        ) : kind === "add" ? (
          <svg data-part="plus" aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M10 4v12M4 10h12" />
          </svg>
        ) : (
          <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="currentColor">
            <circle cx="4.5" cy="10" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="15.5" cy="10" r="1.5" />
          </svg>
        )}
      </button>
      {open && (
        <div
          ref={menu}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onKeyDown}
          className={`absolute ${kind === "more" || kind === "button" ? "right-0" : "left-0"} z-30 mt-1 flex min-w-44 flex-col rounded-(--radius-lg) border border-(--color-border-subtle) bg-(--color-surface-default) p-1 shadow-[0_var(--elevation-lg)_24px_rgb(0_0_0/0.16)]`}
        >
          {heading && (
            <p data-part="heading" className="max-w-64 px-3 pt-2 pb-1 text-xs text-(--color-content-secondary)">
              {heading}
            </p>
          )}
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                close(true);
                item.onSelect();
              }}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm whitespace-nowrap transition-colors hover:bg-(--color-action-tertiary-hover) focus-visible:bg-(--color-action-tertiary-hover) focus-visible:outline-none disabled:cursor-not-allowed disabled:text-(--color-content-disabled) disabled:hover:bg-transparent ${
                item.tone === "danger" ? "text-(--color-status-error)" : "text-(--color-content-primary)"
              }`}
            >
              {item.icon && (
                <span aria-hidden className="inline-flex shrink-0">
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
