/**
 * The small play mark on a video's picture wherever posts are listed (a
 * calendar, a post list), so a video doesn't pass for a photo. Named "Video"
 * for screen readers; it sits over the bottom-left corner of a `relative`
 * parent. `className` sets its size (default `size-5`).
 */
export function VideoMark({ className = "size-5" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Video"
      data-part="video-mark"
      className={`pointer-events-none absolute bottom-1 left-1 inline-flex items-center justify-center rounded-full bg-(--color-surface-default) text-(--color-content-primary) shadow-sm ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[70%]" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}
