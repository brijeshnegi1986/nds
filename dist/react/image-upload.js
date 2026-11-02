"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId, useRef, useState } from "react";
import { Button } from "./button.js";
import { IconButton } from "./icon-button.js";
import { iconMask } from "./icons.js";
/** "2.4 MB", "640 KB". */
export function formatFileSize(bytes) {
    if (bytes >= 1024 * 1024)
        return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
function Glyph({ name, className }) {
    return _jsx("span", { "aria-hidden": true, className: `inline-block shrink-0 bg-current ${className}`, style: iconMask(name) });
}
function Tile({ name, tone = "default" }) {
    const look = {
        default: "bg-(--color-surface-default) text-(--color-content-secondary)",
        raised: "bg-(--color-surface-raised) text-(--color-content-secondary)",
        link: "bg-(--color-surface-raised) text-(--color-content-link)",
        error: "bg-(--color-status-error-subtle) text-(--color-status-error)",
        disabled: "bg-(--color-surface-default) text-(--color-content-disabled)",
    }[tone];
    return (_jsx("span", { "data-part": "icon", "data-icon": name, "aria-hidden": true, className: `flex size-12 shrink-0 items-center justify-center rounded-full ${look}`, children: _jsx(Glyph, { name: name, className: "size-6" }) }));
}
/**
 * The NDS Image upload (Figma "Image upload", 900:161): one image for a post,
 * by dragging a file onto it or clicking to browse.
 *
 * - Default: a dashed area, "Drag an image here, or browse", and the file
 *   rules. The whole area is the click target (a label for a hidden file
 *   input), so it works from the keyboard too.
 * - Drag over: a 2px primary edge while a file is held over it.
 * - Uploading / Uploaded / Error: driven by `state` from the owner, which does
 *   the upload when `onFile` hands it a file.
 * - Disabled: greyed out, with the reason.
 *
 * Before calling onFile the component checks the type against `accept` and
 * the size against `maxBytes`, and shows its own error if either fails.
 */
export function ImageUpload({ state, onFile, onRemove, accept = "image/jpeg,image/png,image/webp", typesLabel = "JPG, PNG or WebP", maxBytes = 8 * 1024 * 1024, disabled = false, disabledTitle = "Image uploads are off", disabledMessage, inputLabel = "Add an image", className = "", }) {
    const inputId = useId();
    const inputRef = useRef(null);
    const dragDepth = useRef(0);
    const [dragging, setDragging] = useState(false);
    const [localError, setLocalError] = useState(null);
    const limit = formatFileSize(maxBytes);
    const rules = `${typesLabel}, up to ${limit}`;
    const types = accept.split(",").map((t) => t.trim().toLowerCase());
    function take(file) {
        if (!file)
            return;
        if (types.length && !types.includes(file.type.toLowerCase())) {
            setLocalError({ title: "That file type isn't supported", message: `Choose a ${typesLabel} image.` });
            return;
        }
        if (file.size > maxBytes) {
            setLocalError({
                title: "This image is too big",
                message: `It's ${formatFileSize(file.size)} and the limit is ${limit}. Try a smaller ${typesLabel}.`,
            });
            return;
        }
        setLocalError(null);
        onFile(file);
    }
    function browse() {
        inputRef.current?.click();
    }
    const accepting = !disabled && (state.status === "idle" || state.status === "error" || state.status === "uploaded");
    const dropProps = accepting
        ? {
            onDragEnter: (e) => {
                e.preventDefault();
                dragDepth.current += 1;
                setDragging(true);
            },
            onDragOver: (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
            },
            onDragLeave: () => {
                dragDepth.current = Math.max(0, dragDepth.current - 1);
                if (dragDepth.current === 0)
                    setDragging(false);
            },
            onDrop: (e) => {
                e.preventDefault();
                dragDepth.current = 0;
                setDragging(false);
                take(e.dataTransfer.files?.[0]);
            },
        }
        : {};
    const fileInput = (_jsx("input", { ref: inputRef, id: inputId, type: "file", accept: accept, "aria-label": inputLabel, disabled: disabled, className: "sr-only", onChange: (e) => {
            take(e.target.files?.[0]);
            e.target.value = "";
        } }));
    const box = "flex w-full flex-col gap-3 rounded-(--radius-lg) border px-6";
    const text = "text-(length:--type-font-size-body-small) leading-(--type-line-height-body-small)";
    const small = "text-(length:--type-font-size-caption) leading-(--type-line-height-caption)";
    if (disabled) {
        return (_jsxs("div", { "data-state": "disabled", className: `${box} items-center border-dashed border-(--color-border-disabled) bg-(--color-action-disabled) py-8 text-center ${className}`.trim(), children: [_jsx(Tile, { name: "add-photo", tone: "disabled" }), _jsxs("div", { className: "flex flex-col gap-1 text-(--color-content-disabled)", children: [_jsx("p", { className: `${text} font-medium`, children: disabledTitle }), disabledMessage && _jsx("p", { className: small, children: disabledMessage })] })] }));
    }
    if (state.status === "uploading") {
        const pct = Math.max(0, Math.min(100, Math.round(state.progress)));
        return (_jsxs("div", { "data-state": "uploading", "aria-live": "polite", className: `${box} border-(--color-border-subtle) bg-(--color-surface-default) py-6 ${className}`.trim(), children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Tile, { name: "attach-file", tone: "raised" }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: `${text} truncate font-medium text-(--color-content-primary)`, children: state.fileName }), state.fileSize !== undefined && _jsx("p", { className: `${small} text-(--color-content-muted)`, children: formatFileSize(state.fileSize) })] }), state.onCancel && (_jsx(IconButton, { label: "Cancel upload", variant: "tertiary", size: "xsm", onClick: state.onCancel, children: _jsx(Glyph, { name: "close", className: "size-4" }) }))] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("div", { role: "progressbar", "aria-label": "Uploading image", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": pct, className: "h-2 w-full overflow-hidden rounded-full bg-(--color-surface-raised)", children: _jsx("div", { className: "h-full rounded-full bg-(--color-action-primary) transition-[width]", style: { width: `${pct}%` } }) }), _jsx("p", { className: `${small} text-(--color-content-secondary)`, children: pct < 100 ? `Uploading ${pct}%` : "Processing…" })] })] }));
    }
    if (state.status === "uploaded") {
        return (_jsxs("div", { "data-state": dragging ? "drag-over" : "uploaded", ...dropProps, className: `${box} py-6 ${dragging ? "border-2 border-(--color-border-primary)" : "border-(--color-border-subtle)"} bg-(--color-surface-default) ${className}`.trim(), children: [fileInput, _jsx("img", { src: state.previewUrl, alt: state.previewAlt ?? "The uploaded image", className: "max-h-56 w-full rounded-(--radius-md) bg-(--color-surface-raised) object-contain" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [state.fileName && _jsx("p", { className: `${text} truncate font-medium text-(--color-content-primary)`, children: state.fileName }), state.fileSize !== undefined && _jsx("p", { className: `${small} text-(--color-content-muted)`, children: formatFileSize(state.fileSize) })] }), _jsx(Button, { variant: "tertiary", size: "sm", onClick: browse, children: "Change image" }), onRemove && (_jsx(IconButton, { label: "Remove image", variant: "tertiary", size: "xsm", onClick: onRemove, children: _jsx(Glyph, { name: "delete", className: "size-4" }) }))] }), localError && (_jsxs("p", { role: "alert", className: `${small} text-(--color-status-error)`, children: [localError.title, ". ", localError.message] }))] }));
    }
    const error = localError ?? (state.status === "error" ? { title: state.title, message: state.message } : null);
    if (error && !dragging) {
        return (_jsxs("div", { "data-state": "error", ...dropProps, className: `${box} items-center border-dashed border-(--color-border-error) bg-(--color-surface-raised) py-8 text-center ${className}`.trim(), children: [fileInput, _jsx(Tile, { name: "error-filled", tone: "error" }), _jsxs("div", { role: "alert", className: "flex flex-col gap-1", children: [_jsx("p", { className: `${text} font-medium text-(--color-content-primary)`, children: error.title }), _jsx("p", { className: `${small} text-(--color-status-error)`, children: error.message })] }), _jsx(Button, { variant: "tertiary", size: "sm", onClick: browse, children: "Choose another image" })] }));
    }
    return (_jsxs("label", { htmlFor: inputId, "data-state": dragging ? "drag-over" : "default", ...dropProps, className: `${box} cursor-pointer items-center py-8 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-border-focus) ${dragging
            ? "border-2 border-(--color-border-primary) bg-(--color-surface-default)"
            : "border-dashed border-(--color-border-input) bg-(--color-surface-raised) hover:border-(--color-border-focus)"} ${className}`.trim(), children: [fileInput, _jsx(Tile, { name: dragging ? "cloud-upload" : "add-photo", tone: dragging ? "link" : "default" }), _jsxs("span", { className: "flex flex-col gap-1", children: [_jsx("span", { className: `${text} font-medium text-(--color-content-primary)`, children: dragging ? ("Drop to upload") : (_jsxs(_Fragment, { children: ["Drag an image here, or", " ", _jsx("span", { className: "text-[var(--color-text-link,var(--color-content-link))] underline underline-offset-2", children: "browse" })] })) }), _jsx("span", { className: `${small} text-(--color-content-muted)`, children: rules })] })] }));
}
