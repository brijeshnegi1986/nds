import { ReactNode } from "react";
export declare function Field({ label, required, hint, error, counter, children, }: {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string | null;
    /** e.g. "12/100", shown under the control on the right. */
    counter?: string;
    /** Receives the ids the control must use. */
    children: (ids: {
        inputId: string;
        describedBy: string | undefined;
        invalid: boolean;
    }) => ReactNode;
}): import("react").JSX.Element;
/** A text field: 48px, or 40px at `size="sm"` for dense tools (admin
 * tables, toolbars). `size` here is the NDS size, not HTML's character width.
 * The 40px comes from styles.css (data-size="sm"): its native-field rule is
 * unlayered, so a height utility alone can't win. */
export declare function TextInput({ size, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
    size?: "md" | "sm";
}): import("react").JSX.Element;
/** The NDS field look for a raw input, textarea or select that can't use
 * TextInput/TextArea: white fill, the input border, 16px text, a 24px corner
 * (V4: a text area's corner matches the 48px pill that single-line inputs and
 * selects become in styles.css), border-focus
 * on hover and as the focus ring, and the error and disabled states. */
export declare const FIELD_CONTROL_CLASS = "w-full border border-(--color-border-input) bg-(--color-surface-default) px-3 text-base text-(--color-content-primary) placeholder:text-(--color-content-muted) rounded-[24px] py-3 transition-colors hover:border-(--color-border-focus) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus) aria-[invalid=true]:border-(--color-border-error) disabled:border-(--color-border-disabled) disabled:bg-(--color-action-disabled) disabled:text-(--color-content-disabled)";
/** A text area: the field look with a 24px corner, the same corner as the
 * 48px pill inputs beside it (V4), so a form's fields share one shape. */
export declare function TextArea(props: React.ComponentProps<"textarea">): import("react").JSX.Element;
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
export declare function Chip({ selected, onClick, children, role, size, }: {
    /** Leave out for a suggestion chip, which is an action, not a toggle. */
    selected?: boolean;
    onClick: () => void;
    children: ReactNode;
    role?: "radio";
    size?: "sm" | "md" | "lg";
}): import("react").JSX.Element;
export declare function ActionButton({ children, disabled, type, onClick, }: {
    children: ReactNode;
    disabled?: boolean;
    type?: "submit" | "button";
    onClick?: () => void;
}): import("react").JSX.Element;
export declare const TERTIARY_BUTTON_CLASS: string;
