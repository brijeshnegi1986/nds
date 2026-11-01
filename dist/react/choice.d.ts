import { type ReactNode } from "react";
export type RadioTileOption = {
    value: string;
    title: string;
    /** One line under the title saying what picking it means. */
    description: string;
    /** Shown inside the tile only while it's picked (e.g. a follow-up tick-box). */
    extra?: ReactNode;
};
/**
 * A required single choice as NDS Radio tiles (Figma "Radio", Type=Tile): a
 * white tile with the sm elevation, a border in the selected colour when picked, and the
 * focus ring around the tile. The design's tile has a caption-size label
 * only; these add a line of description under a 14px title, since the
 * choices here need explaining. The whole tile picks its option.
 */
export declare function RadioTiles({ legend, name, value, onChange, options, }: {
    legend: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: RadioTileOption[];
}): import("react").JSX.Element;
/**
 * The NDS Checkbox (Figma "Checkboxes", Variant=Basic): a 20px box with a
 * 4px radius in border-strong, filled in the selected colour with a tick (or, part-selected,
 * a bar) in --color-control-on-selected when checked, and the 2px border-focus ring.
 * Disabled and error states as in Figma. Label at 14px, with an optional
 * hint under it linked by aria-describedby; without a visible label, give it
 * an aria-label.
 */
export declare function Checkbox({ label, hint, checked, onChange, disabled, indeterminate, invalid, "aria-label": ariaLabel, }: {
    label?: ReactNode;
    hint?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    /** Some, not all, of a group are chosen (e.g. "Select all"). */
    indeterminate?: boolean;
    invalid?: boolean;
    "aria-label"?: string;
}): import("react").JSX.Element;
/**
 * The NDS Radio (Figma "Radio", Type=Basic): the radio dot with a label and,
 * optionally, a line of description under it (linked by aria-describedby).
 * Group several inside a fieldset with a legend.
 */
export declare function Radio({ name, checked, onChange, label, description, disabled, }: {
    name: string;
    checked: boolean;
    onChange: () => void;
    label: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
}): import("react").JSX.Element;
