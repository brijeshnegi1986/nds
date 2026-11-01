/**
 * The end of a settings form: a line, then Save on the right with Cancel
 * before it. Save is the black Secondary (saving isn't a call to action);
 * Cancel is Tertiary and shows only when `onCancel` is given, so a form
 * passes it when there are changes to undo. While saving, Save shows the
 * Loading state and Cancel waits.
 */
export declare function FormFooter({ saving, saveLabel, onCancel, cancelLabel, divider, className, }: {
    saving?: boolean;
    saveLabel?: string;
    /** Undo the unsaved changes. Leave it out when there are none. */
    onCancel?: () => void;
    cancelLabel?: string;
    /** The line above; drop it when the form already ends on an edge. */
    divider?: boolean;
    className?: string;
}): import("react").JSX.Element;
