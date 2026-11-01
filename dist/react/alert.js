import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { iconMask } from "./icons.js";
const TONES = {
    neutral: { fill: "bg-(--color-surface-raised)", text: "text-(--color-content-primary)", stripe: "bg-(--color-content-secondary)", icon: "info" },
    info: { fill: "bg-(--color-status-info-subtle)", text: "text-(--color-status-info)", stripe: "bg-(--color-status-info)", icon: "info" },
    success: { fill: "bg-(--color-status-success-subtle)", text: "text-(--color-status-success)", stripe: "bg-(--color-status-success)", icon: "check-circle-filled" },
    warning: { fill: "bg-(--color-status-warning-subtle)", text: "text-(--color-status-warning)", stripe: "bg-(--color-status-warning)", icon: "warning-filled" },
    error: { fill: "bg-(--color-status-error-subtle)", text: "text-(--color-status-error)", stripe: "bg-(--color-status-error)", icon: "error-filled" },
};
/**
 * The NDS Alert (Figma "Alert", 426:540): the status's subtle fill, a 4px
 * stripe in the status colour down the left, a 20px status icon (the
 * outlined info for info and neutral; filled check circle, warning and
 * error for the others) beside an optional 14/20 medium title in the
 * status colour, then the 14/20 message in the primary text colour. 8px
 * corners, the sm elevation, 16px across and 12px down. An error is announced
 * at once (role="alert"); the others politely (role="status"); pass role={null}
 * for a step the person is already looking at, like a delete confirmation.
 *
 * `onDismiss` makes it dismissible: a "Got it" text button (or
 * `dismissLabel`) at the end of its first line, the one way a notice is put
 * away, never a big round close icon.
 */
export function Alert({ tone = "info", title, icon, role, className = "", children, onDismiss, dismissLabel = "Got it", ...rest }) {
    const t = TONES[tone];
    const liveRole = role === null ? undefined : (role ?? (tone === "error" ? "alert" : "status"));
    const glyph = (_jsx("span", { "data-part": "icon", "data-icon": icon ? "custom" : t.icon, "aria-hidden": true, className: `mt-0.5 flex size-5 shrink-0 ${t.text}`, children: icon ?? (_jsx("span", { className: "size-5 bg-current", style: iconMask(t.icon) })) }));
    const dismiss = onDismiss && (_jsx("button", { type: "button", onClick: onDismiss, className: "ml-auto shrink-0 rounded-sm pt-px pl-3 font-medium text-(--color-content-primary) underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus)", children: dismissLabel }));
    return (_jsxs("div", { role: liveRole, ...rest, className: `relative flex flex-col gap-1 overflow-hidden rounded-(--radius-md) px-4 py-3 text-(length:--type-font-size-body-small) leading-(--type-line-height-body-small) shadow-[0_var(--elevation-sm)_2px_rgb(0_0_0/0.1)] ${t.fill} ${className}`.trim(), children: [_jsx("span", { "data-part": "indicator", "aria-hidden": true, className: `absolute inset-y-0 left-0 w-1 ${t.stripe}` }), title ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-start gap-1", children: [glyph, _jsx("p", { "data-part": "title", className: `pt-px font-medium ${t.text}`, children: title }), dismiss] }), children && _jsx("div", { className: "text-(--color-content-primary)", children: children })] })) : (_jsxs("div", { className: "flex items-start gap-1", children: [glyph, _jsx("div", { className: "min-w-0 pt-px text-(--color-content-primary)", children: children }), dismiss] }))] }));
}
