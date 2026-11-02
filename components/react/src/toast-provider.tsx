"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { PlainLink, type LinkComponent } from "./breadcrumbs.js";
import { iconMask, type IconName } from "./icons.js";

/** "danger" and "muted" are the older names for error and neutral. */
type ToastTone = "success" | "danger" | "warning" | "info" | "muted";
/** A link after the message, to where the outcome can be seen. */
type ToastAction = { label: string; href: string };
/** persist: stays until closed, for something the person needs to read
 * (a failure and its reason), rather than disappearing on a timer. */
type ToastOptions = { persist?: boolean };
type Toast = { id: number; message: string; tone: ToastTone; action?: ToastAction; persist: boolean };

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone, action?: ToastAction, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** The NDS Toast (Figma 857:3101): the status colour as a solid fill with
 * a 1px edge, the message in 14/20 medium in the fill's light text colour
 * (warning uses content-inverse, as orange-100 on amber-700 is under 4.5:1),
 * then a divider, the action and the close button in that same colour.
 * Neutral is the light tertiary fill with primary text. */
const TONES: Record<ToastTone, { classes: string; icon: IconName; close: string }> = {
  success: { classes: "border-(--color-border-success) bg-(--color-status-success) text-(--color-status-success-subtle)", icon: "check-circle-filled", close: "" },
  danger: { classes: "border-(--color-border-error) bg-(--color-status-error) text-(--color-status-error-subtle)", icon: "error-filled", close: "" },
  warning: { classes: "border-(--color-border-warning) bg-(--color-status-warning) text-(--color-content-inverse)", icon: "warning-filled", close: "" },
  info: { classes: "border-(--color-border-info) bg-(--color-status-info) text-(--color-status-info-subtle)", icon: "info-filled", close: "" },
  muted: { classes: "border-(--color-border-strong) bg-(--color-action-tertiary) text-(--color-content-primary)", icon: "info", close: "text-(--color-content-secondary)" },
};

/**
 * Toasts: mount ToastProvider once near the root and call
 * useToast().showToast(...) from any client component.
 * Auto-dismisses after 4s (6s with a link, to leave time to use it); the
 * close button dismisses it sooner. A toast shown with { persist: true }
 * stays until closed, and a persistent failure is announced as an alert.
 */
export function ToastProvider({
  children,
  linkAs: LinkAs = PlainLink,
}: {
  children: React.ReactNode;
  /** The app's router link for a toast's action (default: a plain <a>). */
  linkAs?: LinkComponent;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "muted", action?: ToastAction, options?: ToastOptions) => {
      const id = nextId.current++;
      const persist = Boolean(options?.persist);
      setToasts((prev) => [...prev, { id, message, tone, action, persist }]);
      if (!persist) setTimeout(() => dismiss(id), action ? 6000 : 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* 16px up, or as far as the app's --nds-toast-offset says (a phone's
          bottom bar, so toasts sit above it rather than under it). */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[var(--nds-toast-offset,1rem)] z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.persist && t.tone === "danger" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full max-w-[390px] items-center gap-2 rounded-(--radius-md) border px-4 py-2 text-(length:--type-font-size-body-small) leading-(--type-line-height-body-small) font-medium ${TONES[t.tone].classes}`}
          >
            <span data-part="icon" data-icon={TONES[t.tone].icon} aria-hidden className="inline-block size-5 shrink-0 self-start bg-current" style={iconMask(TONES[t.tone].icon)} />
            <span className="min-w-0 flex-1">{t.message}</span>
            {t.action && (
              <>
                <span data-part="divider" aria-hidden className="h-5 w-px shrink-0 bg-(--color-border-subtle)" />
                <LinkAs
                  href={t.action.href}
                  className="shrink-0 rounded-sm text-(length:--type-font-size-caption) leading-(--type-line-height-caption) font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                  {t.action.label}
                </LinkAs>
              </>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className={`-mr-1 flex size-6 shrink-0 items-center justify-center rounded-full opacity-90 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${TONES[t.tone].close}`}
            >
              <span aria-hidden data-icon="close" className="inline-block size-5 bg-current" style={iconMask("close")} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
