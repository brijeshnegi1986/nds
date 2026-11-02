import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "./button.js";
import { Dialog } from "./dialog.js";
/** An image ready to draw, from an element or an address (a file's object URL). */
function loadImage(source) {
    if (typeof source !== "string")
        return Promise.resolve(source);
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("The image couldn't be read."));
        image.src = source;
    });
}
/**
 * The part of an image chosen in ImageAdjust (in the image's own pixels),
 * drawn at the shape's size on a white ground and returned as a JPEG, the
 * format every channel takes.
 */
export async function cropImage(source, area, shape, quality = 0.9) {
    const image = await loadImage(source);
    const canvas = document.createElement("canvas");
    canvas.width = shape.width;
    canvas.height = shape.height;
    const context = canvas.getContext("2d");
    if (!context)
        throw new Error("This browser can't adjust images.");
    // JPEG has no transparency: a see-through PNG goes on white, not black.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, shape.width, shape.height);
    context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, shape.width, shape.height);
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The image couldn't be saved."))), "image/jpeg", quality);
    });
}
/**
 * Adjust an image before it's used (NegiFlow decision 8.12): the image in a
 * frame of the chosen shape, dragged to position and zoomed (pinch, the
 * wheel or the slider), then cropped to that shape's pixels as a JPEG and
 * handed to `onSave`. With two or more shapes, a choice between them; the
 * first is chosen to start. Save waits until the image has loaded.
 */
export function ImageAdjust({ open, src, shapes, title = "Adjust image", saving = false, onSave, onCancel, }) {
    const [shapeId, setShapeId] = useState(shapes[0]?.id);
    const shape = shapes.find((s) => s.id === shapeId) ?? shapes[0];
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [area, setArea] = useState(null);
    const [cropping, setCropping] = useState(false);
    const [error, setError] = useState(null);
    const busy = saving || cropping;
    async function save() {
        if (!area || !shape)
            return;
        setCropping(true);
        setError(null);
        try {
            onSave(await cropImage(src, area, shape), shape);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "The image couldn't be saved.");
        }
        finally {
            setCropping(false);
        }
    }
    return (_jsx(Dialog, { open: open, onClose: onCancel, title: title, size: "md", description: shape ? `Drag to position, zoom to fit. Saved at ${shape.width} × ${shape.height} px.` : undefined, actions: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "tertiary", onClick: onCancel, disabled: busy, children: "Cancel" }), _jsx(Button, { variant: "secondary", onClick: () => void save(), disabled: !area || busy, children: busy ? "Saving…" : "Save image" })] }), children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("div", { className: "relative h-80 overflow-hidden rounded-(--radius-md) bg-(--color-background-muted)", children: shape && (_jsx(Cropper, { image: src, crop: crop, zoom: zoom, minZoom: 1, maxZoom: 3, aspect: shape.width / shape.height, onCropChange: setCrop, onZoomChange: setZoom, onCropComplete: (_, pixels) => setArea(pixels) })) }), shapes.length > 1 && (_jsx("div", { role: "group", "aria-label": "Shape", className: "flex flex-wrap gap-2", children: shapes.map((s) => (_jsx(Button, { type: "button", size: "sm", variant: s.id === shape?.id ? "secondary" : "tertiary", "aria-pressed": s.id === shape?.id, onClick: () => {
                            setShapeId(s.id);
                            setCrop({ x: 0, y: 0 });
                            setZoom(1);
                        }, children: `${s.label} ${s.ratio}` }, s.id))) })), _jsxs("label", { className: "flex items-center gap-3 text-(length:--type-font-size-body-small) text-(--color-content-secondary)", children: [_jsx("span", { "aria-hidden": true, children: "Zoom" }), _jsx("input", { type: "range", "aria-label": "Zoom", min: 1, max: 3, step: 0.05, value: zoom, onChange: (e) => setZoom(Number(e.target.value)), className: "flex-1 accent-(--color-action-secondary)" })] }), error && (_jsx("p", { role: "alert", className: "text-(length:--type-font-size-body-small) text-(--color-status-error)", children: error }))] }) }));
}
