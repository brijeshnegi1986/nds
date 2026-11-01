"use client";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * An on/off toggle for settings that take effect as a whole (e.g. "Publish
 * automatically") - reads better than a checkbox for a feature
 * switch. A real <button role="switch">, so it's keyboard- and
 * screen-reader-operable; `label` names it for assistive tech when the
 * visible label lives elsewhere.
 */
export function Switch({ checked, onChange, label, disabled = false, }) {
    return (_jsx("button", { type: "button", role: "switch", "aria-checked": checked, "aria-label": label, disabled: disabled, onClick: () => onChange(!checked), className: `relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus) disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-[var(--color-control-selected,var(--color-action-primary))]" : "bg-(--color-border-subtle)"}`, children: _jsx("span", { "aria-hidden": true, className: `inline-block h-5 w-5 rounded-full bg-(--color-surface-default) shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}` }) }));
}
