"use client";

import { ReactNode, useId } from "react";
import { buttonClassName } from "./button.js";
import { iconMask } from "./icons.js";

/** Shared NDS form controls for the settings and onboarding frames: a
 * labelled field with an optional hint and inline error, a text input, a
 * textarea with a character count, toggle chips, and the full-width
 * buttons: the form's black action button (Save, Continue) and the light one
 * beside it (Do this later). Orange is kept for calls to action like Create
 * post and Sign in (ui/button.tsx). Errors are linked with aria-describedby. */

//: The NDS body-small size (14/20) for a field's label, hint and error,
//: as in Figma's Input (105:1671).
const FIELD_TEXT = "text-(length:--type-font-size-body-small) leading-(--type-line-height-body-small)";

export function Field({
  label,
  required = false,
  hint,
  error,
  counter,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  /** e.g. "12/100", shown under the control on the right. */
  counter?: string;
  /** Receives the ids the control must use. */
  children: (ids: { inputId: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={inputId} className={`${FIELD_TEXT} font-medium text-(--color-content-primary)`}>
        {label}
        {required && (
          <>
            <span aria-hidden className="text-(--color-status-error)"> *</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {hint && (
        <p id={hintId} className={`-mt-1 ${FIELD_TEXT} text-(--color-content-muted)`}>
          {hint}
        </p>
      )}
      {children({ inputId, describedBy, invalid: Boolean(error) })}
      {(error || counter) && (
        <div className="flex items-start justify-between gap-3">
          {error ? (
            <p id={errorId} role="alert" className={`${FIELD_TEXT} text-(--color-status-error)`}>
              {error}
            </p>
          ) : (
            <span />
          )}
          {counter && <span className="shrink-0 text-xs text-(--color-content-muted)">{counter}</span>}
        </div>
      )}
    </div>
  );
}

//: NDS fields (Figma 127:3439): `surface-default` on `border-(--color-border-input)`, 12px
//: in. Single-line inputs get their pill, hover, focus ring and error colour
//: from globals.css; the textarea's are below (an 8px corner, not a pill).
const CONTROL_BASE =
  "w-full border border-(--color-border-input) bg-(--color-surface-default) px-3 text-base text-(--color-content-primary) placeholder:text-(--color-content-muted)";

/** A text field: 48px, or 40px at `size="sm"` for dense tools (admin
 * tables, toolbars). `size` here is the NDS size, not HTML's character width.
 * The 40px comes from styles.css (data-size="sm"): its native-field rule is
 * unlayered, so a height utility alone can't win. */
export function TextInput({
  size = "md",
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & { size?: "md" | "sm" }) {
  return (
    <input
      {...props}
      data-size={size === "sm" ? "sm" : undefined}
      className={`${CONTROL_BASE} ${size === "sm" ? "h-10" : "h-12"} ${props.className ?? ""}`}
    />
  );
}

/** The NDS field look for a raw input, textarea or select that can't use
 * TextInput/TextArea: white fill, the input border, 16px text, a 24px corner
 * (V4: a text area's corner matches the 48px pill that single-line inputs and
 * selects become in styles.css), border-focus
 * on hover and as the focus ring, and the error and disabled states. */
export const FIELD_CONTROL_CLASS = `${CONTROL_BASE} rounded-[24px] py-3 transition-colors hover:border-(--color-border-focus) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus) aria-[invalid=true]:border-(--color-border-error) disabled:border-(--color-border-disabled) disabled:bg-(--color-action-disabled) disabled:text-(--color-content-disabled)`;

/** A text area: the field look with a 24px corner, the same corner as the
 * 48px pill inputs beside it (V4), so a form's fields share one shape. */
export function TextArea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`${FIELD_CONTROL_CLASS} min-h-21.5 resize-y ${props.className ?? ""}`}
    />
  );
}

/** The NDS chip (Figma "Chip", 641:1505): a pill on action-secondary with a
 * border-subtle edge; hover action-secondary-hover; selected is
 * action-secondary-pressed with the orange tick before the label. SM 30px
 * (8px in, caption 12/16), MD 36px and LG 44px (12px in, 14/20); a
 * one-letter option is never narrower than it is tall. Those heights are
 * minimums: a label too long for the row wraps and the chip grows taller
 * (its corners stay the one-line pill's), never wider than its container, so
 * it can't spill over the chips around it on a phone.
 *
 * Three kinds, by what tapping does:
 * - toggle (`selected` given): switches an option on or off, aria-pressed,
 *   with the tick when on (a filter, or picking several audiences);
 * - single choice (`role="radio"` inside a radiogroup);
 * - suggestion (no `selected`): a one-off action such as starting a post
 *   from a topic. A plain button, with no on/off state to announce. */
export function Chip({
  selected,
  onClick,
  children,
  role,
  size = "md",
}: {
  /** Leave out for a suggestion chip, which is an action, not a toggle. */
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
  role?: "radio";
  size?: "sm" | "md" | "lg";
}) {
  const sized =
    size === "sm"
      ? "min-h-7.5 min-w-7.5 rounded-[15px] px-2 py-1 text-(length:--type-font-size-caption) leading-(--type-line-height-caption)"
      : `${size === "lg" ? "min-h-11 min-w-11 rounded-[22px] py-2.5" : "min-h-9 min-w-9 rounded-[18px] py-1.5"} px-3 text-(length:--type-font-size-body-small) leading-(--type-line-height-body-small)`;
  return (
    <button
      type="button"
      onClick={onClick}
      role={role}
      aria-pressed={role || selected === undefined ? undefined : selected}
      aria-checked={role ? Boolean(selected) : undefined}
      className={`inline-flex max-w-full items-center justify-center gap-1 border border-(--color-border-subtle) text-left [overflow-wrap:anywhere] text-(--color-content-primary) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus) ${sized} ${
        selected
          ? "bg-(--color-action-tertiary-pressed)"
          : "bg-(--color-action-tertiary) hover:bg-(--color-action-tertiary-hover)"
      }`}
    >
      {selected && (
        <span aria-hidden data-icon="check" className="inline-block size-5 shrink-0 bg-(--color-action-primary)" style={iconMask("check")} />
      )}
      {children}
    </button>
  );
}

export function ActionButton({
  children,
  disabled,
  type = "submit",
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${buttonClassName("secondary", "md")} w-full`}
    >
      {children}
    </button>
  );
}

export const TERTIARY_BUTTON_CLASS = `${buttonClassName("tertiary", "md")} w-full`;
