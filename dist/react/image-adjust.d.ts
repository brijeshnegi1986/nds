/** A shape an image can be cropped to, and the pixels it's saved at. */
export type ImageShape = {
    id: string;
    /** "Portrait", "Square", "Landscape". */
    label: string;
    /** How it's written: "4:5", "1.91:1". */
    ratio: string;
    width: number;
    height: number;
};
export type CropArea = {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * The part of an image chosen in ImageAdjust (in the image's own pixels),
 * drawn at the shape's size on a white ground and returned as a JPEG, the
 * format every channel takes.
 */
export declare function cropImage(source: HTMLImageElement | string, area: CropArea, shape: ImageShape, quality?: number): Promise<Blob>;
/**
 * Adjust an image before it's used (NegiFlow decision 8.12): the image in a
 * frame of the chosen shape, dragged to position and zoomed (pinch, the
 * wheel or the slider), then cropped to that shape's pixels as a JPEG and
 * handed to `onSave`. With two or more shapes, a choice between them; the
 * first is chosen to start. Save waits until the image has loaded.
 */
export declare function ImageAdjust({ open, src, shapes, title, saving, onSave, onCancel, }: {
    open: boolean;
    /** The image's address, e.g. a chosen file's object URL. */
    src: string;
    /** At least one; the first is chosen to start. */
    shapes: ImageShape[];
    title?: string;
    /** The caller is uploading what was saved. */
    saving?: boolean;
    onSave: (image: Blob, shape: ImageShape) => void;
    onCancel: () => void;
}): import("react").JSX.Element;
