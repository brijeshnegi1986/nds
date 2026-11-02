import { ButtonHTMLAttributes } from "react";
import { iconMask } from "./icons.js";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "plain" | "ghost" | "danger" | "destructive";
export type ButtonSize = "xsm" | "sm" | "md" | "lg";

/**
 * The NDS Button (Figma "Button", node 105:885). Every boxed variant shares
 * the size, the label (14/20 semibold, 0.056px tracking), the 8px gap to an
 * icon, the disabled look (action-disabled fill, border-disabled edge,
 * content-disabled text) and the 2px border-focus ring, 2px out.
 *
 * - primary: the orange call to action, kept for the few that start
 *   something: Create post / Generate post, Sign in and sign-up, and buying
 *   (Start trial, a plan). Never for an ordinary Save or Continue.
 * - secondary: near-black, the action button: a form's or page's main
 *   action (Save, Continue, Approve, Publish), at MD unless it sits in a
 *   compact row. Colours are the --color-action-secondary-* tokens.
 * - tertiary: the light, outlined button for everything else (Back,
 *   Cancel, Edit).
 * - plain: link-coloured text, no fill or border: the app's link colour
 *   when it sets --color-text-link (as ImageUpload's browse does), else
 *   content-link (4.5:1).
 * - ghost: an orange outline on white.
 * - destructive: outlined red (Figma Variant=Destructive): the action's
 *   resting fill, a red edge and red text, the fill tinting red on hover and
 *   press. For anything that can't easily be undone (Delete, Reset,
 *   Disconnect), both the button that opens the confirmation and the one
 *   inside it. Add the trash icon only to Delete.
 * - danger: a red text link. Kept for older callers; prefer destructive,
 *   which is a proper target and matches the rest of the buttons.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-(--color-action-primary) text-(--color-content-on-primary) hover:bg-(--color-action-primary-hover) active:bg-(--color-action-primary-pressed)",
  secondary:
    "border border-(--color-border-subtle) bg-(--color-action-secondary) text-(--color-content-on-secondary) hover:bg-(--color-action-secondary-hover) active:bg-(--color-action-secondary-pressed)",
  tertiary:
    "border border-(--color-border-subtle) bg-(--color-action-tertiary) text-(--color-content-on-tertiary) hover:bg-(--color-action-tertiary-hover) active:bg-(--color-action-tertiary-pressed)",
  plain:
    "text-[var(--color-text-link,var(--color-content-link))] hover:bg-(--color-action-tertiary-hover) active:bg-(--color-action-tertiary-pressed)",
  ghost:
    "border border-(--color-border-primary) bg-(--color-surface-default) text-(--color-content-link) hover:bg-(--color-action-tertiary-hover) active:bg-(--color-action-tertiary-pressed)",
  destructive:
    "border border-(--color-border-error) bg-(--color-action-destructive-subtle) text-(--color-content-destructive) hover:bg-(--color-action-destructive-subtle-hover) active:bg-(--color-action-destructive-subtle-pressed)",
  danger: "text-(--color-status-error) hover:underline disabled:opacity-60",
};

/** The NDS disabled state, for the boxed variants; Plain has no fill to
 * grey out, so only its text goes to the disabled colour. */
const BOXED_DISABLED =
  "disabled:border-(--color-border-disabled) disabled:bg-(--color-action-disabled) disabled:text-(--color-content-disabled)";
const PLAIN_DISABLED = "disabled:text-(--color-content-disabled) disabled:hover:bg-transparent disabled:active:bg-transparent";

/** The design's sizes: XSM 36px (control/height/xsm, for compact rows such
 * as a post card's actions), SM 40px, MD 48px, LG 56px, each with its own
 * padding. */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  xsm: "h-9 px-3",
  sm: "h-10 px-3",
  md: "h-12 px-4",
  lg: "h-14 px-6",
};

/** The red text link keeps the padding it always had. */
const TEXT_ONLY_SIZE_CLASSES: Record<ButtonSize, string> = {
  xsm: "px-3 py-1.5 text-sm",
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-5 text-base",
};

/** The design's progress_activity icon, drawn in the label's colour; 16px
 * (icon-size/xsm) on an XSM button, 20px otherwise. */
function Spinner({ small = false }: { small?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 animate-spin bg-current ${small ? "size-4" : "size-5"}`}
      style={{
        ...iconMask("progress-activity"),
      }}
    />
  );
}

/** A Button's classes, for a link that should look exactly like one (e.g.
 * "Add profile", which goes to a page rather than doing something). */
export function buttonClassName(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  const sized = variant === "danger" ? TEXT_ONLY_SIZE_CLASSES[size] : SIZE_CLASSES[size];
  return `${buttonLookClassName(variant)} ${sized}`;
}

/** A Button's look without its size: the shape, label, focus ring, colours
 * and disabled state (IconButton adds its own 40px square). */
export function buttonLookClassName(variant: ButtonVariant = "primary"): string {
  const boxed =
    variant === "danger"
      ? ""
      : `rounded-full transition-colors font-semibold tracking-[0.056px] text-(length:--type-font-size-body-small) leading-(--type-line-height-body-small) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus) ${variant === "plain" ? PLAIN_DISABLED : BOXED_DISABLED}`;
  return `inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed ${variant === "danger" ? "font-medium" : ""} ${boxed} ${VARIANT_CLASSES[variant]}`
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Callers pairing a label with an icon put both as children: the 8px gap
 * spaces them (flexbox drops a literal space between "Label <span>icon").
 * `loading` is the design's Loading state: a spinner before the label, and
 * the button busy and disabled until it's done.
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean }) {
  return (
    <button
      type="button"
      className={`${buttonClassName(variant, size)} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner small={size === "xsm"} />}
      {children}
    </button>
  );
}
