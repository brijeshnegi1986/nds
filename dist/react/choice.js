"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef } from "react";
import { iconMask } from "./icons.js";
/** The NDS radio dot (Figma 119:1247): a 20px ring in border-strong that
 * turns the selected colour on hover, and when picked a disc in the selected
 * colour (--color-control-selected, orange unless the app sets it) with a
 * 10px dot in --color-control-on-selected (content-on-primary unless set). Native, so keyboard and screen readers work as usual;
 * the focus ring is drawn by the tile around it. */
const RADIO = "size-5 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-(--color-border-strong) bg-(--color-surface-default) transition-colors group-hover:border-[var(--color-control-selected,var(--color-action-primary))] checked:border-[var(--color-control-selected,var(--color-action-primary))] checked:bg-[var(--color-control-on-selected,var(--color-content-on-primary))] checked:shadow-[inset_0_0_0_3.5px_var(--color-control-selected,var(--color-action-primary))] focus-visible:outline-none aria-[invalid=true]:border-(--color-border-error) disabled:cursor-not-allowed disabled:border-(--color-border-disabled) disabled:bg-(--color-action-disabled) disabled:group-hover:border-(--color-border-disabled) disabled:checked:bg-(--color-content-disabled) disabled:checked:shadow-[inset_0_0_0_3.5px_var(--color-action-disabled)]";
/**
 * A required single choice as NDS Radio tiles (Figma "Radio", Type=Tile): a
 * white tile with the sm elevation, a border in the selected colour when picked, and the
 * focus ring around the tile. The design's tile has a caption-size label
 * only; these add a line of description under a 14px title, since the
 * choices here need explaining. The whole tile picks its option.
 */
export function RadioTiles({ legend, name, value, onChange, options, }) {
    const id = useId();
    return (_jsxs("fieldset", { className: "flex flex-col gap-2", children: [_jsx("legend", { className: "mb-2 text-sm font-medium text-(--color-content-primary)", children: legend }), _jsx("div", { className: "grid items-start gap-3 sm:grid-cols-2", children: options.map((option) => {
                    const picked = option.value === value;
                    const descriptionId = `${id}-${option.value}`;
                    return (_jsxs("div", { onClick: () => !picked && onChange(option.value), className: `group flex cursor-pointer flex-col gap-1 rounded-(--radius-sm) border bg-(--color-surface-default) px-3 py-3 shadow-[0_var(--elevation-sm)_2px_rgb(0_0_0/0.1)] transition-colors has-[input[type=radio]:focus-visible]:outline-2 has-[input[type=radio]:focus-visible]:outline-offset-2 has-[input[type=radio]:focus-visible]:outline-(--color-border-focus) ${picked ? "border-[var(--color-control-selected,var(--color-action-primary))]" : "border-transparent"}`, children: [_jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-sm font-medium text-(--color-content-primary)", children: [_jsx("input", { type: "radio", name: name, value: option.value, checked: picked, onChange: () => onChange(option.value), "aria-describedby": descriptionId, className: RADIO }), option.title] }), _jsx("p", { id: descriptionId, className: "pl-7 text-xs text-(--color-content-secondary)", children: option.description }), picked && option.extra && _jsx("div", { className: "pt-2 pl-7", children: option.extra })] }, option.value));
                }) })] }));
}
/**
 * The NDS Checkbox (Figma "Checkboxes", Variant=Basic): a 20px box with a
 * 4px radius in border-strong, filled in the selected colour with a tick (or, part-selected,
 * a bar) in --color-control-on-selected when checked, and the 2px border-focus ring.
 * Disabled and error states as in Figma. Label at 14px, with an optional
 * hint under it linked by aria-describedby; without a visible label, give it
 * an aria-label.
 */
export function Checkbox({ label, hint, checked, onChange, disabled = false, indeterminate = false, invalid = false, "aria-label": ariaLabel, }) {
    const hintId = useId();
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current)
            ref.current.indeterminate = indeterminate;
    }, [indeterminate]);
    const box = (_jsxs("span", { className: "relative flex size-5 shrink-0", children: [_jsx("input", { ref: ref, type: "checkbox", checked: checked, disabled: disabled, onChange: (e) => onChange(e.target.checked), "aria-label": ariaLabel, "aria-invalid": invalid || undefined, "aria-describedby": hint ? hintId : undefined, className: "peer size-5 cursor-pointer appearance-none rounded-(--radius-sm) border-[1.5px] border-(--color-border-strong) bg-(--color-surface-default) transition-colors group-hover:border-[var(--color-control-selected,var(--color-action-primary))] checked:border-[var(--color-control-selected,var(--color-action-primary))] checked:bg-[var(--color-control-selected,var(--color-action-primary))] indeterminate:border-[var(--color-control-selected,var(--color-action-primary))] indeterminate:bg-[var(--color-control-selected,var(--color-action-primary))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus) aria-[invalid=true]:border-(--color-border-error) disabled:cursor-not-allowed disabled:border-(--color-border-disabled) disabled:bg-(--color-action-disabled) disabled:group-hover:border-(--color-border-disabled)" }), _jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 hidden bg-[var(--color-control-on-selected,var(--color-content-on-primary))] peer-checked:block peer-indeterminate:hidden peer-disabled:bg-(--color-content-disabled)", style: {
                    ...iconMask("check"),
                } }), _jsx("span", { "aria-hidden": true, className: "pointer-events-none absolute inset-x-1 top-1/2 hidden h-0.5 -translate-y-1/2 rounded-full bg-[var(--color-control-on-selected,var(--color-content-on-primary))] peer-indeterminate:block peer-disabled:bg-(--color-content-disabled)" })] }));
    if (!label)
        return _jsx("span", { className: "group inline-flex", children: box });
    return (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("label", { className: `group flex items-center gap-2 text-sm ${disabled ? "cursor-not-allowed text-(--color-content-disabled)" : "cursor-pointer text-(--color-content-primary)"}`, children: [box, label] }), hint && (_jsx("p", { id: hintId, className: "pl-7 text-xs text-(--color-content-secondary)", children: hint }))] }));
}
/**
 * The NDS Radio (Figma "Radio", Type=Basic): the radio dot with a label and,
 * optionally, a line of description under it (linked by aria-describedby).
 * Group several inside a fieldset with a legend.
 */
export function Radio({ name, checked, onChange, label, description, disabled = false, }) {
    const descriptionId = useId();
    return (_jsxs("label", { className: `group flex items-start gap-2 text-sm ${disabled ? "cursor-not-allowed text-(--color-content-disabled)" : "cursor-pointer text-(--color-content-primary)"}`, children: [_jsx("input", { type: "radio", name: name, checked: checked, disabled: disabled, onChange: onChange, "aria-describedby": description ? descriptionId : undefined, className: `${RADIO} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus)` }), _jsxs("span", { className: "pt-px", children: [label, description && (_jsx("span", { id: descriptionId, className: "block text-xs text-(--color-content-secondary)", children: description }))] })] }));
}
