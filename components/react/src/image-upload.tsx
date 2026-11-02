"use client";

import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Button } from "./button.js";
import { IconButton } from "./icon-button.js";
import { iconMask, type IconName } from "./icons.js";

/** Where an upload is, as the page that owns it knows it. The component
 * itself only adds the drag-over look and its own checks on the file. */
export type ImageUploadState =
  | { status: "idle" }
  | { status: "uploading"; fileName: string; fileSize?: number; progress: number; onCancel?: () => void }
  | { status: "uploaded"; fileName?: string; fileSize?: number; previewUrl: string; previewAlt?: string }
  | { status: "error"; title: string; message: ReactNode };

/** "2.4 MB", "640 KB". */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function Glyph({ name, className }: { name: IconName; className: string }) {
  return <span aria-hidden className={`inline-block shrink-0 bg-current ${className}`} style={iconMask(name)} />;
}

function Tile({ name, tone = "default" }: { name: IconName; tone?: "default" | "link" | "error" | "disabled" | "raised" }) {
  const look = {
    default: "bg-(--color-surface-default) text-(--color-content-secondary)",
    raised: "bg-(--color-surface-raised) text-(--color-content-secondary)",
    link: "bg-(--color-surface-raised) text-(--color-content-link)",
    error: "bg-(--color-status-error-subtle) text-(--color-status-error)",
    disabled: "bg-(--color-surface-default) text-(--color-content-disabled)",
  }[tone];
  return (
    <span data-part="icon" data-icon={name} aria-hidden className={`flex size-12 shrink-0 items-center justify-center rounded-full ${look}`}>
      <Glyph name={name} className="size-6" />
    </span>
  );
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
export function ImageUpload({
  state,
  onFile,
  onRemove,
  accept = "image/jpeg,image/png,image/webp",
  typesLabel = "JPG, PNG or WebP",
  maxBytes = 8 * 1024 * 1024,
  disabled = false,
  disabledTitle = "Image uploads are off",
  disabledMessage,
  inputLabel = "Add an image",
  className = "",
}: {
  state: ImageUploadState;
  onFile: (file: File) => void;
  onRemove?: () => void;
  accept?: string;
  /** How the accepted types read in the rules line. */
  typesLabel?: string;
  maxBytes?: number;
  disabled?: boolean;
  disabledTitle?: string;
  disabledMessage?: ReactNode;
  /** The file input's accessible name. */
  inputLabel?: string;
  className?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<{ title: string; message: string } | null>(null);
  const limit = formatFileSize(maxBytes);
  const rules = `${typesLabel}, up to ${limit}`;
  const types = accept.split(",").map((t) => t.trim().toLowerCase());

  function take(file: File | undefined) {
    if (!file) return;
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
        onDragEnter: (e: DragEvent) => {
          e.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        },
        onDragOver: (e: DragEvent) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        },
        onDragLeave: () => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragging(false);
        },
        onDrop: (e: DragEvent) => {
          e.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          take(e.dataTransfer.files?.[0]);
        },
      }
    : {};

  const fileInput = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept={accept}
      aria-label={inputLabel}
      disabled={disabled}
      className="sr-only"
      onChange={(e) => {
        take(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  const box = "flex w-full flex-col gap-3 rounded-(--radius-lg) border px-6";
  const text = "text-(length:--type-font-size-body-small) leading-(--type-line-height-body-small)";
  const small = "text-(length:--type-font-size-caption) leading-(--type-line-height-caption)";

  if (disabled) {
    return (
      <div data-state="disabled" className={`${box} items-center border-dashed border-(--color-border-disabled) bg-(--color-action-disabled) py-8 text-center ${className}`.trim()}>
        <Tile name="add-photo" tone="disabled" />
        <div className="flex flex-col gap-1 text-(--color-content-disabled)">
          <p className={`${text} font-medium`}>{disabledTitle}</p>
          {disabledMessage && <p className={small}>{disabledMessage}</p>}
        </div>
      </div>
    );
  }

  if (state.status === "uploading") {
    const pct = Math.max(0, Math.min(100, Math.round(state.progress)));
    return (
      <div data-state="uploading" aria-live="polite" className={`${box} border-(--color-border-subtle) bg-(--color-surface-default) py-6 ${className}`.trim()}>
        <div className="flex items-center gap-3">
          <Tile name="attach-file" tone="raised" />
          <div className="min-w-0 flex-1">
            <p className={`${text} truncate font-medium text-(--color-content-primary)`}>{state.fileName}</p>
            {state.fileSize !== undefined && <p className={`${small} text-(--color-content-muted)`}>{formatFileSize(state.fileSize)}</p>}
          </div>
          {state.onCancel && (
            <IconButton label="Cancel upload" variant="tertiary" size="xsm" onClick={state.onCancel}>
              <Glyph name="close" className="size-4" />
            </IconButton>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div
            role="progressbar"
            aria-label="Uploading image"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            className="h-2 w-full overflow-hidden rounded-full bg-(--color-surface-raised)"
          >
            <div className="h-full rounded-full bg-(--color-action-primary) transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <p className={`${small} text-(--color-content-secondary)`}>{pct < 100 ? `Uploading ${pct}%` : "Processing…"}</p>
        </div>
      </div>
    );
  }

  if (state.status === "uploaded") {
    return (
      <div
        data-state={dragging ? "drag-over" : "uploaded"}
        {...dropProps}
        className={`${box} py-6 ${dragging ? "border-2 border-(--color-border-primary)" : "border-(--color-border-subtle)"} bg-(--color-surface-default) ${className}`.trim()}
      >
        {fileInput}
        <img
          src={state.previewUrl}
          alt={state.previewAlt ?? "The uploaded image"}
          className="max-h-56 w-full rounded-(--radius-md) bg-(--color-surface-raised) object-contain"
        />
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {state.fileName && <p className={`${text} truncate font-medium text-(--color-content-primary)`}>{state.fileName}</p>}
            {state.fileSize !== undefined && <p className={`${small} text-(--color-content-muted)`}>{formatFileSize(state.fileSize)}</p>}
          </div>
          <Button variant="tertiary" size="sm" onClick={browse}>
            Change image
          </Button>
          {onRemove && (
            <IconButton label="Remove image" variant="tertiary" size="xsm" onClick={onRemove}>
              <Glyph name="delete" className="size-4" />
            </IconButton>
          )}
        </div>
        {localError && (
          <p role="alert" className={`${small} text-(--color-status-error)`}>
            {localError.title}. {localError.message}
          </p>
        )}
      </div>
    );
  }

  const error = localError ?? (state.status === "error" ? { title: state.title, message: state.message } : null);

  if (error && !dragging) {
    return (
      <div
        data-state="error"
        {...dropProps}
        className={`${box} items-center border-dashed border-(--color-border-error) bg-(--color-surface-raised) py-8 text-center ${className}`.trim()}
      >
        {fileInput}
        <Tile name="error-filled" tone="error" />
        <div role="alert" className="flex flex-col gap-1">
          <p className={`${text} font-medium text-(--color-content-primary)`}>{error.title}</p>
          <p className={`${small} text-(--color-status-error)`}>{error.message}</p>
        </div>
        <Button variant="tertiary" size="sm" onClick={browse}>
          Choose another image
        </Button>
      </div>
    );
  }

  return (
    <label
      htmlFor={inputId}
      data-state={dragging ? "drag-over" : "default"}
      {...dropProps}
      className={`${box} cursor-pointer items-center py-8 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-border-focus) ${
        dragging
          ? "border-2 border-(--color-border-primary) bg-(--color-surface-default)"
          : "border-dashed border-(--color-border-input) bg-(--color-surface-raised) hover:border-(--color-border-focus)"
      } ${className}`.trim()}
    >
      {fileInput}
      <Tile name={dragging ? "cloud-upload" : "add-photo"} tone={dragging ? "link" : "default"} />
      <span className="flex flex-col gap-1">
        <span className={`${text} font-medium text-(--color-content-primary)`}>
          {dragging ? (
            "Drop to upload"
          ) : (
            <>
              Drag an image here, or{" "}
              {/* The app's link colour if it sets one (--color-text-link), NDS's otherwise. */}
              <span className="text-[var(--color-text-link,var(--color-content-link))] underline underline-offset-2">browse</span>
            </>
          )}
        </span>
        <span className={`${small} text-(--color-content-muted)`}>{rules}</span>
      </span>
    </label>
  );
}
